# 実装計画1: カンバンボード風UI版

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

# カンバンボード風UI実装計画

## 概要
リーンスタートアップの各ステージをカンバンボードのレーンとして表現し、アイデアから事業へと進化する過程を視覚的に管理できるUI。

## 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **UIライブラリ**: Tailwind CSS + Radix UI
- **状態管理**: Zustand
- **アニメーション**: Framer Motion
- **データベース**: Supabase
- **テスト**: Jest + React Testing Library + Playwright
- **型安全性**: TypeScript + Zod

## UI設計

### レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│  ParallelLean                                    [+] Add Idea│
├─────────────────────────────────────────────────────────────┤
│ Stock      │ Build      │ Measure    │ Learn      │ Archive │
├────────────┼────────────┼────────────┼────────────┼─────────┤
│ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │┌───────┐│
│ │ Idea 1 │ │ │Project1│ │ │Business│ │ │Business│ ││Ended 1││
│ └────────┘ │ │  MVP   │ │ │  KPI   │ │ │Insight │ │└───────┘│
│ ┌────────┐ │ └────────┘ │ └────────┘ │ └────────┘ │┌───────┐│
│ │ Idea 2 │ │            │            │            ││Ended 2││
│ └────────┘ │            │            │            │└───────┘│
└─────────────────────────────────────────────────────────────┘
```

### カード設計
- **ドラッグ&ドロップ**: react-beautiful-dnd使用
- **カードの展開**: クリックで詳細ビューをモーダル表示
- **進捗インジケーター**: カード上部に細いプログレスバー
- **タグシステム**: カード下部にモノトーンのタグ

## TDD実装ワークフロー

### 1. プロジェクトセットアップ

#### RED
```typescript
// __tests__/setup/project.test.ts
describe('Project Setup', () => {
  it('should have Next.js 14 with App Router configured', () => {
    const nextConfig = require('../next.config.js');
    expect(nextConfig.experimental?.appDir).toBe(true);
  });

  it('should have TypeScript configured with strict mode', () => {
    const tsConfig = require('../tsconfig.json');
    expect(tsConfig.compilerOptions.strict).toBe(true);
  });
});
```

#### GREEN
```bash
npx create-next-app@latest parallel-lean-kanban --typescript --tailwind --app
cd parallel-lean-kanban
npm install zustand framer-motion @radix-ui/react-dialog react-beautiful-dnd
npm install -D jest @testing-library/react @testing-library/jest-dom playwright
```

#### REFACTOR
- ESLint設定の最適化
- Prettierの設定追加
- VSCode設定ファイルの追加

### 2. データモデル実装

#### RED
```typescript
// __tests__/models/idea.test.ts
import { ideaSchema } from '@/models/idea';

describe('Idea Model', () => {
  it('should validate a valid idea', () => {
    const validIdea = {
      id: '123',
      title: 'AI Personal Assistant',
      description: 'An AI that helps with daily tasks',
      stage: 'stock',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(() => ideaSchema.parse(validIdea)).not.toThrow();
  });

  it('should reject invalid stage', () => {
    const invalidIdea = {
      id: '123',
      title: 'Test',
      stage: 'invalid-stage'
    };
    
    expect(() => ideaSchema.parse(invalidIdea)).toThrow();
  });
});
```

#### GREEN
```typescript
// src/models/idea.ts
import { z } from 'zod';

export const stageSchema = z.enum(['stock', 'build', 'measure', 'learn', 'archive']);

export const ideaSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  stage: stageSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()).default([]),
  position: z.number().default(0)
});

export type Idea = z.infer<typeof ideaSchema>;
export type Stage = z.infer<typeof stageSchema>;
```

### 3. Zustandストア実装

#### RED
```typescript
// __tests__/stores/kanban.test.ts
import { useKanbanStore } from '@/stores/kanban';

