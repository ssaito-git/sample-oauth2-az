type ErrorCode =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'

export const createAuthorizationRequestErrorResponseUrl = (parameter: {
  redirectUri: string
  errorCode: ErrorCode
  errorDescription?: string
  errorUri?: string
  state?: string
}): string => {
  const url = new URL(parameter.redirectUri)
  url.searchParams.append('error', parameter.errorCode)
  if (parameter.errorDescription !== undefined) {
    url.searchParams.append('error_description', parameter.errorDescription)
  }
  if (parameter.errorUri !== undefined) {
    url.searchParams.append('error_uri', parameter.errorUri)
  }
  if (parameter.state !== undefined) {
    url.searchParams.append('state', parameter.state)
  }
  return url.toString()
}
