import { Hono } from 'hono'
import { validator } from 'hono/validator'

import { users } from '../data/users'
import { loginSession } from '../middleware/loginSession'
import { Login } from '../views/Login'

const loginRoute = new Hono()

loginRoute.get('/login', loginSession, (c) => {
  const username = c.var.sessionData?.username
  const user = username
    ? users.find((user) => user.name === username)
    : undefined

  if (user !== undefined) {
    return c.redirect('/consent')
  } else {
    return c.html(Login({}))
  }
})

loginRoute.post(
  '/login',
  loginSession,
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

    c.var.set({ username: user.name })

    return c.redirect('/consent')
  },
)

export { loginRoute }
