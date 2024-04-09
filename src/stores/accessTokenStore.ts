import { AccessToken } from '../oauth2/accessToken'

class AccessTokenStore {
  #AccessTokenMap = new Map<string, AccessToken>()

  set(data: AccessToken) {
    this.#AccessTokenMap.set(data.token, data)
  }

  get(code: string) {
    return this.#AccessTokenMap.get(code)
  }

  delete(code: string) {
    this.#AccessTokenMap.delete(code)
  }
}

export const accessTokenStore = new AccessTokenStore()
