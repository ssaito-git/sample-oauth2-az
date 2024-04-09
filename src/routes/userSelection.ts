import { Hono } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'
import { validator } from 'hono/validator'

import { users } from '../data/users'
import { ErrorView } from '../views/ErrorView'
import { UserSelectionView } from '../views/UserSelectionView'

const userSelectionRoute = new Hono()

const cookieValidator = validator('cookie', (_, c) => {
  const loginUser = getCookie(c, 'login_user')

  if (loginUser === undefined) {
    return c.html(ErrorView({ message: '未ログインです。' }))
  }

  const user = users.find((user) => user.name === loginUser)

  if (user === undefined) {
    return c.html(ErrorView({ message: '未ログインです。' }))
  }

  return user
})

userSelectionRoute.get('/user', cookieValidator, (c) => {
  const user = c.req.valid('cookie')

  return c.html(UserSelectionView({ username: user.name }))
})

userSelectionRoute.post(
  '/user',
  cookieValidator,
  validator('form', (value, c) => {
    const action = value['action']

    if (!action || typeof action !== 'string') {
      return c.html(ErrorView({ message: 'リクエストが不正です。' }))
    }

    switch (action) {
      case 'logout':
      case 'continue':
        return action
      default:
        return c.html(ErrorView({ message: '不明なアクションです。' }))
    }
  }),
  (c) => {
    const action = c.req.valid('form')

    switch (action) {
      case 'logout': {
        deleteCookie(c, 'login_user')
        return c.redirect('/login')
      }
      case 'continue':
        return c.redirect('/consent')
      default:
        throw Error(action satisfies never)
    }
  },
)

export { userSelectionRoute }
