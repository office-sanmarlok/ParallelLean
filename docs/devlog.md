# 開発ログ

## 2025-01-09

### プロジェクトライン機能の削除とPERT図レイアウトの実装

#### 変更内容
1. **プロジェクトライン機能の完全削除**
   - データベースマイグレーション（004_remove_project_lines.sql）を作成
   - project_linesテーブルとnodes.project_line_idカラムを削除
   - 関連するコンポーネント（ProjectLine.tsx, ProjectLines.tsx）を削除
   - 垂直制約フック（useVerticalConstraints.ts）を削除

2. **PERT図レイアウトの実装**
   - BuildエリアのTaskノードを上から下へのフロー型に変更
   - usePertLayout.tsフックを新規作成
   - 依存関係に基づいてTaskノードを自動配置
   - トポロジカルソートでレベルを計算し、階層的に配置

3. **コードのクリーンアップ**
   - graphStoreからprojectLines関連の状態を削除
   - 各種インポートとプロジェクトライン参照を削除
   - Force Simulationから垂直制約ロジックを削除

#### 技術的詳細
- PERT図レイアウトのパラメータ:
  - nodeSpacingX: 150px（水平間隔）
  - nodeSpacingY: 120px（垂直間隔）
  - 中央揃えで配置
- 依存関係グラフをBFSで探索してレベルを割り当て
- 各レベルでノードを水平に配置

#### 影響範囲
- データベーススキーマの変更
- グラフ表示の視覚的な変更（BuildエリアがPERT図形式に）
- プロジェクトラインに依存していた機能の削除

### プロジェクトライン参照の完全削除

#### 変更内容
4. **残存していたプロジェクトライン参照のクリーンアップ**
   - GraphEdge.tsx: projectLines参照を削除し、calculateNodePositionの引数をundefinedに変更
   - GraphNode.tsx: projectLine関連のコードを全て削除（座標計算、ドラッグ時の更新処理など）
   - buttonNodes.ts: createButtonNodes関数からprojectLine引数を削除
   - createVirtualNodes.ts: project_line_idフィールドを削除
   - InlineTagCreator.tsx: 不要なコメントを削除
   - CreateNodeModal.tsx: Proposalノード作成時のプロジェクトライン生成処理を削除
   - ReportGenerator.tsx: projectLinesベースのレポート生成をproposalベースに変更
   - nodePosition.ts: projectLine引数は残しているが未使用に（互換性のため）

#### 技術的詳細
- 全てのprojectLine関連の処理を削除
- ProposalノードとTaskノードの関連付けはmetadata.proposalIdで管理
- レポート生成はProposalノードを起点に変更

#### 影響範囲
- Proposalノード作成時にプロジェクトラインが生成されなくなった
- グラフ表示のパフォーマンスが向上（不要な処理の削除）

### 統合Force Simulationの実装と中心引力の削除

#### 変更内容
5. **統合Force Simulationの実装**
   - useUnifiedForceSimulation.tsフックを新規作成
   - 全エリア・全ノードタイプを一つのシミュレーションで管理
   - ノードタイプごとに異なる物理制約を適用：
     - KnowledgeBase/IdeaStock: 自由配置（力なし）
     - Build Taskノード: 下方向の重力のみ
     - ボタンノード: 親ノードに追従
   
6. **中心引力の削除**
   - 当初、エリア中心への引力を実装していたが、ユーザーの指示により削除
   - KnowledgeBase/IdeaStockノードは完全に自由な配置が可能に
   - BuildエリアのTaskノードからもX軸の中心引力を削除

#### 技術的詳細
- D3.js Force Simulationを使用
- ボタンノードも含めて全ノードをシミュレーション対象に
- ノード間の衝突回避、エッジによるリンク力を適用
- ドラッグ中のノード固定処理を実装

#### 影響範囲
- 個別のForce Simulationフックを無効化
- ノードの動きがより自然に
- ユーザーの意図通りの配置が可能に