describe('Kanban Store', () => {
  beforeEach(() => {
    useKanbanStore.getState().reset();
  });

  it('should add an idea to stock', () => {
    const { addIdea, getIdeasByStage } = useKanbanStore.getState();
    
    addIdea({
      title: 'New Idea',
      description: 'Test description'
    });
    
    const stockIdeas = getIdeasByStage('stock');
    expect(stockIdeas).toHaveLength(1);
    expect(stockIdeas[0].title).toBe('New Idea');
  });

  it('should move idea between stages', () => {
    const { addIdea, moveIdea, getIdeasByStage } = useKanbanStore.getState();
    
    const idea = addIdea({ title: 'Test' });
    moveIdea(idea.id, 'build');
    
    expect(getIdeasByStage('stock')).toHaveLength(0);
    expect(getIdeasByStage('build')).toHaveLength(1);
  });
});
```

#### GREEN
```typescript
// src/stores/kanban.ts
import { create } from 'zustand';
import { Idea, Stage } from '@/models/idea';

interface KanbanStore {
  ideas: Idea[];
  addIdea: (data: Partial<Idea>) => Idea;
  moveIdea: (id: string, toStage: Stage) => void;
  updateIdea: (id: string, data: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  getIdeasByStage: (stage: Stage) => Idea[];
  reset: () => void;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  ideas: [],
  
  addIdea: (data) => {
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      title: data.title || '',
      description: data.description,
      stage: 'stock',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: data.tags || [],
      position: 0,
      ...data
    };
    
    set((state) => ({ ideas: [...state.ideas, newIdea] }));
    return newIdea;
  },
  
  moveIdea: (id, toStage) => {
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id
          ? { ...idea, stage: toStage, updatedAt: new Date() }
          : idea
      )
    }));
  },
  
  updateIdea: (id, data) => {
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id
          ? { ...idea, ...data, updatedAt: new Date() }
          : idea
      )
    }));
  },
  
  deleteIdea: (id) => {
    set((state) => ({
      ideas: state.ideas.filter((idea) => idea.id !== id)
    }));
  },
  
  getIdeasByStage: (stage) => {
    return get().ideas
      .filter((idea) => idea.stage === stage)
      .sort((a, b) => a.position - b.position);
  },
  
  reset: () => set({ ideas: [] })
}));
```

### 4. カンバンボードコンポーネント実装

#### RED
```typescript
// __tests__/components/KanbanBoard.test.tsx
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/KanbanBoard';

describe('KanbanBoard', () => {
  it('should render all stages', () => {
    render(<KanbanBoard />);
    
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Measure')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('should display ideas in correct lanes', () => {
    const mockIdeas = [
      { id: '1', title: 'Idea 1', stage: 'stock' },
      { id: '2', title: 'Idea 2', stage: 'build' }
    ];
    
    // Mock store with ideas
    useKanbanStore.setState({ ideas: mockIdeas });
    
    render(<KanbanBoard />);
    
    const stockLane = screen.getByTestId('lane-stock');
    const buildLane = screen.getByTestId('lane-build');
    
    expect(stockLane).toHaveTextContent('Idea 1');
    expect(buildLane).toHaveTextContent('Idea 2');
  });
});
```

#### GREEN
```typescript
// src/components/KanbanBoard.tsx
'use client';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useKanbanStore } from '@/stores/kanban';
import { Stage } from '@/models/idea';
import { Card } from './Card';

const stages: { id: Stage; label: string }[] = [
  { id: 'stock', label: 'Stock' },
  { id: 'build', label: 'Build' },
  { id: 'measure', label: 'Measure' },
  { id: 'learn', label: 'Learn' },
  { id: 'archive', label: 'Archive' }
];

