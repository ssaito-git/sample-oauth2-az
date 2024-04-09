import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { validator } from 'hono/validator'

import { ClientConfig, clients } from '../data/clients'
import { IntrospectionRequestErrorResponse } from '../oauth2/IntrospectionRequestErrorResponse'
import { IntrospectionResponse } from '../oauth2/IntrospectionResponse'
import { accessTokenStore } from '../stores/accessTokenStore'

const introspectionRoute = new Hono<{ Variables: { client: ClientConfig } }>()

introspectionRoute.post(
  '/introspection',
  basicAuth({
    verifyUser: (username, password, c) => {
      const client = clients.find(
        (client) => client.id === username && client.secret === password,
      )

      if (client !== undefined) {
        c.set('client', client)
        return true
      } else {
        return false
      }
    },
  }),
  validator('form', (value, c) => {
    const token = value['token']

    if (!token) {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'token' required.",
        } satisfies IntrospectionRequestErrorResponse,
        400,
      )
    }

    if (typeof token !== 'string') {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'token' unknown type.",
        } satisfies IntrospectionRequestErrorResponse,
        400,
      )
    }

    const tokenTypeHint = value['token_type_hint']

    if (tokenTypeHint !== undefined && typeof tokenTypeHint !== 'string') {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'token_type_hint' unknown type.",
        } satisfies IntrospectionRequestErrorResponse,
        400,
      )
    }

    switch (tokenTypeHint) {
      case 'access_token':
      case 'refresh_token':
        return { token, tokenTypeHint }
      case undefined:
        return { token }
      default:
        return c.json(
          {
            error: 'invalid_request',
            error_description: "'token_type_hint' invalid.",
          } satisfies IntrospectionRequestErrorResponse,
          400,
        )
    }
  }),
  (c) => {
    const { token } = c.req.valid('form')

    const accessToken = accessTokenStore.get(token)

    if (accessToken === undefined) {
      return c.json({ active: false } satisfies IntrospectionResponse)
    }

    if (accessToken.expiresAt < Math.floor(Date.now() / 1000)) {
      return c.json({ active: false } satisfies IntrospectionResponse)
    }

    const client = c.get('client')

    if (accessToken.authorizationRequest.clientId !== client.id) {
      return c.json({ active: false } satisfies IntrospectionResponse)
    }

    return c.json({
      active: true,
      client_id: accessToken.authorizationRequest.clientId,
      exp: accessToken.expiresAt,
      sub: accessToken.subject,
      scope: accessToken.authorizationRequest.scope?.join(' '),
    } satisfies IntrospectionResponse)
  },
)

export { introspectionRoute }
