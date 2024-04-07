import {
  cookieBasedSession,
  makeInMemorySessionStore,
} from './cookieBasedSession'

export const loginSession = cookieBasedSession<{ username: string }>({
  cookieName: 'login_session',
  cookieOptions: { httpOnly: true, sameSite: 'Lax' },
  expirationDuration: 60 * 30,
  sessionStore: makeInMemorySessionStore(),
})
