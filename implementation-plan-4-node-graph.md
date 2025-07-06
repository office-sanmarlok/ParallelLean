# 実装計画4: ノード形式UI版（Obsidian風グラフビュー）

# ParallelLean - コアアイデア

## 概要
個人がリーンスタートアップを並列で行うのをサポートするwebアプリParallelLeanを開発したいです。

AIの発達により個人がローコストで自身の事業を持つことができる時代が来ています。この時代に最適なリーンスタートアップの手法を可視化し、かつゲーミフィケーションするUIを提供することで、ユーザーがビジネスを難しく考えずに、自身の収入源を楽しく増やすことができるようになります。

## リーンスタートアップとは
コストをかけずに最低限の製品・サービス・機能を持った試作品を短期間でつくり、顧客の反応を的確に取得して、顧客がより満足できる製品・サービスを開発していくマネジメント手法です。構築・計測・学習または再構築のステップが提唱されています。

- **構築**: アイデアを元に製品もしくはサービスの企画を作成し、MVPを作成
- **計測**: アーリーアダプターに提供し反応を見る
- **学習**: 計測での結果を元にMVPを改善していき、一般顧客に受け入れてもらえる形として組み直していく
- **再構築**: 学習によるある程度の微調整ではなく、大幅な修正が必要と判断された場合に、事業を再構築すること。

## 基本的な流れ

### 1. ストック
ユーザーは自身のアイデアをメモのような形で簡潔に書き、それをストックしておきます。ユーザーはそのストックの中からMVPとして作成したいアイデアを選びます。

### 2. 構築
選ばれたアイデアは構築段階に入ります。ユーザーはこのアイデアに対し企画書を書き、アイデアにリンクさせます。そうするとアイデアにワークフローが出現し、ここにはMVP開発に必要なToDoリストが、それぞれのタスクの依存関係など含めて記述されます。

### 3. 計測
MVPが完成すると、アイデアは事業となり、事業は計測段階に入ります。事業にマーケティング戦略とKPIダッシュボードがリンクされます。マーケティング戦略には主にアーリーアダプターへのリーチ戦略の具体的な手法が記述されます。KPIダッシュボードには計測したKPIを可視化したグラフや表などが表示されます。

### 4. 学習
計測段階に入ってから一定期間経つと、事業は学習段階に入ります。事業にターゲットインサイトと改善点リストがリンクされます。ターゲットインサイトは計測段階でユーザーであったアーリーアダプターに関するインサイトを含み、今後この事業がターゲットとしていく一般顧客像のヒントになります。改善点リストはそのターゲット層を念頭に置いたうえで改善するべき点をリストにしたものです。

### 5. 再構築・撤退
学習段階で事業が大きな問題をはらんでいることが発覚した場合、ユーザーはその事業を再構築するか、撤退するか選ぶことができます。どちらにせよ、今後の活動に有用なデータとして、この事業の今までの歩みをレポートとしてまとめ、保存します。

---

# ParallelLean 共通デザイン方針

## 共通ビジュアルテーマ：白黒モダン

すべての実装計画において、以下のビジュアルテーマを厳守します：

### カラーパレット
- **背景**: #FFFFFF, #FAFAFA, #F5F5F5
- **テキスト**: #000000, #1A1A1A, #333333, #666666
- **ボーダー**: #E0E0E0, #D0D0D0, #C0C0C0
- **アクセント**: #000000（ホバー時は#333333）
- **影**: rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05)

### デザイン原則
- **ミニマリズム**: 不要な装飾を排除し、機能美を追求
- **余白の活用**: 十分な余白で洗練された印象を演出
- **タイポグラフィ**: Silka-Mono Regular を主要フォントとして使用
- **モノトーンアニメーション**: 色ではなく、動きと透明度で表現
- **シャープなエッジ**: 角丸は最小限（0-4px）に抑える

### インタラクション基本原則
- **ホバーエフェクト**: 影の強調、透明度の変化
- **トランジション**: 200-300msのイージング
- **フィードバック**: ユーザーアクションに対する即座の視覚的応答
- **アクセシビリティ**: 高コントラストでWCAG AA準拠

### アイコン・イラスト
- **ラインアイコン**: 細めのストローク（1-2px）
- **ピクトグラム**: シンプルで認識しやすい形状
- **イラスト**: 線画スタイルまたはシルエット

## 各実装計画での差別化

この共通テーマを維持しながら、各実装計画では以下の点で個性を出します：

1. **UIレイアウト**: カンバン、グラフ、タイムラインなど
2. **技術スタック**: 異なるフレームワーク・ライブラリの組み合わせ
3. **インタラクション**: 各UIに最適化された操作性
4. **アニメーション**: UIコンセプトに応じた動きの演出
5. **情報密度**: 用途に応じた表示情報の調整

動的で、インタラクティブな、センスのあるデザインが求められます。遊んでください。

---

# TDDワークフロー共通原則

## t-wadaさんのTDD手法について

### 基本サイクル：RED → GREEN → REFACTOR

1. **RED（失敗するテストを書く）**
   - まず失敗するテストを書く
   - テストが失敗することを確認する
   - この段階で実装はまだ存在しない

