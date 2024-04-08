import { MainLayout } from './layouts/MainLayout'

type ErrorProps = {
  message?: string
}

export const ErrorView = ({ message }: ErrorProps) => {
  return (
    <MainLayout>
      <h1>エラー</h1>
      {message}
    </MainLayout>
  )
}
