type ActiveTokenResponse = {
  active: true
  client_id: string
  exp: number
  sub: string
  scope?: string
}

type InactiveTokenResponse = {
  active: false
}

export type IntrospectionResponse = ActiveTokenResponse | InactiveTokenResponse