2. **GREEN（テストを通す）**
   - 最小限の実装でテストを通す
   - 仮実装（ハードコーディング）から始めても良い
   - とにかくテストを通すことに集中

3. **REFACTOR（リファクタリング）**
   - テストが通っている状態を維持しながら
   - コードの重複を除去
   - 設計を改善

### TDDの黄金律

> 「失敗するテストがない限り、プロダクションコードを書いてはいけない」

### TODOリスト駆動開発

1. **最初にTODOリストを作成**
   - 実装すべき機能をリストアップ
   - 各項目は15分以内で実装できる粒度に分解
   - 優先順位を決定

2. **一つずつ潰していく**
   - TODOリストの項目を一つ選ぶ
   - そのテストを書く
   - 実装する
   - チェックマークを付ける

### 仮実装のテクニック

```typescript
// 最初の実装（仮実装）
function add(a: number, b: number): number {
  return 3; // ハードコーディング
}

// テストが通ったら、徐々に一般化
function add(a: number, b: number): number {
  return a + b; // 本実装
}
```

### 三角測量

複数の具体例から一般化を導く：
1. 一つ目の具体例でテストを書く
2. 仮実装で通す
3. 二つ目の具体例でテストを書く
4. 一般化した実装に変更

### 小さなステップ

- 一度に大きな変更をしない
- 常にテストが通る状態を維持
- 5分以上テストが通らない状態が続いたら、元に戻す

## ParallelLeanでの適用

### 各フェーズの意味

1. **Phase 1: 環境構築**
   - プロジェクトの基盤作り
   - 最初のテストで環境が正しく設定されていることを確認

2. **Phase 2-3: モデルとストア**
   - ビジネスロジックの中核
   - 純粋関数として実装しやすい部分から始める

3. **Phase 4-6: UIコンポーネント**
   - ユーザーインターフェース
   - 見た目より振る舞いをテスト

4. **Phase 7-8: 最適化と特殊機能**
   - パフォーマンスチューニング
   - フレームワーク固有の機能

5. **Phase 9-10: 統合とデプロイ**
   - E2Eテストで全体の動作確認
   - 本番環境への準備

### チェックボックスの使い方

- [ ] 未着手：まだ始めていない
- [x] 完了：テストが通り、実装が完了
- [~] 作業中：現在取り組んでいる（GitHubでは取り消し線）

### テスト駆動の利点

1. **設計の改善**
   - テストしやすいコードは良い設計
   - 疎結合で凝集度の高いコード

2. **リグレッション防止**
   - 既存機能を壊さない安心感
   - リファクタリングの自由度

3. **ドキュメント化**
   - テストが仕様書の役割
   - 使い方の実例

4. **開発リズム**
   - RED→GREEN→REFACTORのリズム
   - 達成感の継続的な獲得

### 注意点

- テストのためのテストは書かない
- 100%のカバレッジを目指さない（80%で十分）
- E2Eテストは必要最小限に
- ユニットテストを中心に、統合テストで補完

### 参考資料

- 「テスト駆動開発」Kent Beck著
- 「実践テスト駆動開発」Steve Freeman, Nat Pryce著
- t-wadaさんの講演資料・ブログ記事

---

## 概要
アイデアと事業の関係性を3D空間のノードグラフとして表現し、Obsidianのような直感的なナビゲーションと探索を可能にするUI。

## 技術スタック
- **フレームワーク**: SvelteKit
- **UIライブラリ**: Ant Design (antd-svelte) + custom CSS
- **状態管理**: MobX
- **3Dグラフライブラリ**: Three.js + react-force-graph
- **データベース**: Supabase
- **テスト**: Playwright + Vitest
- **型安全性**: TypeScript + Superstruct

## UI設計

### メイングラフビュー
```
┌─────────────────────────────────────────────────────────────┐
│ ParallelLean                    ⚙️ View ▼  🔍 Search  + Node │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     ○ idea-5                                │
│                    /                                        │
│            ● project-2 ─ ─ ─ ○ idea-6                     │
│           /        \                                        │
│   ◉ business-1      ○ idea-7                              │
│    \      \                                                 │
│     \      ● project-3                                     │
│      \    /         \                                       │
│       ○ idea-1      ○ idea-8                              │
│        \                                                    │
│         ○ idea-2 ─ ─ ─ ○ idea-9                          │
│                                                             │
│  Legend:                                                    │
│  ○ Stock  ● Build  ◉ Measure/Learn  ◇ Archive            │
│  ─── Dependency  ─ ─ Inspiration  ··· Similar             │
└─────────────────────────────────────────────────────────────┘
```

### ノード詳細パネル（サイドバー）
```
┌──────────────────┐
│ AI Assistant MVP │
│ ◉ Measure Stage  │
├──────────────────┤
│ Connections: 5   │
│ ├─ Built from:   │
│ │  └ idea-1      │
│ ├─ Inspired:     │
│ │  ├ idea-6      │
│ │  └ idea-7      │
│ └─ Related:      │
│    └ project-3   │
├──────────────────┤
│ KPIs:            │
│ Users: 1,250     │
│ Revenue: $5,000  │
│ Retention: 85%   │
├──────────────────┤
│ [Open Details]   │
└──────────────────┘
```

