import { MainLayout } from './layouts/MainLayout'

type ConsentProps = {
  clientNmae: string
  username: string
  scope?: string[]
}

export const Consent = ({ clientNmae, username, scope }: ConsentProps) => {
  return (
    <MainLayout>
      <h1>Consent</h1>
      {clientNmae}
      {username}
      {scope && (
        <li>
          {scope.map((value) => (
            <ul>{value}</ul>
          ))}
        </li>
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
