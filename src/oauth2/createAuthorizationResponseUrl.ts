export const createAuthorizationResponseUrl = (parameter: {
  redirectUri: string
  code: string
  state?: string
}) => {
  const url = new URL(parameter.redirectUri)

  url.searchParams.append('code', parameter.code)

  if (parameter.state !== undefined) {
    url.searchParams.append('state', parameter.state)
  }

  return url.toString()
}