## TDD実装ワークフロー

### 1. プロジェクトセットアップ

#### RED
```typescript
// tests/setup/project.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have SvelteKit configured', async () => {
    const config = await import('../vite.config.js');
    expect(config.default.plugins).toContainEqual(
      expect.objectContaining({ name: 'vite-plugin-svelte' })
    );
  });

  it('should have MobX store configured', () => {
    const { graphStore } = require('../src/stores/graph');
    expect(graphStore).toBeDefined();
    expect(graphStore.nodes).toBeDefined();
  });
});
```

#### GREEN
```bash
npm create svelte@latest parallel-lean-node-graph -- --template=skeleton --types=typescript
cd parallel-lean-node-graph
npm install mobx mobx-svelte three @react-three/fiber react-force-graph-3d
npm install antd-svelte superstruct
npm install -D vitest playwright @playwright/test
```

### 2. グラフデータモデル実装

#### RED
```typescript
// tests/models/graph.test.ts
import { describe, it, expect } from 'vitest';
import * as s from 'superstruct';
import { NodeStruct, EdgeStruct, validateGraph } from '$lib/models/graph';

describe('Graph Models', () => {
  it('should validate node structure', () => {
    const validNode = {
      id: 'node-1',
      type: 'idea',
      label: 'AI Assistant',
      stage: 'stock',
      position: { x: 0, y: 0, z: 0 },
      data: {
        description: 'An AI that helps with daily tasks',
        createdAt: new Date().toISOString(),
        connections: {
          dependencies: [],
          inspirations: [],
          similar: []
        }
      }
    };
    
    expect(() => s.assert(validNode, NodeStruct)).not.toThrow();
  });

  it('should validate edge structure', () => {
    const validEdge = {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'dependency',
      strength: 1.0
    };
    
    expect(() => s.assert(validEdge, EdgeStruct)).not.toThrow();
  });

  it('should detect graph cycles', () => {
    const nodes = [
      { id: '1', type: 'idea' },
      { id: '2', type: 'project' },
      { id: '3', type: 'project' }
    ];
    
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '1' } // Creates cycle
    ];
    
    const validation = validateGraph(nodes, edges);
    expect(validation.hasCycles).toBe(true);
  });
});
```

#### GREEN
```typescript
// src/lib/models/graph.ts
import * as s from 'superstruct';

export const Position3D = s.object({
  x: s.number(),
  y: s.number(),
  z: s.number()
});

export const NodeStruct = s.object({
  id: s.string(),
  type: s.enums(['idea', 'project', 'business', 'archive']),
  label: s.string(),
  stage: s.enums(['stock', 'build', 'measure', 'learn', 'archive']),
  position: Position3D,
  data: s.object({
    description: s.optional(s.string()),
    createdAt: s.string(),
    updatedAt: s.optional(s.string()),
    connections: s.object({
      dependencies: s.array(s.string()),
      inspirations: s.array(s.string()),
      similar: s.array(s.string())
    }),
    metrics: s.optional(s.object({
      users: s.number(),
      revenue: s.number(),
      retention: s.number()
    }))
  })
});

export const EdgeStruct = s.object({
  id: s.string(),
  source: s.string(),
  target: s.string(),
  type: s.enums(['dependency', 'inspiration', 'similarity']),
  strength: s.number()
});

export type Node = s.Infer<typeof NodeStruct>;
export type Edge = s.Infer<typeof EdgeStruct>;

export interface GraphValidation {
  isValid: boolean;
  hasCycles: boolean;
  orphanNodes: string[];
  errors: string[];
}

export function validateGraph(nodes: Node[], edges: Edge[]): GraphValidation {
  const validation: GraphValidation = {
    isValid: true,
    hasCycles: false,
    orphanNodes: [],
    errors: []
  };

  // Check for cycles using DFS
  const adjacencyList = new Map<string, string[]>();
  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  // Check each node for cycles
  for (const node of nodes) {
    if (!visited.has(node.id) && hasCycle(node.id)) {
      validation.hasCycles = true;
      validation.errors.push(`Cycle detected involving node ${node.id}`);
      break;
    }
  }

  // Find orphan nodes
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  validation.orphanNodes = nodes
    .filter(node => !connectedNodes.has(node.id))
    .map(node => node.id);

  validation.isValid = !validation.hasCycles && validation.errors.length === 0;
  return validation;
}
```

### 3. MobX Store実装

