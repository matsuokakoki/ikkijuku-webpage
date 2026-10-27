# 一輝塾 公式ホームページ

Astro + TypeScriptで生成する静的サイト。先生の編集はmicroCMS、配信はCloudflare Pagesを使います。

- 公開先: https://ikkijuku-webpage.pages.dev/
- リポジトリ: https://github.com/matsuokakoki/ikkijuku-webpage
- CMS: https://sm01hn94ba.microcms.io/

## 開発

Node.js 24を使用します。

```sh
npm ci
cp .env.example .env
npm run dev
```

`.env`で`CONTENT_SOURCE=snapshot`なら、旧サイトから移した公開コンテンツで起動します。実際のCMSを使う場合は`CONTENT_SOURCE=microcms`に変更し、`MICROCMS_API_KEY`を設定します。キーはブラウザに送られません。

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## 運用

先生の編集手順は[編集ガイド](docs/editor-guide.md)、技術構成・費用・制約は[設計資料](docs/architecture.md)を参照してください。

`LAUNCH_READY=false`は検索エンジンに掲載しない移行確認モードです。CMS・休講日の運用・問い合わせ・正式ドメインの確認後に`true`へ変更します。非公開アクセス制御ではありません。

CMSのデータが不正な場合はビルドを失敗させ、正常な公開済みサイトを維持します。バックアップと復元の手順は設計資料に記載しています。
