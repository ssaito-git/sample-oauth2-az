import { AuthorizationRequest } from '../oauth2/authorizationRequest'

type AuthorizationRequestData = AuthorizationRequest & {
  key: string
}

class AuthorizationRequestStore {
  #authorizationRequestDataMap = new Map<string, AuthorizationRequestData>()

  set(data: AuthorizationRequestData) {
    this.#authorizationRequestDataMap.set(data.key, data)
  }

  get(key: string) {
    return this.#authorizationRequestDataMap.get(key)
  }

  delete(key: string) {
    this.#authorizationRequestDataMap.delete(key)
  }
}

export const authorizationRequestStore = new AuthorizationRequestStore()