#### RED
```typescript
// tests/stores/graph.test.ts
import { describe, it, expect } from 'vitest';
import { graphStore, GraphStore } from '$lib/stores/graph';

describe('Graph Store', () => {
  beforeEach(() => {
    graphStore.reset();
  });

  it('should add nodes', () => {
    const node = graphStore.addNode({
      type: 'idea',
      label: 'Test Idea',
      stage: 'stock'
    });
    
    expect(graphStore.nodes.length).toBe(1);
    expect(node.id).toBeDefined();
    expect(node.position).toBeDefined();
  });

  it('should create edges between nodes', () => {
    const node1 = graphStore.addNode({ type: 'idea', label: 'Idea 1' });
    const node2 = graphStore.addNode({ type: 'project', label: 'Project 1' });
    
    const edge = graphStore.connectNodes(node1.id, node2.id, 'dependency');
    
    expect(graphStore.edges.length).toBe(1);
    expect(edge.type).toBe('dependency');
  });

  it('should apply force simulation', () => {
    // Add multiple nodes
    for (let i = 0; i < 5; i++) {
      graphStore.addNode({ type: 'idea', label: `Idea ${i}` });
    }
    
    const initialPositions = graphStore.nodes.map(n => ({ ...n.position }));
    
    // Run simulation
    graphStore.runSimulation(100);
    
    // Check that positions changed
    const hasMovement = graphStore.nodes.some((node, i) => 
      node.position.x !== initialPositions[i].x ||
      node.position.y !== initialPositions[i].y
    );
    
    expect(hasMovement).toBe(true);
  });

  it('should filter nodes by stage', () => {
    graphStore.addNode({ type: 'idea', stage: 'stock' });
    graphStore.addNode({ type: 'project', stage: 'build' });
    graphStore.addNode({ type: 'business', stage: 'measure' });
    
    const filtered = graphStore.getNodesByStage('build');
    expect(filtered.length).toBe(1);
    expect(filtered[0].stage).toBe('build');
  });
});
```

#### GREEN
```typescript
// src/lib/stores/graph.ts
import { makeAutoObservable, action, computed } from 'mobx';
import { Node, Edge } from '$lib/models/graph';
import * as THREE from 'three';

export class GraphStore {
  nodes: Node[] = [];
  edges: Edge[] = [];
  selectedNodeId: string | null = null;
  viewSettings = {
    showLabels: true,
    showEdges: true,
    zoomLevel: 1,
    rotation: { x: 0, y: 0 }
  };

  constructor() {
    makeAutoObservable(this);
  }

  @action
  addNode(data: Partial<Node>): Node {
    const node: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type || 'idea',
      label: data.label || 'New Node',
      stage: data.stage || 'stock',
      position: data.position || this.generateRandomPosition(),
      data: {
        createdAt: new Date().toISOString(),
        connections: {
          dependencies: [],
          inspirations: [],
          similar: []
        },
        ...data.data
      }
    };

    this.nodes.push(node);
    return node;
  }

  @action
  connectNodes(sourceId: string, targetId: string, type: Edge['type']): Edge {
    const edge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type,
      strength: type === 'dependency' ? 1.0 : 0.5
    };

    this.edges.push(edge);

    // Update node connections
    const sourceNode = this.nodes.find(n => n.id === sourceId);
    const targetNode = this.nodes.find(n => n.id === targetId);
    
    if (sourceNode && targetNode) {
      const connectionType = type === 'dependency' ? 'dependencies' : 
                           type === 'inspiration' ? 'inspirations' : 'similar';
      sourceNode.data.connections[connectionType].push(targetId);
    }

    return edge;
  }

  @action
  updateNodePosition(nodeId: string, position: { x: number; y: number; z: number }) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  }

  @action
  selectNode(nodeId: string | null) {
    this.selectedNodeId = nodeId;
  }

  @computed
  get selectedNode(): Node | null {
    return this.nodes.find(n => n.id === this.selectedNodeId) || null;
  }

  getNodesByStage(stage: Node['stage']): Node[] {
    return this.nodes.filter(n => n.stage === stage);
  }

  getConnectedNodes(nodeId: string): Node[] {
    const connectedIds = new Set<string>();
    
    // Find edges where this node is source or target
    this.edges.forEach(edge => {
      if (edge.source === nodeId) {
        connectedIds.add(edge.target);
      } else if (edge.target === nodeId) {
        connectedIds.add(edge.source);
      }
    });

    return this.nodes.filter(n => connectedIds.has(n.id));
  }

  @action
  runSimulation(iterations: number = 100) {
    // Simple force-directed layout simulation
    const k = 100; // Ideal spring length
    const c = 0.01; // Repulsion constant

    for (let iter = 0; iter < iterations; iter++) {
      // Calculate repulsive forces
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const nodeA = this.nodes[i];
          const nodeB = this.nodes[j];
          
          const dx = nodeB.position.x - nodeA.position.x;
          const dy = nodeB.position.y - nodeA.position.y;
          const dz = nodeB.position.z - nodeA.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0) {
            const force = (c * k * k) / distance;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            const fz = (dz / distance) * force;
            
            nodeA.position.x -= fx;
            nodeA.position.y -= fy;
            nodeA.position.z -= fz;
            nodeB.position.x += fx;
            nodeB.position.y += fy;
            nodeB.position.z += fz;
          }
        }
      }

      // Calculate attractive forces for edges
      this.edges.forEach(edge => {
        const source = this.nodes.find(n => n.id === edge.source);
        const target = this.nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const dx = target.position.x - source.position.x;
          const dy = target.position.y - source.position.y;
          const dz = target.position.z - source.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0) {
            const force = (distance * distance) / k * edge.strength;
            const fx = (dx / distance) * force * 0.01;
            const fy = (dy / distance) * force * 0.01;
            const fz = (dz / distance) * force * 0.01;
            
            source.position.x += fx;
            source.position.y += fy;
            source.position.z += fz;
            target.position.x -= fx;
            target.position.y -= fy;
            target.position.z -= fz;
          }
        }
      });
    }
  }

  private generateRandomPosition() {
    return {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      z: (Math.random() - 0.5) * 100
    };
  }

  @action
  reset() {
    this.nodes = [];
    this.edges = [];
    this.selectedNodeId = null;
  }
}

export const graphStore = new GraphStore();
```

