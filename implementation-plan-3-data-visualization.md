# 実装計画3: データビジュアライゼーション重視UI版

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
リーンスタートアップの進捗とKPIを高度なデータビジュアライゼーションで表現し、意思決定を支援するダッシュボード型UI。

## 技術スタック
- **フレームワーク**: Astro + React (Islands Architecture)
- **UIライブラリ**: Mantine UI
- **状態管理**: Valtio
- **グラフライブラリ**: D3.js + Recharts
- **データベース**: Supabase
- **テスト**: Vitest + React Testing Library + WebdriverIO
- **型安全性**: TypeScript + Joi

## UI設計

### メインダッシュボード
```
┌─────────────────────────────────────────────────────────────┐
│ ParallelLean Analytics                    📊 Filter ▼ Export │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │ Active Projects     │  │ Success Rate        │         │
│  │                     │  │                     │         │
│  │        12           │  │    ███████ 67%     │         │
│  │    ▲ +3 this month  │  │    ░░░░░░░ 33%     │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  ┌───────────────────────────────────────────────┐         │
│  │ Project Pipeline Flow                         │         │
│  │                                               │         │
│  │ Stock ══════╗                                 │         │
│  │             ╚══> Build ═══╗                   │         │
│  │                          ╚══> Measure ═══╗    │         │
│  │                                         ╚══>  │         │
│  │  [15]        [8]         [5]         [2]     │         │
│  └───────────────────────────────────────────────┘         │
│                                                             │
│  ┌───────────────────────────┬─────────────────────────┐   │
│  │ Time-to-Market Analysis   │ Resource Allocation     │   │
│  │ ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐ │     Ideation 25%       │   │
│  │ │ │ │ │█│█│█│█│█│█│█│█│ │     Building 45%       │   │
│  │ │ │█│█│█│█│█│█│█│█│█│█│ │     Testing  20%       │   │
│  │ │█│█│█│█│█│█│█│█│█│█│█│ │     Learning 10%       │   │
│  │ └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘ │                         │   │
│  │  J F M A M J J A S O N   │  ⬤ ⬤ ⬤ ⬤             │   │
│  └───────────────────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### プロジェクト詳細分析ビュー
```
┌─────────────────────────────────────────────────────────────┐
│ Project: AI Assistant - Analytics                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │ KPI Performance Matrix                       │           │
│  │                                              │           │
│  │         User Growth    Revenue    Retention │           │
│  │ Week 1     █░░░         ░░░         ███    │           │
│  │ Week 2     ██░░         █░░         ███    │           │
│  │ Week 3     ███░         ██░         ██░    │           │
│  │ Week 4     ████         ███         ██░    │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌────────────────┬────────────────┬──────────────┐        │
│  │ Conversion      │ Engagement     │ Velocity     │        │
│  │ Funnel         │ Heatmap        │              │        │
│  │                │ M T W T F S S  │      42      │        │
│  │ Visit  ████    │ ░░█████████░  │   days to    │        │
│  │ Trial  ██      │ ░████████░░░  │   market     │        │
│  │ Paid   █       │ ░█████░░░░░░  │              │        │
│  └────────────────┴────────────────┴──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## TDD実装ワークフロー

### 1. プロジェクトセットアップ

#### RED
```typescript
// tests/setup/project.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have Astro configured with React integration', () => {
    const astroConfig = require('../astro.config.mjs');
    expect(astroConfig.integrations).toContainEqual(
      expect.objectContaining({ name: '@astrojs/react' })
    );
  });

  it('should have Valtio store configured', () => {
    const { store } = require('../src/stores/analytics');
    expect(store).toBeDefined();
    expect(store.projects).toBeDefined();
  });
});
```

#### GREEN
```bash
npm create astro@latest parallel-lean-visualization -- --template minimal --typescript
cd parallel-lean-visualization
npx astro add react
npm install @mantine/core @mantine/hooks @mantine/charts valtio
npm install d3 recharts joi
npm install -D vitest @testing-library/react webdriverio
```

### 2. データモデル実装（分析用）

