# ParallelLean Supabase Schema

このディレクトリには、ParallelLeanのデータベーススキーマとマイグレーションファイルが含まれています。

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトのURL と anon keyをメモ

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase CLIのインストール

```bash
npm install -g supabase
```

### 4. プロジェクトのリンク

```bash
supabase link --project-ref your_project_ref
```

### 5. マイグレーションの実行

```bash
# スキーマの適用
supabase db push

# または、SQLエディタで schema.sql の内容を直接実行
```

### 6. 型定義の自動生成（オプション）

```bash
supabase gen types typescript --local > src/types/database.generated.ts
```

## スキーマの概要

### 主要テーブル

- **profiles**: ユーザープロファイル（Supabase Auth連携）
- **project_lines**: プロジェクトの垂直線を管理
- **nodes**: すべてのノード（Memo、Proposal、Task等）
- **edges**: ノード間の関係
- **area_transitions**: エリア間の遷移履歴
- **project_reports**: 再構築・撤退時のレポート
- **kpi_data**: KPIデータ（将来の拡張用）

### 特徴

1. **Row Level Security (RLS)**: ユーザーは自分のデータのみアクセス可能
2. **自動更新**: updated_atフィールドの自動更新
3. **制約**: ノードタイプとエリアの整合性チェック
4. **トリガー**: 
   - Memoノードのサイズ自動計算
   - プロジェクトステータスの自動更新
5. **ビュー**: プロジェクトサマリーとノード関係の簡易アクセス

### エリアとノードタイプの関係

| エリア | 許可されるノードタイプ |
|--------|------------------------|
| knowledge_base | memo, kb_tag |
| idea_stock | proposal, research, is_tag |
| build | task |
| measure | mvp, dashboard |
| learn | mvp, dashboard, improvement |

### プロジェクトの流れ

1. **idea_stock**: Proposalノード作成時
2. **build**: タスク追加時
3. **measure**: 全タスク完了時（自動遷移）
4. **learn**: 計測期間終了時
5. **pivot/shutdown**: ユーザーの選択時

## トラブルシューティング

### RLSエラー

認証されていない可能性があります。ParallelLeanは共有ワークスペースのため、認証されたユーザーは全データにアクセス可能です。

### 外部キー制約エラー

関連するレコードが存在しない、または削除されています。カスケード削除の設定を確認してください。

### 型の不一致

`database.ts`の型定義とスキーマが一致しているか確認してください。必要に応じて型を再生成してください。