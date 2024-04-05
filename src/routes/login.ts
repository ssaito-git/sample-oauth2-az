import { randomUUID } from 'crypto'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { users } from '../data/users'
import { loginSessionStore } from '../stores/loginSessionStore'
import { Login } from '../views/Login'

const loginRoute = new Hono()

loginRoute.get('/login', (c) => {
  const loginSessionId = getCookie(c, 'login_session')
  const loginSession = loginSessionId
    ? loginSessionStore.get(loginSessionId)
    : undefined

  if (loginSession !== undefined) {
    return c.redirect('/consent')
  } else {
    return c.html(Login({}))
  }
})

loginRoute.post(
  '/login',
  validator('form', (value, c) => {
    const username = value['username']

    if (!username || typeof username !== 'string') {
      return c.html(Login({ message: 'ユーザー名を入力してください。' }))
    }

    const password = value['password']

    if (!password || typeof password !== 'string') {
      return c.html(
        Login({
          username,
          message: 'パスワードを入力してください。',
        }),
      )
    }

    const user = users.find(
      (user) => user.name === username && user.password === password,
    )

    if (user == null) {
      return c.html(
        Login({
          username,
          message: 'ユーザー名またはパスワードに誤りがあります。',
        }),
      )
    }

    return {
      username,
      password,
    }
  }),
  (c) => {
    const { username, password } = c.req.valid('form')

    const user = users.find(
      (user) => user.name === username && user.password === password,
    )

    if (user == null) {
      return c.html(
        Login({
          username,
          message: 'ユーザー名またはパスワードに誤りがあります。',
        }),
      )
    }

    const id = randomUUID()

    loginSessionStore.set({ id, username: user.name, expires: 1 })

    return c.redirect('/consent')
  },
)

export { loginRoute }
