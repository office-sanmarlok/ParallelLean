# 開発ログ

## 2025-01-10

### ダブルクリック挙動の実装状況確認

#### 確認内容

グラフビュー仕様書に記載されているノードのダブルクリック挙動の実装状況を調査：

#### 現在の実装状況

1. **実装済み**
   - Memo: ダブルクリックでmdエディタを開く ✅
   - Proposal, Research, Task, MVP, Improvement: シングルクリックでmdエディタを開く（仕様とは異なる）

2. **未実装**
   - KBTag, ISTag: ダブルクリックで名前の編集 ❌
   - Dashboard: ダブルクリックでダッシュボードを開く ❌

#### 問題点

- 仕様書では、Proposal, Research, Task, MVP, Improvementは「ダブルクリック時」にmdエディタを開くとありますが、現在は「シングルクリック時」に開く実装になっています。
- タグ（KBTag/ISTag）の名前編集機能が未実装です。
- Dashboardノードのダッシュボード表示機能が未実装です。

#### 今後の対応

- タグ名編集機能の実装
- ダッシュボード表示機能の実装
- エディタを開くタイミングをシングルクリックからダブルクリックに変更するかの検討

### ノードタイプ実装状況の確認

#### 確認内容

グラフビュー仕様書に記載されている全ノードタイプの実装状況を調査：

1. **データベース定義（src/types/database.generated.ts）**
   - 全9種類のノードタイプがEnumとして定義済み
   - memo, kb_tag, proposal, research, is_tag, task, mvp, dashboard, improvement

2. **ノード描画実装（GraphNode.tsx）**
   - 全ノードタイプのスタイル定義が実装済み
   - 各ノードの視覚的特徴：
     - Memo: 白背景・黒枠線
     - KBTag/ISTag: 黒背景・黒枠線
     - Proposal/Research: グレー背景・黒枠線
     - Task: 状態に応じた色（完了:緑、未完了:赤、保留:黄）
     - MVP: 金色背景・黒枠線・光るエフェクト
     - Dashboard: 白背景・黒枠線・四角形
     - Improvement: 白背景・黒枠線

3. **ノード作成機能（CreateNodeModal.tsx）**
   - 全エリアで適切なノードタイプが作成可能
   - エリアごとの制約が正しく実装：
     - KnowledgeBase: memo, kb_tag
     - IdeaStock: proposal, research, is_tag
     - Build: task
     - Measure: mvp, dashboard
     - Learn: improvement

#### 結論

仕様書に記載されている全9種類のノードタイプが完全に実装されていることを確認。

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

## 2025-01-10

### Research、ISTag、Improvementノードへの削除ボタン追加

#### 変更内容

1. **削除ボタンノードの追加**
   - buttonNodes.ts: Research、ISTag、Improvementノードに削除ボタンを追加
   - 各ノードタイプに応じた適切な位置に配置

2. **削除処理の実装**
   - GraphCanvas.tsx: handleDeleteResearch、handleDeleteISTag、handleDeleteImprovement関数を追加
   - ボタンクリック時の処理を追加（virtual-research-delete-、virtual-istag-delete-、virtual-improvement-delete-）
   - ノード選択時にボタンを表示する処理を追加

#### 技術的詳細

- 既存の削除ボタン実装パターンに従って実装
- データベースからの削除とストアからの削除を同期
- UIのリセット処理（選択解除、ボタン非表示）を含む

#### 影響範囲

- Research、ISTag、Improvementノードに削除ボタンが表示されるようになった
- グラフビュー仕様書に記載されていた未実装機能が解消された

### Force Simulationの同期問題修正

#### 変更内容

1. **ドラッグ時のハンドラ修正**
   - GraphNode.tsx: 古い個別Force Simulationのハンドラを削除
   - 統合Force Simulation（useUnifiedForceSimulation）のハンドラに統一

2. **ノード位置の同期処理追加**
   - useUnifiedForceSimulation.ts: ノードの位置が更新されたときにシミュレーション内のノードも更新
   - ドラッグ中でない場合のみ位置を同期する処理を追加

#### 技術的詳細

