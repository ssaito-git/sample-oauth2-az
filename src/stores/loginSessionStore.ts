type LoginSession = {
  id: string
  username: string
  expires: number
}

class LoginSessionStore {
  #userSessionMap = new Map<string, LoginSession>()

  set(data: LoginSession) {
    this.#userSessionMap.set(data.id, data)
  }

  get(id: string) {
    return this.#userSessionMap.get(id)
  }

  delete(id: string) {
    this.#userSessionMap.delete(id)
  }
}

export const loginSessionStore = new LoginSessionStore()
