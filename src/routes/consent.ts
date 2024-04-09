import { randomUUID } from 'crypto'
import { Hono } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { clients } from '../data/clients'
import { users } from '../data/users'
import { AuthorizationCode } from '../oauth2/authorizationCode'
import { createAuthorizationRequestErrorResponseUrl } from '../oauth2/createAuthorizationRequestErrorResponseUrl'
import { createAuthorizationResponseUrl } from '../oauth2/createAuthorizationResponseUrl'
import { authorizationCodeStore } from '../stores/authorizationCodeStore'
import { authorizationRequestStore } from '../stores/authorizationRequestStore'
import { ConsentView } from '../views/ConsentView'
import { ErrorView } from '../views/ErrorView'

const consentRoute = new Hono()

const cookieValidator = validator('cookie', (_, c) => {
  const authorizationRequestKey = getCookie(c, 'authorization_request_key')

  if (!authorizationRequestKey) {
    return c.html(ErrorView({ message: '認可リクエストが存在しません。' }))
  }

  const authorizationRequest = authorizationRequestStore.get(
    authorizationRequestKey,
  )

  if (authorizationRequest === undefined) {
    return c.html(ErrorView({ message: '認可リクエストが存在しません。' }))
  }

  const client = clients.find(
    (client) => client.id === authorizationRequest.clientId,
  )

  if (client === undefined) {
    return c.html(ErrorView({ message: 'クライアントが存在しません。' }))
  }

  const loginUser = getCookie(c, 'login_user')

  if (!loginUser) {
    return c.html(ErrorView({ message: '未ログインです。' }))
  }

  const user = users.find((user) => user.name === loginUser)

  if (user === undefined) {
    return c.html(ErrorView({ message: '未ログインです。' }))
  }

  return { authorizationRequest, user, client }
})

consentRoute.get('/consent', cookieValidator, (c) => {
  const { authorizationRequest, user, client } = c.req.valid('cookie')

  return c.html(
    ConsentView({
      clientNmae: client.name,
      username: user.name,
      scope: authorizationRequest.scope,
    }),
  )
})

consentRoute.post(
  '/consent',
  cookieValidator,
  validator('form', (value, c) => {
    const action = value['action']

    if (!action || typeof action !== 'string') {
      return c.html(ErrorView({ message: 'リクエストが不正です。' }))
    }

    switch (action) {
      case 'accept':
      case 'cancel':
        return action
      default:
        return c.html(ErrorView({ message: '不明なアクションです。' }))
    }
  }),
  (c) => {
    const { authorizationRequest, user } = c.req.valid('cookie')
    const action = c.req.valid('form')

    authorizationRequestStore.delete(authorizationRequest.key)
    deleteCookie(c, 'authorization_request_key')

    switch (action) {
      case 'accept': {
        const authorizationCode: AuthorizationCode = {
          code: randomUUID(),
          subject: user.name,
          authorizationRequest,
        }

        authorizationCodeStore.set(authorizationCode)

        return c.redirect(
          createAuthorizationResponseUrl({
            redirectUri: authorizationRequest.redirectUri,
            code: authorizationCode.code,
            state: authorizationRequest.state,
          }),
        )
      }
      case 'cancel': {
        return c.redirect(
          createAuthorizationRequestErrorResponseUrl({
            redirectUri: authorizationRequest.redirectUri,
            errorCode: 'access_denied',
            state: authorizationRequest.state,
          }),
        )
      }
      default:
        throw new Error(action satisfies never)
    }
  },
)

export { consentRoute }
