import { Hono } from 'hono'
import { validator } from 'hono/validator'

import { clients } from '../data/clients'
import { Error } from '../views/Error'

const authorizationRoute = new Hono()

type AuthorizationRequest = {
  responseType: string
  clientId: string
  redirectUri?: string
  scope?: string[]
  state?: string
}

type ErrorCode =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'

const createAuthorizationRequestErrorResponseUrl = (parameter: {
  redirectUri: string
  errorCode: ErrorCode
  errorDescription?: string
  errorUri?: string
  state?: string
}): string => {
  const url = new URL(parameter.redirectUri)
  url.searchParams.append('error', parameter.errorCode)
  if (parameter.errorDescription !== undefined) {
    url.searchParams.append('error_description', parameter.errorDescription)
  }
  if (parameter.errorUri !== undefined) {
    url.searchParams.append('error_uri', parameter.errorUri)
  }
  if (parameter.state !== undefined) {
    url.searchParams.append('state', parameter.state)
  }
  return url.toString()
}

authorizationRoute.get(
  '/auth',
  validator('query', (_, c) => {
    const clientId = c.req.query('client_id')

    if (clientId === undefined) {
      return c.html(
        Error({ message: 'client_id がパラメーターに含まれていません。' }),
      )
    }

    const client = clients.find((client) => client.id === clientId)

    if (client === undefined) {
      return c.html(Error({ message: 'クライアントが存在しません。' }))
    }

    const redirectUri = c.req.query('redirect_uri')

    if (redirectUri === undefined) {
      return c.html(
        Error({ message: 'redirect_uri がパラメーターに含まれていません。' }),
      )
    }

    if (!client.redirectUris.includes(redirectUri)) {
      return c.html(
        Error({ message: 'リダイレクト URI が登録されていません。' }),
      )
    }

    const state = c.req.query('state')

    const responseType = c.req.query('response_type')

    if (responseType !== 'code') {
      return c.redirect(
        createAuthorizationRequestErrorResponseUrl({
          redirectUri,
          errorCode: 'invalid_request',
          state,
        }),
      )
    }

    const scope = c.req.query('scope')?.split(' ')

    if (
      scope !== undefined &&
      !scope.every((value) => client.scope.includes(value))
    ) {
      return c.redirect(
        createAuthorizationRequestErrorResponseUrl({
          redirectUri,
          errorCode: 'invalid_scope',
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
  }),
  async (c) => {
    const authorizationRequest = c.req.valid('query')
    console.log(authorizationRequest)

    return c.text('test')
  },
)

export { authorizationRoute }
