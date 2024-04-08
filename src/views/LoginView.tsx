import { MainLayout } from './layouts/MainLayout'

type LoginProps = {
  username?: string
  message?: string
}

export const LoginView = ({ username, message }: LoginProps) => {
  return (
    <MainLayout title="ログイン">
      <h1>ログイン</h1>
      <form action="/login" method="post">
        <div>
          <label for="username">ユーザー名</label>
          <input type="text" name="username" id="username" value={username} />
        </div>
        <div>
          <label for="password">パスワード</label>
          <input type="password" name="password" id="password" />
        </div>
        <div>
          <button type="submit">ログイン</button>
        </div>
      </form>
      {message}
    </MainLayout>
  )
}
