import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { ClientConfig, clients } from '../data/clients'
import { users } from '../data/users'
import { AuthorizationRequest } from '../oauth2/authorizationRequest'
import { authorizationRequestStore } from '../stores/authorizationRequestStore'
import { Consent } from '../views/Consent'
import { Error } from '../views/Error'

const consentRoute = new Hono()

const validateAuthorizationRequest = (
  authorizationRequestKey: string,
):
  | {
      error: false
      authorizationRequest: AuthorizationRequest
      client: ClientConfig
    }
  | { error: true; message: string } => {
  const authorizationRequest = authorizationRequestStore.get(
    authorizationRequestKey,
  )

  if (
    authorizationRequest === undefined ||
    authorizationRequest.expires < Math.floor(Date.now() / 1000)
  ) {
    return { error: true, message: '不正なリクエストです。' }
  }

  const client = clients.find(
    (client) => client.id === authorizationRequest.clientId,
  )

  if (client === undefined) {
    return { error: true, message: '不正なリクエストです。' }
  }

  return { error: false, authorizationRequest, client }
}

consentRoute.get(
  '/consent',
  validator('cookie', (_, c) => {
    const authorizationRequestKey = getCookie(c, 'authorization_request_key')

    if (!authorizationRequestKey) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    const loginUser = getCookie(c, 'login_user')

    if (!loginUser) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    return { authorizationRequestKey, loginUser }
  }),
  (c) => {
    const { authorizationRequestKey, loginUser } = c.req.valid('cookie')

    const result = validateAuthorizationRequest(authorizationRequestKey)

    if (result.error) {
      return c.html(Error({ message: result.message }))
    }

    const { authorizationRequest, client } = result

    const user = users.find((user) => user.name === loginUser)

    if (user === undefined) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    return c.html(
      Consent({
        clientNmae: client.name,
        username: user.name,
        scope: authorizationRequest.scope,
      }),
    )
  },
)

consentRoute.post(
  '/consent',
  validator('cookie', (_, c) => {
    const authorizationRequestKey = getCookie(c, 'authorization_request_key')

    if (!authorizationRequestKey) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    const loginUser = getCookie(c, 'login_user')

    if (!loginUser) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    return { authorizationRequestKey, loginUser }
  }),
  validator('form', (value, c) => {
    const action = value['action']

    if (!action || typeof action !== 'string') {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    switch (action) {
      case 'ok':
      case 'cancel':
        return { action }

      default:
        return c.html(Error({ message: '不正なリクエストです。' }))
    }
  }),
  (c) => {
    const { authorizationRequestKey, loginUser } = c.req.valid('cookie')

    const result = validateAuthorizationRequest(authorizationRequestKey)

    if (result.error) {
      return c.html(Error({ message: result.message }))
    }

    const { authorizationRequest, client } = result

    const user = users.find((user) => user.name === loginUser)

    if (user === undefined) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    const { action } = c.req.valid('form')

    switch (action) {
      case 'ok':
        break
      case 'cancel':
        break
      default:
        action satisfies never
    }
  },
)

export { consentRoute }