### 4. 3Dグラフコンポーネント実装

#### RED
```typescript
// tests/components/GraphView.test.ts
import { describe, it, expect } from '@playwright/test';

describe('GraphView Component', () => {
  test('should render 3D graph canvas', async ({ page }) => {
    await page.goto('/');
    
    const canvas = await page.locator('canvas');
    expect(await canvas.isVisible()).toBe(true);
  });

  test('should handle node click', async ({ page }) => {
    await page.goto('/');
    
    // Add a node
    await page.click('button:has-text("+ Node")');
    
    // Click on the node (simulate canvas click)
    const canvas = await page.locator('canvas');
    await canvas.click({ position: { x: 400, y: 300 } });
    
    // Check if node detail panel appears
    const detailPanel = await page.locator('.node-detail-panel');
    expect(await detailPanel.isVisible()).toBe(true);
  });

  test('should support zoom and pan', async ({ page }) => {
    await page.goto('/');
    
    const canvas = await page.locator('canvas');
    
    // Zoom in
    await canvas.hover();
    await page.mouse.wheel(0, -100);
    
    // Pan
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 500, y: 400 }
    });
    
    // Verify view changed (check transform matrix or camera position)
    const viewState = await page.evaluate(() => {
      return window.graphViewState;
    });
    
    expect(viewState.zoom).toBeGreaterThan(1);
  });
});
```

#### GREEN
```svelte
<!-- src/lib/components/GraphView.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { observer } from 'mobx-svelte';
  import ForceGraph3D from 'react-force-graph-3d';
  import { graphStore } from '$lib/stores/graph';

  let containerEl: HTMLDivElement;
  let graphInstance: any;

  const graphData = $: ({
    nodes: graphStore.nodes.map(node => ({
      id: node.id,
      name: node.label,
      val: node.type === 'business' ? 20 : node.type === 'project' ? 15 : 10,
      color: getNodeColor(node.stage),
      ...node.position
    })),
    links: graphStore.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: edge.strength,
      color: getEdgeColor(edge.type)
    }))
  });

  function getNodeColor(stage: string): string {
    const colors = {
      stock: '#FFFFFF',
      build: '#E0E0E0',
      measure: '#333333',
      learn: '#666666',
      archive: '#C0C0C0'
    };
    return colors[stage] || '#FFFFFF';
  }

  function getEdgeColor(type: string): string {
    const colors = {
      dependency: '#000000',
      inspiration: '#666666',
      similarity: '#C0C0C0'
    };
    return colors[type] || '#999999';
  }

  function handleNodeClick(node: any) {
    graphStore.selectNode(node.id);
  }

  function handleNodeDrag(node: any) {
    graphStore.updateNodePosition(node.id, {
      x: node.x,
      y: node.y,
      z: node.z
    });
  }

  onMount(() => {
    // Initialize 3D graph
    if (typeof window !== 'undefined') {
      import('react-force-graph-3d').then(({ default: ForceGraph3D }) => {
        graphInstance = ForceGraph3D()(containerEl)
          .graphData(graphData)
          .nodeLabel('name')
          .nodeColor('color')
          .nodeVal('val')
          .linkColor('color')
          .linkWidth(link => link.value * 2)
          .linkDirectionalParticles(2)
          .linkDirectionalParticleSpeed(0.005)
          .onNodeClick(handleNodeClick)
          .onNodeDragEnd(handleNodeDrag)
          .backgroundColor('#FAFAFA')
          .showNavInfo(false);

        // Custom node rendering
        graphInstance.nodeThreeObject(node => {
          const geometry = new THREE.SphereGeometry(node.val / 2);
          const material = new THREE.MeshBasicMaterial({
            color: node.color,
            wireframe: true
          });
          return new THREE.Mesh(geometry, material);
        });

        // Store view state for testing
        window.graphViewState = {
          zoom: 1,
          center: { x: 0, y: 0, z: 0 }
        };
      });
    }

    return () => {
      if (graphInstance) {
        graphInstance._destructor();
      }
    };
  });
</script>

<div class="graph-container" bind:this={containerEl}>
  <!-- 3D Graph renders here -->
</div>

<style>
  .graph-container {
    width: 100%;
    height: 100%;
    background-color: #FAFAFA;
    position: relative;
  }

  :global(.graph-tooltip) {
    font-family: 'Silka-Mono', monospace;
    background-color: white;
    border: 1px solid #000;
    padding: 8px;
    font-size: 12px;
  }
</style>
```