#### RED
```typescript
// tests/models/analytics.test.ts
import { describe, it, expect } from 'vitest';
import Joi from 'joi';
import { MetricSchema, ProjectAnalyticsSchema } from '~/models/analytics';

describe('Analytics Models', () => {
  it('should validate metric data', () => {
    const validMetric = {
      name: 'user_growth',
      value: 150,
      timestamp: new Date(),
      unit: 'users',
      change: 15.5
    };
    
    const { error } = MetricSchema.validate(validMetric);
    expect(error).toBeUndefined();
  });

  it('should validate project analytics', () => {
    const validAnalytics = {
      projectId: '123',
      metrics: {
        userGrowth: [{ value: 100, timestamp: new Date() }],
        revenue: [{ value: 5000, timestamp: new Date() }],
        retention: [{ value: 85, timestamp: new Date() }]
      },
      timeToMarket: 42,
      conversionFunnel: {
        visit: 1000,
        trial: 200,
        paid: 50
      }
    };
    
    const { error } = ProjectAnalyticsSchema.validate(validAnalytics);
    expect(error).toBeUndefined();
  });
});
```

#### GREEN
```typescript
// src/models/analytics.ts
import Joi from 'joi';

export const MetricSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.number().required(),
  timestamp: Joi.date().required(),
  unit: Joi.string().optional(),
  change: Joi.number().optional()
});

export const TimeSeriesDataSchema = Joi.array().items(
  Joi.object({
    value: Joi.number().required(),
    timestamp: Joi.date().required()
  })
);

export const ConversionFunnelSchema = Joi.object({
  visit: Joi.number().required(),
  trial: Joi.number().required(),
  paid: Joi.number().required()
});

export const ProjectAnalyticsSchema = Joi.object({
  projectId: Joi.string().required(),
  metrics: Joi.object({
    userGrowth: TimeSeriesDataSchema,
    revenue: TimeSeriesDataSchema,
    retention: TimeSeriesDataSchema
  }).required(),
  timeToMarket: Joi.number().optional(),
  conversionFunnel: ConversionFunnelSchema.optional(),
  resourceAllocation: Joi.object({
    ideation: Joi.number(),
    building: Joi.number(),
    testing: Joi.number(),
    learning: Joi.number()
  }).optional()
});

export type Metric = {
  name: string;
  value: number;
  timestamp: Date;
  unit?: string;
  change?: number;
};

export type ProjectAnalytics = {
  projectId: string;
  metrics: {
    userGrowth: Array<{ value: number; timestamp: Date }>;
    revenue: Array<{ value: number; timestamp: Date }>;
    retention: Array<{ value: number; timestamp: Date }>;
  };
  timeToMarket?: number;
  conversionFunnel?: {
    visit: number;
    trial: number;
    paid: number;
  };
  resourceAllocation?: {
    ideation: number;
    building: number;
    testing: number;
    learning: number;
  };
};
```

### 3. Valtio Store実装

#### RED
```typescript
// tests/stores/analytics.test.ts
import { describe, it, expect } from 'vitest';
import { analyticsStore, updateMetric, calculateSuccessRate } from '~/stores/analytics';

describe('Analytics Store', () => {
  it('should update project metrics', () => {
    const projectId = '123';
    updateMetric(projectId, 'userGrowth', 150);
    
    const project = analyticsStore.projects.find(p => p.id === projectId);
    expect(project?.analytics.metrics.userGrowth).toHaveLength(1);
    expect(project?.analytics.metrics.userGrowth[0].value).toBe(150);
  });

  it('should calculate success rate', () => {
    analyticsStore.projects = [
      { id: '1', stage: 'measure', success: true },
      { id: '2', stage: 'archive', success: false },
      { id: '3', stage: 'learn', success: true }
    ];
    
    const rate = calculateSuccessRate();
    expect(rate).toBe(67); // 2/3 = 66.67%
  });

  it('should track pipeline flow', () => {
    analyticsStore.projects = [
      { id: '1', stage: 'stock' },
      { id: '2', stage: 'stock' },
      { id: '3', stage: 'build' },
      { id: '4', stage: 'measure' }
    ];
    
    const flow = analyticsStore.pipelineFlow;
    expect(flow.stock).toBe(2);
    expect(flow.build).toBe(1);
    expect(flow.measure).toBe(1);
  });
});
```

