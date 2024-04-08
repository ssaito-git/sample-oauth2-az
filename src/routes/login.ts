import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { users } from '../data/users'
import { Login } from '../views/Login'

const loginRoute = new Hono()

loginRoute.get('/login', (c) => {
  const loginUser = getCookie(c, 'login_user')
  const user = loginUser
    ? users.find((user) => user.name === loginUser)
    : undefined

  if (user !== undefined) {
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

    setCookie(c, 'login_user', username, { httpOnly: true, sameSite: 'Lax' })

    return c.redirect('/consent')
  },
)

export { loginRoute }
