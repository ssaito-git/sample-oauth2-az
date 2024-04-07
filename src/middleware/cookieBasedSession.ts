import { randomUUID } from 'crypto'
import { MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { CookieOptions } from 'hono/utils/cookie'

export type SessionData<T> = {
  value: T
  id: string
  expires: number
}

type SessionStore<T> = {
  set: (data: SessionData<T>) => void
  get: (id: string) => SessionData<T> | undefined
  delete: (id: string) => void
  updateExpires: (id: string, expires: number) => void
}

type cookieBasedSessionOption<T> = {
  cookieName: string
  cookieOptions: CookieOptions
  expirationDuration: number
  sessionStore: SessionStore<T>
}

export const makeSessionStore = <T>(sessionStore: SessionStore<T>) => {
  return sessionStore
}

export const makeInMemorySessionStore = <T>(): SessionStore<T> => {
  const sessionDataMap = new Map<string, SessionData<T>>()

  return {
    set(data) {
      sessionDataMap.set(data.id, data)
    },
    get(id) {
      return sessionDataMap.get(id)
    },
    delete(id) {
      sessionDataMap.delete(id)
    },
    updateExpires(id, expires) {
      const sessionData = sessionDataMap.get(id)
      if (sessionData !== undefined) {
        sessionData.expires = expires
      }
    },
  }
}

export const cookieBasedSession = <T>(
  option: cookieBasedSessionOption<T>,
): MiddlewareHandler<{
  Variables: { sessionData?: T; set: (value: T) => void; clear: () => void }
}> => {
  return createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, option.cookieName)
    const currentSessionData = sessionId
      ? option.sessionStore.get(sessionId)
      : undefined

    c.set('set', (value) => {
      if (
        currentSessionData === undefined ||
        currentSessionData.expires < Math.floor(Date.now() / 1000)
      ) {
        const id = randomUUID()

        option.sessionStore.set({
          id,
          expires: Math.floor(Date.now() / 1000) + option.expirationDuration,
          value,
        })

        setCookie(c, option.cookieName, id, {
          ...option.cookieOptions,
          maxAge: option.expirationDuration,
        })
      } else {
        option.sessionStore.set({
          id: currentSessionData.id,
          expires: Math.floor(Date.now() / 1000) + option.expirationDuration,
          value,
        })
      }
    })

    c.set('clear', () => {
      if (currentSessionData !== undefined) {
        option.sessionStore.delete(currentSessionData.id)
        deleteCookie(c, option.cookieName)
      }
    })

    if (sessionId === undefined) {
      await next()
      return
    }

    if (currentSessionData === undefined) {
      // セッションが存在しなければ次の処理に移る
      await next()
      return
    }

    if (currentSessionData.expires < Math.floor(Date.now() / 1000)) {
      // セッションが期限切れの場合は削除して次の処理に移る
      option.sessionStore.delete(currentSessionData.id)
      deleteCookie(c, option.cookieName)
      await next()
      return
    }

    c.set('sessionData', currentSessionData.value)

    await next()

    const latestSessionData = option.sessionStore.get(sessionId)

    if (latestSessionData !== undefined) {
      option.sessionStore.updateExpires(
        latestSessionData.id,
        Math.floor(Date.now() / 1000) + option.expirationDuration,
      )

      setCookie(c, option.cookieName, latestSessionData.id, {
        ...option.cookieOptions,
        maxAge: option.expirationDuration,
      })
    }
  })
}