### 5. ノード詳細パネル実装

#### RED
```typescript
// tests/components/NodeDetailPanel.test.ts
import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import NodeDetailPanel from '$lib/components/NodeDetailPanel.svelte';
import { graphStore } from '$lib/stores/graph';

describe('NodeDetailPanel', () => {
  it('should display node information', () => {
    const node = {
      id: '1',
      label: 'Test Node',
      type: 'project',
      stage: 'build',
      data: {
        connections: {
          dependencies: ['node-0'],
          inspirations: ['node-2', 'node-3'],
          similar: []
        },
        metrics: {
          users: 1250,
          revenue: 5000,
          retention: 85
        }
      }
    };

    graphStore.nodes = [node];
    graphStore.selectedNodeId = '1';

    const { getByText } = render(NodeDetailPanel);

    expect(getByText('Test Node')).toBeInTheDocument();
    expect(getByText('● Build Stage')).toBeInTheDocument();
    expect(getByText('Connections: 3')).toBeInTheDocument();
    expect(getByText('Users: 1,250')).toBeInTheDocument();
  });
});
```

#### GREEN
```svelte
<!-- src/lib/components/NodeDetailPanel.svelte -->
<script lang="ts">
  import { observer } from 'mobx-svelte';
  import { graphStore } from '$lib/stores/graph';
  import { Button, Card, Statistic, Tag } from 'antd-svelte';

  $: selectedNode = graphStore.selectedNode;
  $: connections = selectedNode ? graphStore.getConnectedNodes(selectedNode.id) : [];
  $: totalConnections = selectedNode ? 
    selectedNode.data.connections.dependencies.length +
    selectedNode.data.connections.inspirations.length +
    selectedNode.data.connections.similar.length : 0;

  function getStageIcon(stage: string) {
    const icons = {
      stock: '○',
      build: '●',
      measure: '◉',
      learn: '◉',
      archive: '◇'
    };
    return icons[stage] || '○';
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
</script>

{#if selectedNode}
  <div class="detail-panel">
    <Card bordered={false}>
      <h3>{selectedNode.label}</h3>
      <Tag color="black">
        {getStageIcon(selectedNode.stage)} {selectedNode.stage} Stage
      </Tag>
      
      <div class="connections">
        <h4>Connections: {totalConnections}</h4>
        
        {#if selectedNode.data.connections.dependencies.length > 0}
          <div class="connection-group">
            <span class="label">Built from:</span>
            {#each selectedNode.data.connections.dependencies as dep}
              <div class="connection-item">└ {dep}</div>
            {/each}
          </div>
        {/if}
        
        {#if selectedNode.data.connections.inspirations.length > 0}
          <div class="connection-group">
            <span class="label">Inspired:</span>
            {#each selectedNode.data.connections.inspirations as insp}
              <div class="connection-item">├ {insp}</div>
            {/each}
          </div>
        {/if}
      </div>
      
      {#if selectedNode.data.metrics}
        <div class="metrics">
          <h4>KPIs:</h4>
          <Statistic 
            title="Users" 
            value={formatNumber(selectedNode.data.metrics.users)} 
          />
          <Statistic 
            title="Revenue" 
            value={`$${formatNumber(selectedNode.data.metrics.revenue)}`} 
          />
          <Statistic 
            title="Retention" 
            value={`${selectedNode.data.metrics.retention}%`} 
          />
        </div>
      {/if}
      
      <Button type="primary" block>Open Details</Button>
    </Card>
  </div>
{/if}

<style>
  .detail-panel {
    position: fixed;
    right: 20px;
    top: 80px;
    width: 300px;
    background: white;
    border: 1px solid #000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Silka-Mono', monospace;
  }

  h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  h4 {
    font-size: 14px;
    margin: 16px 0 8px;
  }

  .connections {
    margin: 16px 0;
  }

  .connection-group {
    margin: 8px 0;
  }

  .label {
    font-size: 12px;
    color: #666;
  }

  .connection-item {
    font-size: 12px;
    margin-left: 16px;
    color: #333;
  }

  .metrics {
    margin: 16px 0;
  }

  :global(.ant-statistic) {
    margin-bottom: 12px;
  }

  :global(.ant-statistic-title) {
    font-family: 'Silka-Mono', monospace;
    font-size: 12px;
  }

  :global(.ant-statistic-content) {
    font-family: 'Silka-Mono', monospace;
  }
</style>
```

### 6. メインレイアウト実装

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { observer } from 'mobx-svelte';
  import GraphView from '$lib/components/GraphView.svelte';
  import NodeDetailPanel from '$lib/components/NodeDetailPanel.svelte';
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import { graphStore } from '$lib/stores/graph';
  import { Layout, Menu, Input, Button, Dropdown } from 'antd-svelte';

  const { Header, Content } = Layout;
  const { Search } = Input;

  let searchValue = '';

  const viewOptions = [
    { key: 'all', label: 'All Nodes' },
    { key: 'active', label: 'Active Only' },
    { key: 'connections', label: 'Show Connections' }
  ];

  function handleAddNode() {
    graphStore.addNode({
      label: `Idea ${graphStore.nodes.length + 1}`,
      type: 'idea',
      stage: 'stock'
    });
  }

  function handleSearch(value: string) {
    // Implement search functionality
    console.log('Searching for:', value);
  }