- 以前は複数のForce Simulationが混在していたが、統合Force Simulationに完全移行
- シミュレーションの再初期化を最小限に抑えつつ、ノード位置を同期

#### 影響範囲

- ドラッグ時とアイドル時でノードの挙動が統一された
- Force Simulationの動作がより安定した

### ボタンノード（仮想ノード）への通常Force Simulation適用

#### 変更内容

1. **ボタンノードの固定位置追従処理を削除**
   - useUnifiedForceSimulation.ts: ボタンノード専用の固定位置計算処理を削除
   - 通常のノードと同じForce Simulationを適用

2. **ボタンノードのドラッグ可能化**
   - GraphNode.tsx: ボタンノード（virtual-で始まるノード）のドラッグ制限を削除
   - 親ノードドラッグ時のボタンノード位置更新処理を削除

3. **仮想エッジの追加**
   - useUnifiedForceSimulation.ts: ボタンノードと親ノード間の仮想エッジを作成
   - 仮想エッジに強いリンク力（0.9）と短い距離（80）を設定

#### 技術的詳細

- ボタンノードも他のノードと同様に物理演算の対象となった
- ノード間の衝突回避、エッジによるリンク力が適用される
- ボタンノードも自由にドラッグ可能
- metadata.parentIdを使用して親子関係を判定し、仮想エッジを動的に生成

#### 影響範囲

- ボタンノードが親ノードに固定されなくなった
- ボタンノードも通常のノードと同じ挙動をするようになった
- 親ノードをドラッグするとボタンノードもリンク力によって追従する

### クリック/ダブルクリック挙動の修正

#### 変更内容

1. **シングルクリック時の挙動修正**
   - GraphCanvas.tsx: handleNodeClickからエディタを開く処理を削除
   - シングルクリックはボタンノードの表示のみに変更

2. **ダブルクリック時の挙動統一**
   - handleNodeDblClick: 全てのエディタブルノード（Memo、Proposal、Research、Task、MVP、Improvement）でエディタを開く
   - KBTag、ISTagの名前編集機能をTODOとして記載
   - Dashboardのダブルクリック機能をTODOとして記載

#### 技術的詳細

- 仕様書に従い、エディタ表示は全てダブルクリックに統一
- シングルクリックは選択とボタンノード表示のみ

#### 影響範囲

- ユーザー体験の一貫性が向上
- 誤操作によるエディタ表示を防止

### ボタンノードのスタイル統一

#### 変更内容

1. **全ボタンノードのスタイルを統一**
   - buttonNodes.ts: getButtonNodeStyle関数の全ケースを修正
   - 破線（dash: [5, 5]）
   - 半透明の背景色（rgba形式、opacity: 0.1-0.2）
   - テーマカラーの枠線
   - 全体の透明度（opacity: 0.8-0.9）

2. **カラーパレットの統一**
   - tag/add系: 青色（#3B82F6）
   - delete系: 赤色（#EF4444）
   - project系: 緑色（#22C55E）
   - research/status系: オレンジ色（#FB923C）
   - link系: 紫色（#6366F1）
   - build系: エメラルド色（#10B981）
   - mvp系: 黄色（#FBBF24）

#### 技術的詳細

- グレー系（#9CA3AF）のボタンを全て削除
- rgba形式で背景色を指定し、半透明効果を実現
- ホバー時は透明度を上げて視覚的フィードバック

#### 影響範囲

- 全てのボタンノードが統一されたデザインに
- 視覚的な一貫性が向上

### ボタンノードの実装修正

#### 変更内容

1. **未定義ボタンノードタイプの追加**
   - GraphNode.tsx: getNodeStyle関数に全てのボタンノードタイプを追加
   - build_button、task_link_button、add_task_button、status_button、mvp_button、debug_buttonを追加

2. **各ボタンノードのアイコン実装**
   - build_button: 下矢印アイコン
   - task_link_button: 🔗アイコン
   - add_task_button: プラスアイコン
   - status_button: ◐アイコン
   - mvp_button: ⭐アイコン
   - debug_button: ⏩アイコン

#### 技術的詳細

