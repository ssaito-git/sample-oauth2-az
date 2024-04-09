import { AuthorizationRequest } from './authorizationRequest'

export type AuthorizationCode = {
  code: string
  subject: string
  authorizationRequest: AuthorizationRequest
}
