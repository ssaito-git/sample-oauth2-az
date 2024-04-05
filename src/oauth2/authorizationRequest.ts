export type AuthorizationRequest = {
  responseType: string
  clientId: string
  redirectUri?: string
  scope?: string[]
  state?: string
}
