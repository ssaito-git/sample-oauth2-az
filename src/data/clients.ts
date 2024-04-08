export type ClientConfig = {
  id: string
  name: string
  secret: string
  redirectUris: string[]
  scope: string[]
}

const clients: ClientConfig[] = [
  {
    id: 'foo',
    name: 'Foo Service',
    secret: 'secret',
    redirectUris: ['http://localhost/cb'],
    scope: ['read', 'write'],
  },
  {
    id: 'bar',
    name: 'Bar Service',
    secret: 'secret',
    redirectUris: [],
    scope: [],
  },
]

export { clients }