#### GREEN
```typescript
// src/stores/analytics.ts
import { proxy } from 'valtio';
import { ProjectAnalytics } from '~/models/analytics';

interface Project {
  id: string;
  title: string;
  stage: 'stock' | 'build' | 'measure' | 'learn' | 'archive';
  success?: boolean;
  analytics: ProjectAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsStore {
  projects: Project[];
  activeProjects: number;
  successRate: number;
  pipelineFlow: {
    stock: number;
    build: number;
    measure: number;
    learn: number;
    archive: number;
  };
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}

export const analyticsStore = proxy<AnalyticsStore>({
  projects: [],
  activeProjects: 0,
  successRate: 0,
  pipelineFlow: {
    stock: 0,
    build: 0,
    measure: 0,
    learn: 0,
    archive: 0
  },
  timeRange: 'month'
});

export function updateMetric(
  projectId: string, 
  metricName: keyof ProjectAnalytics['metrics'], 
  value: number
) {
  const project = analyticsStore.projects.find(p => p.id === projectId);
  if (!project) {
    // Create new project if not exists
    const newProject: Project = {
      id: projectId,
      title: `Project ${projectId}`,
      stage: 'stock',
      analytics: {
        projectId,
        metrics: {
          userGrowth: [],
          revenue: [],
          retention: []
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    analyticsStore.projects.push(newProject);
  }
  
  const targetProject = analyticsStore.projects.find(p => p.id === projectId)!;
  targetProject.analytics.metrics[metricName].push({
    value,
    timestamp: new Date()
  });
  
  // Keep only last 100 data points
  if (targetProject.analytics.metrics[metricName].length > 100) {
    targetProject.analytics.metrics[metricName] = 
      targetProject.analytics.metrics[metricName].slice(-100);
  }
}

export function calculateSuccessRate(): number {
  const completed = analyticsStore.projects.filter(
    p => p.stage === 'measure' || p.stage === 'learn' || p.stage === 'archive'
  );
  
  if (completed.length === 0) return 0;
  
  const successful = completed.filter(p => p.success).length;
  return Math.round((successful / completed.length) * 100);
}

export function updatePipelineFlow() {
  const flow = {
    stock: 0,
    build: 0,
    measure: 0,
    learn: 0,
    archive: 0
  };
  
  analyticsStore.projects.forEach(project => {
    flow[project.stage]++;
  });
  
  analyticsStore.pipelineFlow = flow;
}

// Auto-update calculations
setInterval(() => {
  analyticsStore.successRate = calculateSuccessRate();
  analyticsStore.activeProjects = analyticsStore.projects.filter(
    p => p.stage !== 'archive'
  ).length;
  updatePipelineFlow();
}, 1000);
```

### 4. チャートコンポーネント実装

#### RED
```typescript
// tests/components/PipelineFlow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PipelineFlow } from '~/components/charts/PipelineFlow';

describe('PipelineFlow', () => {
  it('should render pipeline stages', () => {
    const data = {
      stock: 15,
      build: 8,
      measure: 5,
      learn: 2,
      archive: 3
    };
    
    render(<PipelineFlow data={data} />);
    
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('[15]')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('[8]')).toBeInTheDocument();
  });

  it('should show flow connections', () => {
    render(<PipelineFlow data={{}} />);
    
    const svg = screen.getByRole('img', { name: /pipeline flow/i });
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});
```

