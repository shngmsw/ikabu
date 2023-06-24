# イカ部 Discord Bot with discord.js

## 概要

このリポジトリは、discord.jsを用いたDiscord Botのソースコードです。

## 利用方法

以下の手順にしたがって、Botを利用してください。

1. このリポジトリをcloneしてください。
2. `npm install` を実行して、必要なパッケージをインストールしてください。
3. `.env.sample`ファイルを`.env`にリネームし、必要な情報を設定してください。
4. `npm run start`を実行して、Botを起動してください。

## 環境

- Node.js: `16.13.0`
- Discord.js: `14.11.0`

## デプロイ

- 本番環境へのデプロイは、`main`ブランチへのマージ後、GitHub Actionsによって自動的にデプロイされます。
- ステージング環境へのデプロイは、`stg`ブランチへのマージ後、GitHub Actionsによって自動的にデプロイされます。

## 利用可能なスクリプト

プロジェクトには、以下のスクリプトが含まれています。

### `npm start`

`.env`ファイルを読み込み、TypeScriptをコンパイルして、サーバーを開始します。

### `npm run migrate-dev`

`Prisma migrate dev`を実行し、マイグレーションを作成します。
Databaseのスキーマ変更内容を元にmigrationsにDDLを生成します。

### `npm run migrate-deploy`

`Prisma migrate deploy`を実行し、マイグレーションを実行します。

### `npm run prisma-generate`

`Prisma generate`を実行し、PrismaClientを自動生成します。

### `npm run lint`

`eslint`と`prettier`を実行して、コードを検証します。

### `npm run fix`

`eslint`と`prettier`を実行して、コードを自動で修正します。

## ライセンス

このプロジェクトはMITライセンスのもとで公開されます。詳細については、LICENSEファイルを参照してください。
