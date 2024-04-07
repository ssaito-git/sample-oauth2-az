import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { clients } from '../data/clients'
import { loginSession } from '../middleware/loginSession'
import { authorizationRequestStore } from '../stores/authorizationRequestStore'
import { Consent } from '../views/Consent'
import { Error } from '../views/Error'

const consentRoute = new Hono()

const authorizationRequestKeyValidator = validator('cookie', (value, c) => {
  const authorizationRequestKey = getCookie(c, 'authorization_request_key')

  if (!authorizationRequestKey) {
    return c.html(Error({ message: '不正なリクエストです。' }))
  }

  const authorizationRequest = authorizationRequestStore.get(
    authorizationRequestKey,
  )

  if (
    authorizationRequest === undefined ||
    authorizationRequest.expires < Math.floor(Date.now() / 1000)
  ) {
    return c.html(Error({ message: '不正なリクエストです。' }))
  }

  const client = clients.find(
    (client) => client.id === authorizationRequest.clientId,
  )

  if (client === undefined) {
    return c.html(Error({ message: '不正なリクエストです。' }))
  }

  return { authorizationRequestKey }
})

consentRoute.get(
  '/consent',
  loginSession,
  validator('cookie', (_, c) => {
    const authorizationRequestKey = getCookie(c, 'authorization_request_key')

    if (!authorizationRequestKey) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    return { authorizationRequestKey }
  }),
  (c) => {
    const { authorizationRequestKey } = c.req.valid('cookie')

    const authorizationRequest = authorizationRequestStore.get(
      authorizationRequestKey,
    )

    if (
      authorizationRequest === undefined ||
      authorizationRequest.expires < Math.floor(Date.now() / 1000)
    ) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    const client = clients.find(
      (client) => client.id === authorizationRequest.clientId,
    )

    if (client === undefined) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    const username = c.var.sessionData?.username

    if (username === undefined) {
      return c.html(Error({ message: '不正なリクエストです。' }))
    }

    return c.html(
      Consent({
        clientNmae: client.name,
        username,
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

    return { authorizationRequestKey }
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
    const { authorizationRequestKey } = c.req.valid('cookie')
    const { action } = c.req.valid('form')
  },
)

export { consentRoute }