#### GREEN
```typescript
// src/components/charts/PipelineFlow.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper, Text } from '@mantine/core';

interface PipelineFlowProps {
  data: {
    stock: number;
    build: number;
    measure: number;
    learn: number;
    archive: number;
  };
}

export function PipelineFlow({ data }: PipelineFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 300;
    const nodeWidth = 120;
    const nodeHeight = 60;

    // Clear previous content
    svg.selectAll('*').remove();

    // Define stages
    const stages = [
      { name: 'Stock', value: data.stock, x: 50 },
      { name: 'Build', value: data.build, x: 200 },
      { name: 'Measure', value: data.measure, x: 350 },
      { name: 'Learn', value: data.learn, x: 500 },
      { name: 'Archive', value: data.archive, x: 650 }
    ];

    // Create nodes
    const nodes = svg.selectAll('.node')
      .data(stages)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${height/2 - nodeHeight/2})`);

    // Add rectangles
    nodes.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('fill', '#ffffff')
      .attr('stroke', '#000000')
      .attr('stroke-width', 2);

    // Add labels
    nodes.append('text')
      .attr('x', nodeWidth / 2)
      .attr('y', nodeHeight / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Silka-Mono')
      .attr('font-size', '14px')
      .text(d => d.name);

    // Add values
    nodes.append('text')
      .attr('x', nodeWidth / 2)
      .attr('y', nodeHeight / 2 + 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Silka-Mono')
      .attr('font-size', '12px')
      .attr('fill', '#666666')
      .text(d => `[${d.value}]`);

    // Create flow lines
    const flowData = stages.slice(0, -1).map((stage, i) => ({
      source: stage,
      target: stages[i + 1]
    }));

    svg.selectAll('.flow')
      .data(flowData)
      .enter()
      .append('path')
      .attr('class', 'flow')
      .attr('d', d => {
        const x1 = d.source.x + nodeWidth;
        const y1 = height / 2;
        const x2 = d.target.x;
        const y2 = height / 2;
        return `M ${x1} ${y1} L ${x2} ${y2}`;
      })
      .attr('stroke', '#333333')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)');

    // Add arrowhead marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#333333');

  }, [data]);

  return (
    <Paper p="md" withBorder>
      <Text size="sm" weight={600} mb="md" ff="Silka-Mono">
        Project Pipeline Flow
      </Text>
      <Box>
        <svg
          ref={svgRef}
          width="100%"
          height={300}
          viewBox="0 0 800 300"
          role="img"
          aria-label="pipeline flow visualization"
        />
      </Box>
    </Paper>
  );
}
```

### 5. KPIマトリックスコンポーネント実装

#### RED
```typescript
// tests/components/KPIMatrix.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPIMatrix } from '~/components/charts/KPIMatrix';