export function KanbanBoard() {
  const { getIdeasByStage, moveIdea } = useKanbanStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    moveIdea(draggableId, destination.droppableId as Stage);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 p-6 overflow-x-auto">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-1 min-w-[300px]"
            data-testid={`lane-${stage.id}`}
          >
            <h2 className="mb-4 text-sm font-mono uppercase tracking-wider text-gray-600">
              {stage.label}
            </h2>
            
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    min-h-[500px] p-2 rounded-sm
                    ${snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-white'}
                    border border-gray-200
                    transition-colors duration-200
                  `}
                >
                  {getIdeasByStage(stage.id).map((idea, index) => (
                    <Draggable
                      key={idea.id}
                      draggableId={idea.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Card
                            idea={idea}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
```

### 5. カードコンポーネント実装

#### RED
```typescript
// __tests__/components/Card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '@/components/Card';

describe('Card', () => {
  const mockIdea = {
    id: '1',
    title: 'Test Idea',
    description: 'Test description',
    stage: 'stock' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['tag1', 'tag2']
  };

  it('should render idea title', () => {
    render(<Card idea={mockIdea} />);
    expect(screen.getByText('Test Idea')).toBeInTheDocument();
  });

  it('should show tags', () => {
    render(<Card idea={mockIdea} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should open detail modal on click', () => {
    render(<Card idea={mockIdea} />);
    fireEvent.click(screen.getByText('Test Idea'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

#### GREEN
```typescript
// src/components/Card.tsx
import { motion } from 'framer-motion';
import { Idea } from '@/models/idea';
import { useState } from 'react';
import { DetailModal } from './DetailModal';

interface CardProps {
  idea: Idea;
  isDragging?: boolean;
}

export function Card({ idea, isDragging = false }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        className={`
          bg-white p-4 mb-2 rounded-sm border border-gray-200
          cursor-pointer transition-all duration-200
          ${isDragging ? 'opacity-50 rotate-3' : ''}
        `}
        onClick={() => setIsModalOpen(true)}
      >
        <h3 className="font-mono text-sm font-medium mb-2">{idea.title}</h3>
        
        {idea.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {idea.description}
          </p>
        )}
        
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
      
      <DetailModal
        idea={idea}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
```

### 6. E2Eテスト実装

#### RED
```typescript
// e2e/kanban-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Kanban Flow', () => {
  test('should create and move idea through stages', async ({ page }) => {
    await page.goto('/');
    
    // Create new idea
    await page.click('button:has-text("Add Idea")');
    await page.fill('input[name="title"]', 'E2E Test Idea');
    await page.fill('textarea[name="description"]', 'Testing the flow');
    await page.click('button:has-text("Create")');
    
    // Verify idea in Stock
    const stockLane = page.locator('[data-testid="lane-stock"]');
    await expect(stockLane).toContainText('E2E Test Idea');
    
    // Drag to Build
    const card = page.locator('text=E2E Test Idea');
    const buildLane = page.locator('[data-testid="lane-build"]');
    await card.dragTo(buildLane);
    
    // Verify moved
    await expect(buildLane).toContainText('E2E Test Idea');
    await expect(stockLane).not.toContainText('E2E Test Idea');
  });
});
```

## Supabase統合

### データベーススキーマ
```sql
-- ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('stock', 'build', 'measure', 'learn', 'archive')),
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロジェクト詳細
CREATE TABLE project_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  business_plan TEXT,
  mvp_tasks JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIデータ
CREATE TABLE kpi_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## デプロイ設定

### Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## TDDワークフロー（チェックボックス式手順書）

### Phase 1: プロジェクト初期設定
- [ ] **TODOリスト作成**
  - [ ] 必要な機能を洗い出してTODOリストを作成
  - [ ] 優先順位を決定
  - [ ] 各TODOを15分以内で実装できる粒度に分解

- [ ] **開発環境セットアップ**
  - [ ] `npx create-next-app@latest`でプロジェクト作成
  - [ ] TypeScript、ESLint、Prettierの設定確認
  - [ ] テストランナー（Jest）の設定
  - [ ] `npm test`で失敗することを確認（RED）
  - [ ] 最小限のテスト設定を追加
  - [ ] `npm test`で成功することを確認（GREEN）

