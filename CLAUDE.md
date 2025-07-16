# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ParallelLeanは、並列リーンスタートアップのプロセスを可視化・管理するWebアプリケーションです。Obsidianのグラフビューをベースに、5つのエリア（KnowledgeBase、IdeaStock、Build、Measure、Learn）を通じてアイデアからMVPまでの流れを視覚的に管理します。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント実行
npm run lint

# TypeScript型チェック
npm run type-check

# コードフォーマット
npm run format

# フォーマットチェック（CI用）
npm run format:check

# 全チェック実行（リント、型チェック、フォーマット）
npm run check-all

# テスト実行（現在未設定）
npm run test

# データベースの型生成（Supabase CLI必要）
npx supabase gen types typescript --local > src/types/database.generated.ts
```

## アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 14 (App Router)、TypeScript、React 18
- **グラフビュー**: D3.js v7（物理演算）、Konva.js v9（Canvas描画）
- **状態管理**: Zustand v5（グローバル）、Valtio v2（グラフ詳細）
- **バックエンド**: Supabase (PostgreSQL、Auth、Realtime)
- **エディタ**: CodeMirror 6（Markdownサポート）
- **スタイリング**: Tailwind CSS、Framer Motion（アニメーション）
- **アイコン**: Lucide React
- **バリデーション**: Zod

### 主要ディレクトリ構造

```
/app
  /components/graph    # グラフビューコンポーネント
  /components/editor   # MDエディタコンポーネント
  /components/ui       # 共通UIコンポーネント
  /hooks              # カスタムフック
  /lib/supabase       # Supabaseクライアント・API
  /stores             # 状態管理
  /(auth)             # 認証ページ
  /(main)             # メインアプリケーション
/supabase/migrations  # データベーススキーマ
/src/types           # 型定義
```

## グラフビューの実装詳細

### エリアとノードタイプの制約

1. **KnowledgeBase**: 自由配置（Force Simulation）
2. **IdeaStock以降**: 垂直線（プロジェクトライン）に沿った配置
3. **Build**: タスクの依存関係により分岐・合流可能

### 物理演算の最適化

- Canvas（Konva.js）による高速レンダリング
- ビューポート外のノードは描画スキップ
- エリアごとに異なる物理制約を適用

## データベース設計

### 主要テーブル

- **nodes**: 全ノードタイプを管理（メモ、タグ、提案、タスク等）
- **edges**: ノード間の関係（参照、タグ付け、タスク依存）
- **project_lines**: プロジェクトライン（垂直配置の基準線）
- **profiles**: ユーザープロファイル
- **area_transitions**: エリア間の遷移履歴
- **project_reports**: レポート生成結果
- **kpi_data**: KPIデータ
- **attachments**: 添付ファイル

### トリガーとRLS

- 更新時刻の自動設定（`update_updated_at_column`）
- Memoサイズの自動計算（`update_memo_size`）
- 認証ユーザーは全データにアクセス可能

### データベースマイグレーション

1. **001_initial_schema**: 基本スキーマ定義
2. **002_fix_schema**: スキーマ修正
3. **003_create_functions**: 関数とトリガー作成
4. **004_remove_project_lines**: プロジェクトライン削除（PERT図レイアウトへ移行）

## 環境変数

`.env.local`に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## コーディング規約

- Prettierによる自動フォーマット（セミコロンなし、シングルクォート）
- TypeScript strictモード
- パスエイリアス: `@/*`

## 開発時の注意点

1. **型の整合性**: `src/types/database.generated.ts`を参照
2. **リアルタイム同期**: Supabase Realtimeの接続状態に注意
3. **Canvas最適化**: 大量ノードでのパフォーマンスを考慮
4. **エリア間の制約**: ノード移動時にエリアとタイプの整合性を保つ

## 重要な実装パターン

### グラフノードの状態管理

- **グローバル状態**: Zustand (`/app/stores/graphStore.ts`)
- **詳細状態**: Valtio（グラフ内の詳細な状態管理）
- **位置同期**: `usePositionSync`フックで物理演算とCanvas座標を同期

### 物理演算の制御

- **統合Force Simulation**: `useUnifiedForceSimulation`で全ノードを統一管理
- **KnowledgeBase**: 自由配置（Force Simulation）
- **IdeaStock以降**: 垂直制約付き配置（PERT図レイアウト）
- **最適化**: `useMemoizedNodes`でノードの再計算を最小化
- **中心引力**: 削除済み（パフォーマンス最適化のため）

### エリア別ノード作成ルール

```typescript
// KnowledgeBase: Memo, KBTag
// IdeaStock: Proposal, Research, ISTag
// Build: Task
// Measure: MVP, Dashboard
// Learn: Improvement
```

## API実装状況

- **認証API**: `/app/api/auth/create-test-user/route.ts`（テストユーザー作成用）
- **データアクセス**: Supabase Client SDKを直接使用
- **tRPC**: 依存関係はあるが未実装

## 未実装の主要機能

詳細は `/docs/UNIMPLEMENTED-FEATURES.md` を参照：
- タグの編集・削除機能
- ダッシュボード画面の表示
- KPIデータの表示・編集
- レポート生成・閲覧機能
- 添付ファイル機能
- 外部サービス連携

## 関連ドキュメント

- **統合仕様書**: `/docs/SPECIFICATION.md`
- **グラフビュー仕様**: `/docs/GRAPHVIEW-SPECIFICATION.md`
- **未実装機能**: `/docs/UNIMPLEMENTED-FEATURES.md`
- **開発ログ**: `/docs/devlog.md`

## 開発時の重要な変更点

- **プロジェクトライン削除**: 垂直線に沿った配置からPERT図レイアウトへ移行
- **中心引力の削除**: パフォーマンス向上のため
- **統合Force Simulation**: 複数のシミュレーションを統一管理に変更