describe('KPIMatrix', () => {
  const mockData = {
    userGrowth: [
      { week: 1, value: 25 },
      { week: 2, value: 50 },
      { week: 3, value: 75 },
      { week: 4, value: 100 }
    ],
    revenue: [
      { week: 1, value: 0 },
      { week: 2, value: 25 },
      { week: 3, value: 50 },
      { week: 4, value: 75 }
    ],
    retention: [
      { week: 1, value: 100 },
      { week: 2, value: 100 },
      { week: 3, value: 80 },
      { week: 4, value: 60 }
    ]
  };

  it('should render KPI headers', () => {
    render(<KPIMatrix data={mockData} />);
    
    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Retention')).toBeInTheDocument();
  });

  it('should render progress bars for each week', () => {
    render(<KPIMatrix data={mockData} />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(12); // 3 KPIs × 4 weeks
  });
});
```

#### GREEN
```typescript
// src/components/charts/KPIMatrix.tsx
import React from 'react';
import { Box, Paper, Text, Progress, Grid, Group } from '@mantine/core';

interface KPIMatrixProps {
  data: {
    userGrowth: Array<{ week: number; value: number }>;
    revenue: Array<{ week: number; value: number }>;
    retention: Array<{ week: number; value: number }>;
  };
}

export function KPIMatrix({ data }: KPIMatrixProps) {
  const kpis = [
    { name: 'User Growth', data: data.userGrowth, color: 'dark' },
    { name: 'Revenue', data: data.revenue, color: 'gray' },
    { name: 'Retention', data: data.retention, color: 'dark' }
  ];

  return (
    <Paper p="md" withBorder>
      <Text size="sm" weight={600} mb="md" ff="Silka-Mono">
        KPI Performance Matrix
      </Text>
      
      <Grid gutter="xs">
        <Grid.Col span={3}>
          <Box h={100} />
          {[1, 2, 3, 4].map(week => (
            <Text key={week} size="xs" ff="Silka-Mono" mb="sm">
              Week {week}
            </Text>
          ))}
        </Grid.Col>
        
        {kpis.map(kpi => (
          <Grid.Col key={kpi.name} span={3}>
            <Text size="xs" ff="Silka-Mono" mb="md" align="center">
              {kpi.name}
            </Text>
            {kpi.data.map((item, index) => (
              <Box key={index} mb="sm">
                <Progress
                  value={item.value}
                  color={kpi.color}
                  size="xl"
                  role="progressbar"
                  aria-label={`${kpi.name} week ${item.week}: ${item.value}%`}
                  styles={{
                    bar: { backgroundColor: '#000000' },
                    root: { backgroundColor: '#E0E0E0' }
                  }}
                />
              </Box>
            ))}
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
}
```

### 6. ダッシュボードレイアウト実装

#### RED
```typescript
// tests/components/AnalyticsDashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '~/components/AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  it('should render all dashboard sections', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('ParallelLean Analytics')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Project Pipeline Flow')).toBeInTheDocument();
  });

  it('should have filter and export controls', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
```

#### GREEN
```typescript
// src/components/AnalyticsDashboard.tsx
import React from 'react';
import { 
  AppShell, 
  Header, 
  Container, 
  Grid, 
  Paper, 
  Text, 
  Group, 
  Button,
  Select,
  StatCard
} from '@mantine/core';
import { useSnapshot } from 'valtio';
import { analyticsStore } from '~/stores/analytics';
import { PipelineFlow } from './charts/PipelineFlow';
import { KPIMatrix } from './charts/KPIMatrix';
import { TimeToMarketChart } from './charts/TimeToMarketChart';
import { ResourceAllocation } from './charts/ResourceAllocation';

export function AnalyticsDashboard() {
  const store = useSnapshot(analyticsStore);

  return (
    <AppShell
      header={
        <Header height={60} p="md">
          <Group position="apart">
            <Text size="lg" weight={600} ff="Silka-Mono">
              ParallelLean Analytics
            </Text>
            <Group>
              <Select
                placeholder="Filter"
                data={['All', 'Active', 'Archived']}
                size="sm"
                styles={{
                  input: { fontFamily: 'Silka-Mono' }
                }}
              />
              <Button variant="outline" color="dark" size="sm">
                Export
              </Button>
            </Group>
          </Group>
        </Header>
      }
    >
      <Container size="xl" py="md">
        <Grid gutter="md">
          {/* Summary Cards */}
          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" ff="Silka-Mono">
                Active Projects
              </Text>
              <Text size="xl" weight={600} ff="Silka-Mono" mt="xs">
                {store.activeProjects}
              </Text>
              <Text size="xs" color="dimmed" ff="Silka-Mono">
                ▲ +3 this month
              </Text>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" ff="Silka-Mono">
                Success Rate
              </Text>
              <Group mt="xs">
                <Box w={100}>
                  <Progress 
                    value={store.successRate} 
                    size="xl"
                    color="dark"
                  />
                </Box>
                <Text size="xl" weight={600} ff="Silka-Mono">
                  {store.successRate}%
                </Text>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Pipeline Flow */}
          <Grid.Col span={12}>
            <PipelineFlow data={store.pipelineFlow} />
          </Grid.Col>

          {/* Time to Market & Resource Allocation */}
          <Grid.Col span={6}>
            <TimeToMarketChart />
          </Grid.Col>
          <Grid.Col span={6}>
            <ResourceAllocation />
          </Grid.Col>
        </Grid>
      </Container>
    </AppShell>
  );
}
```

### 7. E2Eテスト実装

```typescript
// tests/e2e/analytics-flow.test.ts
import { browser, $, expect } from '@wdio/globals';

describe('Analytics Dashboard E2E', () => {
  it('should display real-time metrics', async () => {
    await browser.url('/');
    
    // Check active projects counter
    const activeProjects = await $('.active-projects');
    const initialCount = await activeProjects.getText();
    
    // Add a new project
    await $('.add-project-btn').click();
    await $('input[name="title"]').setValue('E2E Test Project');
    await $('.submit-btn').click();
    
    // Verify counter increased
    await browser.waitUntil(
      async () => {
        const newCount = await activeProjects.getText();
        return parseInt(newCount) > parseInt(initialCount);
      },
      { timeout: 5000 }
    );
  });

  it('should filter projects by stage', async () => {
    await browser.url('/');
    
    // Apply filter
    await $('.filter-select').click();
    await $('.filter-option-build').click();
    
    // Verify filtered results
    const projects = await $$('.project-card');
    for (const project of projects) {
      const stage = await project.$('.stage-label').getText();
      expect(stage).toBe('Build');
    }
  });

  it('should export analytics data', async () => {
    await browser.url('/');
    
    // Click export button
    await $('.export-btn').click();
    
    // Verify download started
    const downloads = await browser.getWindowHandles();
    expect(downloads.length).toBeGreaterThan(0);
  });
});
```

## Astro Islands Architecture

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
---

<Layout title="ParallelLean Analytics">
  <main>
    <!-- Static content -->
    <div class="hero">
      <h1>Data-Driven Lean Startup</h1>
    </div>
    
    <!-- Interactive React island -->
    <AnalyticsDashboard client:load />
    
    <!-- Static footer -->
    <footer>
      <p>© 2024 ParallelLean</p>
    </footer>
  </main>
</Layout>

<style>
  @font-face {
    font-family: 'Silka-Mono';
    src: url('/fonts/Silka-Mono-Regular.woff2') format('woff2');
  }
  
  :global(body) {
    font-family: 'Silka-Mono', monospace;
    background-color: #FAFAFA;
    color: #1A1A1A;
  }
</style>
```

## デプロイ設定

### Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "astro"
}
```

## TDDワークフロー（チェックボックス式手順書）

### Phase 1: Astroプロジェクト初期化
- [ ] **TODOリスト作成**
  - [ ] 必要なビジュアライゼーション要素をリストアップ
  - [ ] 各グラフ/チャートの仕様を明確化
  - [ ] タスクを15分単位に分解

- [ ] **Astro + React環境構築**
  - [ ] `npm create astro@latest`でプロジェクト作成
  - [ ] React統合を追加 (`npx astro add react`)
  - [ ] TypeScript設定の確認
  - [ ] Vitestの設定
  - [ ] 最初のテスト実行で失敗を確認（RED）
  - [ ] 基本設定を追加してテストを通す（GREEN）

### Phase 2: 分析用データモデル
- [ ] **Joiスキーマのテスト作成**
  - [ ] `tests/models/analytics.test.ts`を作成
  - [ ] MetricSchemaの検証テストを書く
  - [ ] ProjectAnalyticsSchemaのテストを書く
  - [ ] 時系列データの検証テストを書く
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **モデルの実装**
  - [ ] 基本的なスキーマ定義（仮実装）
  - [ ] メトリクスデータの型を定義
  - [ ] 時系列データ構造を実装
  - [ ] コンバージョンファネルの型を追加
  - [ ] バリデーションロジックを強化
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 3: Valtioストア実装
- [ ] **分析ストアのテスト**
  - [ ] `tests/stores/analytics.test.ts`を作成
  - [ ] メトリクス更新のテストを書く
  - [ ] 成功率計算のテストを書く
  - [ ] パイプラインフローのテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **ストアの段階的実装**
  - [ ] 基本的なproxyストアを作成
  - [ ] updateMetric関数の仮実装
  - [ ] 最初のテストが通ることを確認
  - [ ] 成功率計算ロジックを追加
  - [ ] 自動更新メカニズムを実装
  - [ ] パフォーマンス最適化
  - [ ] リファクタリング

### Phase 4: D3.jsチャート実装
- [ ] **PipelineFlowコンポーネントのテスト**
  - [ ] `tests/components/PipelineFlow.test.tsx`を作成
  - [ ] ステージ表示のテストを書く
  - [ ] 接続線描画のテストを書く
  - [ ] インタラクションのテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **D3.js実装**
  - [ ] 基本的なSVG構造を作成
  - [ ] ノード（ステージ）を描画
  - [ ] 接続線を追加
  - [ ] アニメーションを実装
  - [ ] レスポンシブ対応
  - [ ] 各ステップでテストを実行

### Phase 5: Rechartsグラフ実装
- [ ] **KPIマトリックスのテスト**
  - [ ] コンポーネントテストを作成
  - [ ] データ表示のテストを書く
  - [ ] プログレスバーのテストを書く
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **段階的実装**
  - [ ] 静的なレイアウトを作成
  - [ ] Mantine UIでスタイリング
  - [ ] データバインディングを追加
  - [ ] インタラクティブ機能を実装
  - [ ] アクセシビリティ対応

### Phase 6: ダッシュボード統合
- [ ] **ダッシュボードレイアウトのテスト**
  - [ ] 全体レイアウトのテスト
  - [ ] フィルター機能のテスト
  - [ ] エクスポート機能のテスト

- [ ] **実装**
  - [ ] レイアウトコンポーネントを作成
  - [ ] 各チャートコンポーネントを配置
  - [ ] フィルター機能を実装
  - [ ] データエクスポート機能を追加
  - [ ] リアルタイム更新機能

### Phase 7: Astro Islands最適化
- [ ] **パフォーマンステスト**
  - [ ] 初期レンダリング時間の測定
  - [ ] インタラクティブ時間の測定
  - [ ] バンドルサイズの確認

- [ ] **最適化実装**
  - [ ] 適切なclient:ディレクティブの使用
  - [ ] 静的部分と動的部分の分離
  - [ ] 遅延ローディングの実装
  - [ ] キャッシュ戦略の設定

### Phase 8: 高度なビジュアライゼーション
- [ ] **追加チャートの実装**
  - [ ] ヒートマップのテストと実装
  - [ ] サンキーダイアグラムのテストと実装
  - [ ] 3Dグラフのテストと実装（必要に応じて）

- [ ] **インタラクション強化**
  - [ ] ズーム/パン機能
  - [ ] ツールチップの改善
  - [ ] クロスフィルタリング
  - [ ] アニメーション連携

### Phase 9: E2Eテスト
- [ ] **WebdriverIOセットアップ**
  - [ ] WebdriverIOのインストールと設定
  - [ ] 基本的なナビゲーションテスト作成
  - [ ] テスト失敗を確認（RED）

- [ ] **統合テストの実装**
  - [ ] ダッシュボード表示テスト
  - [ ] フィルタリング動作テスト
  - [ ] データ更新の反映テスト
  - [ ] エクスポート機能テスト
  - [ ] すべてのE2Eテストが通ることを確認（GREEN）

### Phase 10: データ統合
- [ ] **Supabaseリアルタイム連携**
  - [ ] リアルタイムサブスクリプションのテスト
  - [ ] データ同期ロジックの実装
  - [ ] エラーハンドリング
  - [ ] 再接続処理

### チェックポイント
各フェーズ完了時に確認：
- [ ] すべてのテストが通っている
- [ ] グラフ描画パフォーマンスが60FPS
- [ ] データ更新の遅延が100ms以内
- [ ] アクセシビリティ（WCAG AA）準拠
- [ ] モバイルでの表示確認
- [ ] データの正確性検証

## まとめ

このデータビジュアライゼーション重視実装は、リーンスタートアップの進捗を定量的に分析・可視化することに焦点を当てています。D3.jsとRechartsを活用した高度なチャート表現により、データドリブンな意思決定を支援します。Astroのアイランドアーキテクチャにより、静的な部分と動的な部分を効率的に分離し、パフォーマンスを最適化しています。