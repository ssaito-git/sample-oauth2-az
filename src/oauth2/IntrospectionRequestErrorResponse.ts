type ErrorCode = 'invalid_request' | 'invalid_client'

export type IntrospectionRequestErrorResponse = {
  error: ErrorCode
  error_description?: string
}
