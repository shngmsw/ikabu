# feat: Node.js 24対応 / 依存パッケージの更新 / 型安全性の強化

## 概要

Node.js 24へのアップグレードと、それに伴う依存パッケージの更新を行いました。また、TypeScript/ESLintの設定を強化し、`any`型の使用を禁止しました。

## 主な変更点

### 🔧 ランタイム・依存関係の更新

| パッケージ | 変更前 | 変更後 |
|-----------|--------|--------|
| Node.js | `18.18.2` | `24.0.0` |
| Discord.js | `14.15.1` | `14.25.1` |
| Prisma | `5.13.0` | `7.1.0` |
| Canvas | `2.10.2` | `3.2.0` |
| TypeScript | `5.1.3` | `5.9.3` |

- `@discordjs/opus` を削除
- `@snazzah/davey` を追加 (Discord.js Voice DAVEプロトコル対応のため)

### 🗄️ データベース

- Prisma 7.xに対応するため`@prisma/adapter-better-sqlite3`を導入
- `prisma.config.ts`を追加

### 🛡️ 型安全性の強化

- `tsconfig.json`に`noImplicitAny: true`を追加
- `.eslintrc.js`に`@typescript-eslint/no-explicit-any: error`を追加
- テスト・設定ファイル用の`tsconfig.eslint.json`を追加
- 各ファイルの型エラーを修正：
  - `button_components.ts`: ActionRowの型アサーション追加
  - `recruit_modal_log.ts`: コンポーネント型チェック改善
  - `anarchy_canvas.ts`: nullish coalescing演算子の優先順位修正

### 🧪 テスト

- Vitestを導入（`vitest.config.ts`追加）
- `npm run test`スクリプト追加
- `test/impact.test.ts`を追加（環境チェック用）

### 📝 ドキュメント

- `README.md`を更新（Node.js/Discord.js/Prismaバージョン、DBセクション追加）

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `.eslintrc.js` | 型チェック強化 |
| `.gitignore` | 追加 |
| `README.md` | ドキュメント更新 |
| `package.json` | 依存関係更新 |
| `prisma.config.ts` | 新規追加 |
| `prisma/schema.prisma` | 微調整 |
| `src/app/common/button_components.ts` | 型修正 |
| `src/app/event/support_auto_tag/*.ts` | 型修正 |
| `src/app/feat-admin/channel_manager/*.ts` | 型修正 |
| `src/app/feat-recruit/canvases/anarchy_canvas.ts` | バグ修正 |
| `src/app/handlers/command_handler.ts` | 型修正 |
| `src/app/index.ts` | 型修正 |
| `src/app/logs/modals/recruit_modal_log.ts` | 型修正 |
| `src/db/prisma.ts` | Prisma 7.x対応 |
| `test/impact.test.ts` | 新規追加 |
| `tsconfig.eslint.json` | 新規追加 |
| `tsconfig.json` | noImplicitAny追加 |
| `vitest.config.ts` | 新規追加 |

## 破壊的変更

> ⚠️ **Node.js 24以上が必須**になります

> ⚠️ **Prisma 7.x**への移行が必要です
