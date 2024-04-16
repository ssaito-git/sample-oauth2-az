import { randomUUID } from 'crypto'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { clients } from '../data/clients'
import { AuthorizationRequest } from '../oauth2/authorizationRequest'
import { createAuthorizationRequestErrorResponseUrl } from '../oauth2/createAuthorizationRequestErrorResponseUrl'
import { authorizationRequestStore } from '../stores/authorizationRequestStore'
import { ErrorView } from '../views/ErrorView'

const authorizationRoute = new Hono()

/**
 * 認可リクエストのバリデーター
 */
const authorizationRequestValidator = validator('query', (_, c) => {
  // クライアント ID
  const clientId = c.req.query('client_id')

  if (clientId === undefined) {
    return c.html(
      ErrorView({ message: 'client_id がパラメーターに含まれていません。' }),
    )
  }

  const client = clients.find((client) => client.id === clientId)

  if (client === undefined) {
    return c.html(ErrorView({ message: 'クライアントが存在しません。' }))
  }

  // リダイレクト URI
  const redirectUri = c.req.query('redirect_uri')

  if (redirectUri === undefined) {
    return c.html(
      ErrorView({
        message: 'redirect_uri がパラメーターに含まれていません。',
      }),
    )
  }

  if (!client.redirectUris.includes(redirectUri)) {
    return c.html(
      ErrorView({ message: 'リダイレクト URI が登録されていません。' }),
    )
  }

  // ステート
  const state = c.req.query('state')

  // レスポンスタイプ
  const responseType = c.req.query('response_type')

  if (responseType === undefined) {
    return c.redirect(
      createAuthorizationRequestErrorResponseUrl({
        redirectUri,
        errorCode: 'invalid_request',
        errorDescription: "'response_type' required.",
        state,
      }),
    )
  }

  if (responseType !== 'code') {
    return c.redirect(
      createAuthorizationRequestErrorResponseUrl({
        redirectUri,
        errorCode: 'invalid_request',
        errorDescription: "'response_type' unknown value.",
        state,
      }),
    )
  }

  // スコープ
  const scope = c.req.query('scope')?.split(' ')

  if (
    scope !== undefined &&
    !scope.every((value) => client.scope.includes(value))
  ) {
    return c.redirect(
      createAuthorizationRequestErrorResponseUrl({
        redirectUri,
        errorCode: 'invalid_scope',
        errorDescription: "'scope' unknown value.",
        state,
      }),
    )
  }

  return {
    clientId,
    redirectUri,
    responseType,
    scope,
    state,
  } satisfies AuthorizationRequest
})

/**
 * 認可エンドポイント
 */
authorizationRoute.get('/auth', authorizationRequestValidator, async (c) => {
  const authorizationRequest = c.req.valid('query')

  const key = randomUUID()

  authorizationRequestStore.set({
    ...authorizationRequest,
    key,
  })

  setCookie(c, 'authorization_request_key', key, {
    httpOnly: true,
    sameSite: 'Lax',
  })

  return c.redirect('/login')
})

export { authorizationRoute }
