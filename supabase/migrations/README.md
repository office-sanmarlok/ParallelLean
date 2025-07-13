# Supabase Migration 適用手順

## 新しいマイグレーションファイル

### 003_create_progress_to_build_function.sql

このマイグレーションは、ProposalからBuildへの進行時にトランザクション処理を行うRPC関数を作成します。

## 適用方法

### 方法1: Supabase Dashboard（推奨）

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. 該当プロジェクトを選択
3. 左サイドバーの「SQL Editor」をクリック
4. 「New Query」をクリック
5. `003_create_progress_to_build_function.sql`の内容をコピー＆ペースト
6. 「Run」ボタンをクリックして実行

### 方法2: Supabase CLI

```bash
# Supabase CLIがインストールされている場合
supabase db push
```

## トランザクション処理を有効にする

マイグレーション適用後、`GraphCanvas.tsx`の以下の行を変更してください：

```typescript
// 現在の暫定実装から
// バックグラウンドでDB保存（RPC関数が利用できない場合の暫定実装）

// 以下に変更
// バックグラウンドでDB保存（トランザクション処理）
```

そして、RPC関数を使用するコードに置き換えてください。

## 注意事項

- マイグレーション適用前は、元の実装（個別のINSERT文）が使用されます
- マイグレーション適用後は、トランザクション処理により、エラー時の自動ロールバックが有効になります
