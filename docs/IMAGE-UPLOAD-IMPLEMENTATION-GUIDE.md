# EasyMDE移行実装ガイド

## 概要
ParallelLeanプロジェクトのMarkdownエディタをCodeMirrorからEasyMDEに移行するための実装ガイドです。移行の主な目的は、より使いやすいUIと画像アップロード機能の実装です。

## 背景
- **現状**: CodeMirror（`@uiw/react-codemirror`）を使用したMarkdownエディタ
- **移行先**: EasyMDE（Easy Markdown Editor）
- **理由**: 画像アップロード機能の組み込み、ツールバーUI、プレビュー機能

## 現在のプロジェクト構成
- **エディタコンポーネント**: `/app/components/editor/MDEditor.tsx`
- **認証管理**: `useAuthStore`（Zustand）を使用
- **データベース**: `attachments`テーブルは既に存在（`001_initial_schema.sql`）
- **ノードタイプ**: memo, proposal, research, task, mvp, improvement（エディタ対応）
- **非対応ノード**: dashboard, is_tag, kb_tag（専用UIを使用）

## 実装チェックリスト

### Phase 1: 準備と基本実装

#### 1.1 Supabaseストレージの設定
- [ ] マイグレーション`005_create_storage_buckets.sql`を作成
  - attachmentsバケットの作成
  - RLSポリシーの設定（認証ユーザーのみアップロード可能）
  - パブリック読み取りの設定

#### 1.2 依存関係の管理
- [ ] EasyMDEパッケージのインストール（`easymde @types/easymde marked`）
- [ ] CodeMirrorパッケージは一旦残す（段階的移行のため）

#### 1.3 画像アップロードAPIの実装
- [ ] `/app/lib/supabase/storage.ts`を作成
  - `uploadImage`関数の実装
  - `crypto.randomUUID()`を使用したファイル名生成
  - ファイルサイズ制限（10MB）とタイプチェック
  - Supabaseストレージへのアップロード処理
  - attachmentsテーブルへの記録

### Phase 2: EasyMDEコンポーネントの実装

#### 2.1 EasyMDEラッパーコンポーネント
- [ ] `/app/components/editor/EasyMDEditor.tsx`を作成
  - EasyMDEインスタンスの管理
  - 画像アップロード機能の統合
  - 自動保存機能の設定
  - ダークテーマのスタイリング

#### 2.2 既存機能との互換性確保
- [ ] タイトル編集機能の維持
- [ ] タグ管理機能の維持（必要に応じて）
- [ ] `useGraphStore`との状態同期
- [ ] 自動保存（1秒後）の実装

### Phase 3: MDEditorコンポーネントの更新

#### 3.1 段階的移行の準備
- [ ] MDEditor内にフィーチャーフラグを追加（CodeMirror/EasyMDE切り替え）
- [ ] 開発環境でのテスト用設定

#### 3.2 エディタの統合
- [ ] MDEditorコンポーネントでEasyMDEを使用するよう変更
- [ ] ノードタイプ別のプレースホルダー設定
- [ ] エディタ非対応ノードタイプの処理（dashboard, is_tag, kb_tag）

### Phase 4: テストと検証

#### 4.1 機能テスト
- [ ] 各ノードタイプでのエディタ表示確認
- [ ] 画像アップロード機能のテスト
  - ドラッグ&ドロップ
  - クリップボードからの貼り付け
  - ツールバーからの選択
- [ ] ファイルサイズ制限の確認（10MB）
- [ ] サポートファイル形式の確認（jpg, png, gif, webp）

#### 4.2 パフォーマンステスト
- [ ] 大きなMarkdownファイルでの動作確認
- [ ] 複数画像を含むコンテンツでの表示速度
- [ ] メモリ使用量の確認

### Phase 5: 完全移行

#### 5.1 CodeMirrorの削除
- [ ] すべてのテストが成功したことを確認
- [ ] CodeMirror関連パッケージのアンインストール
- [ ] 不要なコードの削除
- [ ] フィーチャーフラグの削除

#### 5.2 最終確認
- [ ] 全ノードタイプでの動作確認
- [ ] エラーハンドリングの確認
- [ ] ドキュメントの更新

## 技術的な考慮事項

### UUID生成
- `crypto.randomUUID()`を使用（ブラウザネイティブ、追加パッケージ不要）
- ブラウザサポート: Chrome 92+, Firefox 95+, Safari 15.4+

### 認証
- 既存の`useAuthStore`（Zustand）を使用
- `user`オブジェクトから`user.id`を取得

### スタイリング
- ダークテーマに合わせたカスタムCSS
- Tailwind CSSとの統合

### エラーハンドリング
- アップロード失敗時のユーザーフィードバック
- トースト通知の実装（オプション）

## リスクと対策

### メモリリーク
- EasyMDEインスタンスの適切なクリーンアップ
- useEffectのクリーンアップ関数での破棄

### 移行期間中の問題
- フィーチャーフラグによる段階的移行
- 両エディタの並行運用期間を設ける

### パフォーマンス
- 大きなファイルでのテスト必須
- 画像の遅延読み込みの検討

## 関連ドキュメント
- `/docs/GRAPHVIEW-SPECIFICATION.md` - グラフビューの仕様
- `/docs/UNIMPLEMENTED-FEATURES.md` - 未実装機能一覧
- `/docs/devlog.md` - 開発ログ