import { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

type cookieBasedSessionOption = { cookieName: string }

export const cookieBasedSession = (
  option: cookieBasedSessionOption,
): MiddlewareHandler => {
  return createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, option.cookieName)
    await next()
  })
}
