import { randomUUID } from 'crypto'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { validator } from 'hono/validator'

import { ClientConfig, clients } from '../data/clients'
import { TokenRequest } from '../oauth2/tokenRequest'
import { TokenRequestErrorResponse } from '../oauth2/tokenRequestErrorResponse'
import { TokenResponse } from '../oauth2/tokenResponse'
import { accessTokenStore } from '../stores/accessTokenStore'
import { authorizationCodeStore } from '../stores/authorizationCodeStore'

const tokenRoute = new Hono<{ Variables: { client: ClientConfig } }>()

tokenRoute.post(
  '/token',
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
    const grantType = value['grant_type']

    if (typeof grantType !== 'string') {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'grant_type' unknown type.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    if (grantType !== 'authorization_code') {
      return c.json(
        {
          error: 'unsupported_grant_type',
          error_description: "'grant_type' unsupported grant type.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    const code = value['code']

    if (typeof code !== 'string') {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'code' unknown type.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    if (!code) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: "'code' invalid.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    const redirectUri = value['redirect_uri']

    if (typeof redirectUri !== 'string') {
      return c.json(
        {
          error: 'invalid_request',
          error_description: "'redirect_uri' unknown type.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    if (!redirectUri) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: "'redirect_uri' invalid.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    return { grantType, code, redirectUri } satisfies TokenRequest
  }),
  (c) => {
    const { code, redirectUri } = c.req.valid('form')

    const authorizationCode = authorizationCodeStore.get(code)

    if (authorizationCode === undefined) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: "'code' invalid.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    if (authorizationCode.authorizationRequest.redirectUri !== redirectUri) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: "'redirect_uri' invalid.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    const client = c.get('client')

    if (client.id !== authorizationCode.authorizationRequest.clientId) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: "'code' invalid.",
        } satisfies TokenRequestErrorResponse,
        400,
      )
    }

    authorizationCodeStore.delete(authorizationCode.code)

    const token = randomUUID()

    const accessTokenDuration = 60 * 10

    accessTokenStore.set({
      token,
      subject: authorizationCode.subject,
      expiresIn: accessTokenDuration,
      expiresAt: Math.floor(Date.now() / 1000) + accessTokenDuration,
      authorizationRequest: authorizationCode.authorizationRequest,
    })

    return c.json({
      access_token: token,
      expires_in: accessTokenDuration,
      token_type: 'Bearer',
    } satisfies TokenResponse)
  },
)

export { tokenRoute }