</script>

<Layout class="layout">
  <Header class="header">
    <div class="header-content">
      <h1>ParallelLean</h1>
      <div class="controls">
        <Dropdown menu={{ items: viewOptions }}>
          <Button>⚙️ View ▼</Button>
        </Dropdown>
        <Search
          placeholder="🔍 Search"
          bind:value={searchValue}
          onSearch={handleSearch}
          style="width: 200px"
        />
        <Button type="primary" onClick={handleAddNode}>
          + Node
        </Button>
      </div>
    </div>
  </Header>
  
  <Content class="content">
    <GraphView />
    <NodeDetailPanel />
    
    <div class="legend">
      <span>○ Stock</span>
      <span>● Build</span>
      <span>◉ Measure/Learn</span>
      <span>◇ Archive</span>
      <div class="separator"></div>
      <span>─── Dependency</span>
      <span>─ ─ Inspiration</span>
      <span>··· Similar</span>
    </div>
  </Content>
</Layout>

<style>
  :global(.layout) {
    height: 100vh;
    font-family: 'Silka-Mono', monospace;
  }

  :global(.header) {
    background: #ffffff;
    border-bottom: 1px solid #000;
    padding: 0 24px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
  }

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  :global(.content) {
    position: relative;
    height: calc(100vh - 64px);
    background: #fafafa;
  }

  .legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: white;
    border: 1px solid #000;
    padding: 12px 16px;
    font-size: 12px;
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .separator {
    width: 1px;
    height: 16px;
    background: #ccc;
    margin: 0 8px;
  }
</style>
```

### 7. E2Eテスト実装

```typescript
// tests/e2e/node-graph.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Node Graph UI', () => {
  test('should create and connect nodes', async ({ page }) => {
    await page.goto('/');
    
    // Create first node
    await page.click('button:has-text("+ Node")');
    await page.waitForTimeout(500);
    
    // Create second node
    await page.click('button:has-text("+ Node")');
    await page.waitForTimeout(500);
    
    // Connect nodes (via context menu or drag)
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 400, y: 300 }, button: 'right' });
    await page.click('text=Connect to...');
    
    // Verify connection
    const edges = await page.evaluate(() => {
      return window.graphStore.edges.length;
    });
    expect(edges).toBeGreaterThan(0);
  });

  test('should filter nodes by stage', async ({ page }) => {
    await page.goto('/');
    
    // Add nodes with different stages
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("+ Node")');
    }
    
    // Apply filter
    await page.click('button:has-text("View")');
    await page.click('text=Active Only');
    
    // Verify filtered view
    const visibleNodes = await page.evaluate(() => {
      return document.querySelectorAll('.node-visible').length;
    });
    expect(visibleNodes).toBeLessThan(5);
  });

  test('should save and load graph state', async ({ page }) => {
    await page.goto('/');
    
    // Create some nodes
    await page.click('button:has-text("+ Node")');
    await page.click('button:has-text("+ Node")');
    
    // Save state
    await page.keyboard.press('Control+S');
    
    // Reload page
    await page.reload();
    
    // Verify nodes persisted
    const nodes = await page.evaluate(() => {
      return window.graphStore.nodes.length;
    });
    expect(nodes).toBe(2);
  });
});
```

## デプロイ設定

### Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".svelte-kit/output",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "sveltekit"
}
```

### Supabaseスキーマ
```sql
-- ノードテーブル
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  stage TEXT NOT NULL,
  position JSONB NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- エッジテーブル
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  source TEXT REFERENCES nodes(id) ON DELETE CASCADE,
  target TEXT REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  strength FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_nodes_stage ON nodes(stage);
CREATE INDEX idx_edges_source ON edges(source);
CREATE INDEX idx_edges_target ON edges(target);
```

## TDDワークフロー（チェックボックス式手順書）

### Phase 1: SvelteKit環境構築
- [ ] **TODOリスト作成**
  - [ ] グラフビューの機能要件をリストアップ
  - [ ] 3D表現の技術的要件を整理
  - [ ] タスクを15分単位に分解

- [ ] **プロジェクト初期化**
  - [ ] `npm create svelte@latest`でSvelteKitプロジェクト作成
  - [ ] TypeScript設定の確認
  - [ ] Vitestの設定
  - [ ] 最初のテスト（設定確認）を作成
  - [ ] テスト失敗を確認（RED）
  - [ ] 設定を追加してテストを通す（GREEN）

