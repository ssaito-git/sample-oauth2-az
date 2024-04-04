type ClientConfig = {
  id: string
  secret: string
  redirectUris: string[]
  scope: string[]
}

const clients: ClientConfig[] = [
  {
    id: 'foo',
    secret: 'secret',
    redirectUris: ['http://localhost/cb'],
    scope: ['read', 'write'],
  },
  {
    id: 'bar',
    secret: 'secret',
    redirectUris: [],
    scope: [],
  },
]

export { clients }
