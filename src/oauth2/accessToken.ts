import { AuthorizationRequest } from './authorizationRequest'

export type AccessToken = {
  token: string
  subject: string
  expiresIn: number
  expiresAt: number
  authorizationRequest: AuthorizationRequest
}