- 以前はボタンノードタイプの一部のみがgetButtonNodeStyleを使用していた
- 未定義のボタンノードはdefaultケースに落ちて、グレーの実線スタイルになっていた
- 全てのボタンノードが破線・半透明スタイルを使用するように修正

#### 影響範囲

- 全てのボタンノードが統一されたスタイルで表示される
- グレーの実線ボタンが解消された

### ProposalとTask間のリンク力調整

#### 変更内容

1. **リンク力の調整**
   - useUnifiedForceSimulation.ts: ProposalとTask間のリンク力を0.05に減少（通常は0.3）
   - エリアをまたぐリンクの力を0.1に減少

2. **リンク距離の調整**
   - ProposalとTask間の距離を500に増加（通常は100）
   - エリアをまたぐリンクの距離を300に増加（元は200）

#### 技術的詳細

- ProposalノードがBuildエリアのTaskノードの重力に引っ張られすぎないように調整
- リンク力を弱め、距離を長くすることで、各ノードが自然な位置を保てるように

#### 影響範囲

- ProposalノードがIdeaStockエリアに留まりやすくなった
- TaskノードはBuildエリアで下向きの重力を受けながらも、Proposalを過度に引っ張らない

### エッジデザインの統一

#### 変更内容

1. **全エッジのデザインを統一**
   - GraphEdge.tsx: 全てのエッジタイプで同じスタイルを使用
   - 通常のエッジ: グレー (#6B7280)、幅1.5px、透明度0.6
   - 仮想エッジ: 薄いグレー (#9CA3AF)、幅1px、破線、透明度0.5
   - 矢印を全て削除（直線のみ）

#### 技術的詳細

- エッジタイプに関わらず統一されたビジュアルデザイン
- 仮想エッジ（ボタンノード用）は破線で区別

#### 影響範囲

- 視覚的な一貫性が向上
- エッジタイプの違いが色や矢印ではなく、接続関係で表現される

### Taskノードのステータスインジケーター削除

#### 変更内容

1. **ステータスインジケーターの削除**
   - GraphNode.tsx: Taskノード右上の小さい円（ステータスインジケーター）を削除
   - 関連するコードブロックを完全に削除

#### 技術的詳細

- Taskノードの状態は本体の色のみで表現（完了:緑、未完了:赤、保留:黄）
- 右上の重複したインジケーターを除去

#### 影響範囲

- Taskノードの見た目がよりシンプルに
- ステータスは引き続きノード本体の色で識別可能

### 改行処理の調査

#### 調査内容

MDエディタでの改行処理について、保存・読み込み・表示の各段階での処理を調査：

#### 調査結果

1. **MDEditor.tsxでの改行の保存処理**
   - `setContent(node.content || '')`: contentフィールドの内容をそのまま設定
   - 自動保存処理で、contentの値をそのままSupabaseに保存
   - CodeMirrorのvalueプロパティにcontentを直接渡している
   - onChangeで新しい値をそのままsetContentに設定

2. **contentフィールドへの保存時の処理**
   - 特別な変換処理なし
   - JavaScriptの文字列として改行文字（\n）を含んだまま保存
   - Supabaseクライアントが自動的にJSON形式でエスケープして送信

3. **読み込み時の改行の復元処理**
   - 特別な復元処理なし
   - Supabaseから取得したデータをそのまま使用
   - 改行文字は保持されている

4. **CodeMirrorでの改行表示**
   - CodeMirrorは改行文字（\n）を自動的に改行として表示
   - markdown()拡張機能により、Markdown形式でレンダリング

5. **データベース（PostgreSQL）のTEXT型での改行の扱い**
   - PostgreSQLのTEXT型は改行文字を正しく保存
   - 実際のデータベースを確認した結果、改行文字（\n）が保存されている

#### 結論

改行処理は正しく実装されています。改行文字（\n）は：

1. CodeMirrorで入力時に生成
2. JavaScriptの文字列として保持
3. SupabaseのJSON APIを通じて保存
4. PostgreSQLのTEXT型に格納
5. 読み込み時にそのまま復元
6. CodeMirrorが改行として表示

特別な変換処理は不要で、標準的な動作で問題なく機能しています。
