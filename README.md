# sample-oauth2-az

社内勉強会用に作成した OAuth 2.0 の認可サーバーです。

[Hono](https://github.com/honojs/hono) を利用しています。

## 実行

1. `npm run dev` または VSCode のデバッグの開始（F5）

2. Web ブラウザで以下の URL にアクセスする。

   `http://localhost:3000/auth?client_id=foo&redirect_uri=http://localhost/cb&response_type=code&scope=read write&state=generated_random_value`

3. 以下のユーザーでログインする。

   | username | password |
   | -------- | -------- |
   | alice    | pass     |
   | bob      | pass     |

4. 発行された認可コードでアクセストークンを取得する。

   ```shell
   curl http://localhost:3000/token -u foo:secret -d "grant_type=authorization_code" -d "code={authorization code}" -d "redirect_uri=http://localhost/cb"
   ```

5. トークンイントロスペクションでアクセストークンの情報を取得する。

   ```shell
   curl http://localhost:3000/introspection -u foo:secret -d "token={access token}"
   ```

## 実装

- 認可グラント
  - 認可コード
- クライアントタイプ
  - コンフィデンシャルクライアント
- クライアント認証
  - Basic 認証（`client_secret_basic`）
- トークンイントロスペクション

## ディレクトリ構造

```text
📁src
│
├─📁data
│      ユーザーやクライアントの情報
├─📁oauth2
│      OAuth 2.0 関連の型情報やユーティリティー
├─📁routes
│      各エンドポイントのルート定義
├─📁stores
│      認可コードやアクセストークンのデータストア
└─📁views
    │  ログインページやアクセス許可ページ
    └─📁layouts
            ページ共通のレイアウト
```