### Phase 2: グラフデータモデル
- [ ] **Superstructでのモデル定義テスト**
  - [ ] `tests/models/graph.test.ts`を作成
  - [ ] NodeStructの検証テストを書く
  - [ ] EdgeStructの検証テストを書く
  - [ ] グラフ循環検出のテストを書く
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **モデルの段階的実装**
  - [ ] 基本的なNode型を定義（仮実装）
  - [ ] 3D座標を含む型に拡張
  - [ ] Edge型を定義
  - [ ] グラフバリデーション関数を実装
  - [ ] 循環検出アルゴリズムを追加
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 3: MobXストア実装
- [ ] **グラフストアのテスト作成**
  - [ ] `tests/stores/graph.test.ts`を作成
  - [ ] ノード追加のテストを書く
  - [ ] エッジ作成のテストを書く
  - [ ] 物理シミュレーションのテストを書く
  - [ ] フィルタリング機能のテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **ストアの実装**
  - [ ] 基本的なMobXストアを作成
  - [ ] addNodeメソッドの仮実装
  - [ ] 最初のテストが通ることを確認
  - [ ] connectNodesメソッドを実装
  - [ ] 位置更新ロジックを追加
  - [ ] Force-directedアルゴリズムを実装
  - [ ] リファクタリング（パフォーマンス最適化）

### Phase 4: 3Dグラフビュー実装
- [ ] **GraphViewコンポーネントのテスト**
  - [ ] Playwrightでのコンポーネントテスト作成
  - [ ] キャンバス表示のテストを書く
  - [ ] ノードクリックのテストを書く
  - [ ] ズーム/パン機能のテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **Three.js統合**
  - [ ] 基本的なcanvas要素を配置
  - [ ] Three.jsシーンをセットアップ
  - [ ] ノードを球体として描画
  - [ ] エッジを線として描画
  - [ ] カメラコントロールを追加
  - [ ] インタラクション機能を実装
  - [ ] 各ステップでテストを実行

### Phase 5: Svelteコンポーネント実装
- [ ] **ノード詳細パネルのテスト**
  - [ ] コンポーネントテストを作成
  - [ ] ノード情報表示のテストを書く
  - [ ] 接続情報表示のテストを書く
  - [ ] KPI表示のテストを書く

- [ ] **UIコンポーネントの実装**
  - [ ] 基本的なレイアウトを作成
  - [ ] Ant Design統合（antd-svelte）
  - [ ] ストアとのバインディング
  - [ ] リアクティブ更新の実装
  - [ ] スタイリング（白黒テーマ）

### Phase 6: グラフ操作機能
- [ ] **インタラクション機能のテスト**
  - [ ] ドラッグ操作のテスト
  - [ ] 右クリックメニューのテスト
  - [ ] キーボードショートカットのテスト

- [ ] **機能実装**
  - [ ] ノードのドラッグ&ドロップ
  - [ ] コンテキストメニュー
  - [ ] 検索機能
  - [ ] フィルタリング機能
  - [ ] ビューの保存/読み込み

### Phase 7: 物理エンジン最適化
- [ ] **パフォーマンステスト**
  - [ ] 1000ノードでのFPS測定テスト
  - [ ] メモリ使用量の測定
  - [ ] レンダリング最適化のテスト

- [ ] **最適化実装**
  - [ ] Web Workerでの物理演算
  - [ ] LOD（Level of Detail）実装
  - [ ] 仮想化（視界外ノードの非表示）
  - [ ] バッチレンダリング
  - [ ] GPU最適化

### Phase 8: SvelteKit特有の機能
- [ ] **SSR/ハイドレーション対応**
  - [ ] SSR時のThree.js処理テスト
  - [ ] クライアントサイドハイドレーションテスト
  - [ ] エラーハンドリングテスト

- [ ] **実装**
  - [ ] ブラウザ環境チェック
  - [ ] 動的インポート設定
  - [ ] プログレッシブエンハンスメント
  - [ ] フォールバック実装

### Phase 9: E2Eテスト
- [ ] **Playwrightでの統合テスト**
  - [ ] グラフ作成フローのテスト
  - [ ] ノード接続フローのテスト
  - [ ] 保存/読み込みフローのテスト
  - [ ] すべてのE2Eテストが失敗することを確認（RED）

- [ ] **E2E実装**
  - [ ] 基本的なナビゲーション
  - [ ] グラフ操作シナリオ
  - [ ] データ永続化確認
  - [ ] パフォーマンス測定
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 10: Supabase統合
- [ ] **データ永続化のテスト**
  - [ ] ノード保存のテスト
  - [ ] エッジ保存のテスト
  - [ ] リアルタイム同期のテスト

- [ ] **実装**
  - [ ] Supabaseクライアント設定
  - [ ] CRUD操作の実装
  - [ ] リアルタイムサブスクリプション
  - [ ] 競合解決ロジック
  - [ ] オフライン対応

### チェックポイント
各フェーズ完了時に確認：
- [ ] すべてのテストが通っている
- [ ] 1000ノードで60FPSを維持
- [ ] メモリリークがない
- [ ] TypeScriptエラーが0
- [ ] アクセシビリティ対応
- [ ] グラフの保存/読み込みが正常動作

## まとめ

このノード形式UI実装は、Obsidianのグラフビューからインスピレーションを得た3D空間でのノードグラフ表現により、アイデアと事業の関係性を直感的に探索できます。SvelteKitとMobXの組み合わせにより、リアクティブで高性能なUIを実現し、Three.jsによる美しい3Dビジュアライゼーションを提供します。白黒のモダンデザインを維持しながら、インタラクティブな体験を実現しています。