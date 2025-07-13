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
```

## アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 14 (App Router)、TypeScript、React 18
- **グラフビュー**: D3.js v7（物理演算）、Konva.js（Canvas描画）
- **状態管理**: Zustand（グローバル）、Valtio（グラフ詳細）
- **バックエンド**: Supabase (PostgreSQL、Auth、Realtime)
- **API**: tRPC（型安全なAPI）
- **エディタ**: CodeMirror 6

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

- 更新時刻の自動設定
- Memoサイズの自動計算
- 認証ユーザーは全データにアクセス可能

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

- **KnowledgeBase**: 自由配置（D3.js Force Simulation）
- **IdeaStock以降**: 垂直制約付き配置（`useVerticalConstraints`）
- **最適化**: `useMemoizedNodes`でノードの再計算を最小化

### エリア別ノード作成ルール

```typescript
// KnowledgeBase: Memo, KBTag
// IdeaStock: Proposal, Research, ISTag
// Build: Task
// Measure: MVP, Dashboard
// Learn: Improvement
```

## 開発ログ

開発時の変更は `/docs/devlog.md` に記録すること
