import { MainLayout } from './layouts/MainLayout'

type ConsentProps = {
  clientNmae: string
  username: string
  scope?: string[]
}

export const ConsentView = ({ clientNmae, username, scope }: ConsentProps) => {
  return (
    <MainLayout>
      <h1>アクセス許可</h1>
      <div>クライアント名：{clientNmae}</div>
      <div>ユーザー名：{username}</div>
      {scope && (
        <div>
          要求スコープ：
          <ul>
            {scope.map((value) => (
              <li>{value}</li>
            ))}
          </ul>
        </div>
      )}
      <form method="post">
        <button type="submit" name="action" value="cancel">
          キャンセル
        </button>
        <button type="submit" name="action" value="accept">
          許可
        </button>
      </form>
    </MainLayout>
  )
}
