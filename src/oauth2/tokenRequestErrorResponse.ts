type ErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope'

export type TokenRequestErrorResponse = {
  error: ErrorCode
  error_description?: string
  error_uri?: string
}
