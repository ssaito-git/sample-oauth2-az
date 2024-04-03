import { html } from 'hono/html'
import { PropsWithChildren } from 'hono/jsx'

type MainLayoutProps = PropsWithChildren<{ title?: string }>

export const MainLayout = ({
  title = 'sample oauth 2.0 az',
  children,
}: MainLayoutProps) => {
  return html`<!doctype html>${(
      <html lang="ja">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title}</title>
        </head>
        <body>{children}</body>
      </html>
    )}`
}
