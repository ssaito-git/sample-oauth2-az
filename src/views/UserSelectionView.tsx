import { MainLayout } from './layouts/MainLayout'

type UserSelectionProps = {
  username: string
}

export const UserSelectionView = ({ username }: UserSelectionProps) => {
  return (
    <MainLayout title="ユーザー選択">
      <h1>ユーザー選択</h1>
      {username}
      <form method="post">
        <button type="submit" name="action" value="logout">
          ログアウト
        </button>
        <button type="submit" name="action" value="continue">
          続行
        </button>
      </form>
    </MainLayout>
  )
}