### Phase 2: データモデル実装
- [ ] **Ideaモデルのテスト作成**
  - [ ] `__tests__/models/idea.test.ts`を作成
  - [ ] 正常系のテストケースを書く
  - [ ] テストを実行して失敗を確認（RED）
  - [ ] 異常系のテストケースを書く
  - [ ] すべてのテストが失敗することを確認

- [ ] **Ideaモデルの実装**
  - [ ] `src/models/idea.ts`を作成
  - [ ] まず仮実装（ハードコードで値を返す）
  - [ ] テストが通ることを確認（GREEN）
  - [ ] 仮実装を本実装に置き換え
  - [ ] テストが通り続けることを確認
  - [ ] リファクタリング（型定義の整理など）

### Phase 3: Zustandストア実装
- [ ] **ストアのテスト作成**
  - [ ] `__tests__/stores/kanban.test.ts`を作成
  - [ ] addIdeaのテストを書く
  - [ ] テスト失敗を確認（RED）
  - [ ] moveIdeaのテストを書く
  - [ ] getIdeasByStageのテストを書く

- [ ] **ストアの段階的実装**
  - [ ] 空のストアを作成（コンパイルエラーを解消）
  - [ ] addIdeaメソッドの仮実装
  - [ ] 最初のテストが通ることを確認（GREEN）
  - [ ] addIdeaメソッドの本実装
  - [ ] moveIdeaメソッドの実装
  - [ ] 各実装後にテストを実行
  - [ ] すべてのテストが通ったらリファクタリング

### Phase 4: UIコンポーネント実装
- [ ] **KanbanBoardコンポーネントのテスト**
  - [ ] `__tests__/components/KanbanBoard.test.tsx`を作成
  - [ ] レーン表示のテストを書く
  - [ ] テスト失敗を確認（RED）
  - [ ] アイデア表示のテストを書く

- [ ] **最小限のコンポーネント実装**
  - [ ] 静的なHTMLを返すだけの実装
  - [ ] レーン表示テストが通ることを確認（GREEN）
  - [ ] ストアとの連携を追加
  - [ ] ドラッグ&ドロップ機能を追加
  - [ ] 各機能追加後にテストを実行

### Phase 5: E2Eテスト
- [ ] **Playwrightセットアップ**
  - [ ] Playwrightをインストール
  - [ ] 基本的なE2Eテストを作成
  - [ ] テストが失敗することを確認（RED）

- [ ] **E2Eテストの実装**
  - [ ] アイデア作成フローのテスト実装
  - [ ] ドラッグ&ドロップのテスト実装
  - [ ] すべてのE2Eテストが通ることを確認（GREEN）

### Phase 6: Supabase統合
- [ ] **データベーススキーマ作成**
  - [ ] Supabaseプロジェクトを作成
  - [ ] SQLスキーマを適用
  - [ ] 接続テストを作成・実行

- [ ] **API統合**
  - [ ] データ取得のテストを作成（RED）
  - [ ] Supabaseクライアントの設定
  - [ ] CRUD操作の実装
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 7: デプロイ
- [ ] **ビルドテスト**
  - [ ] `npm run build`が成功することを確認
  - [ ] ビルドサイズの確認
  - [ ] パフォーマンステストの実行

- [ ] **Vercelデプロイ**
  - [ ] Vercelプロジェクトの作成
  - [ ] 環境変数の設定
  - [ ] デプロイの実行
  - [ ] 本番環境での動作確認

### チェックポイント
各フェーズ完了時に以下を確認：
- [ ] すべてのテストが通っている
- [ ] コードカバレッジが80%以上
- [ ] ESLintエラーが0
- [ ] TypeScriptコンパイルエラーが0
- [ ] コミットメッセージが適切
- [ ] 不要なconsole.logが残っていない

## まとめ

このカンバンボード風実装は、リーンスタートアップのフローを直感的に管理できるUIを提供します。TDDアプローチにより、各機能が確実に動作することを保証しながら開発を進めます。白黒のモダンなデザインとSilka-Monoフォントにより、洗練された印象を与えます。