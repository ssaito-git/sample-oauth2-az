import { AuthorizationCode } from '../oauth2/authorizationCode'

class AuthorizationCodeStore {
  #authorizationCodeMap = new Map<string, AuthorizationCode>()

  set(data: AuthorizationCode) {
    this.#authorizationCodeMap.set(data.code, data)
  }

  get(code: string) {
    return this.#authorizationCodeMap.get(code)
  }

  delete(code: string) {
    this.#authorizationCodeMap.delete(code)
  }
}

export const authorizationCodeStore = new AuthorizationCodeStore()
