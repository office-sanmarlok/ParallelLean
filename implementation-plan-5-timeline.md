# 実装計画5: タイムライン形式UI版

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
リーンスタートアップの各プロジェクトの時系列での進化を、縦型タイムラインとして表現し、過去の決定と未来の計画を一望できるUI。

## 技術スタック
- **フレームワーク**: Nuxt 3
- **UIライブラリ**: Vuetify 3 (カスタムテーマ)
- **状態管理**: Pinia
- **アニメーション**: Vue Transitions + Anime.js
- **データベース**: Supabase
- **テスト**: Vitest + Vue Test Utils + Nightwatch
- **型安全性**: TypeScript + Valibot

## UI設計

### メインタイムラインビュー
```
┌─────────────────────────────────────────────────────────────┐
│ ParallelLean Timeline            [Week|Month|Year] 🔍 Filter │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2024                                                       │
│  ─────                                                      │
│                                                             │
│  March ──┬── Idea: AI Assistant                           │
│          │   "Personal productivity helper"                 │
│          │                                                  │
│          ├── Started Building MVP                          │
│          │   Tasks: 12/15 completed                        │
│          │                                                  │
│  April ──┼── Launched to Early Adopters                   │
│          │   Initial users: 50                             │
│          │                                                  │
│          ├── Pivot Decision                                │
│          │   "Focus on developer tools"                    │
│          │                                                  │
│  May ────┼── New MVP Development                          │
│          │   ▓▓▓▓▓▓▓░░░ 70%                              │
│          │                                                  │
│  June ───┼── [Projected] Market Launch                    │
│          │   Target: 500 users                             │
│          │                                                  │
│  ════════╧═══════════════════════════════════════          │
│           NOW                                               │
└─────────────────────────────────────────────────────────────┘
```

### プロジェクト比較ビュー（並列タイムライン）
```
┌─────────────────────────────────────────────────────────────┐
│ Parallel Projects Timeline                                  │
├─────────────────────────────────────────────────────────────┤
│         Project A        Project B        Project C         │
│  Jan    ○ Idea          ─                ─                │
│  Feb    │ Build         ○ Idea          ─                │
│  Mar    ● MVP           │ Research       ○ Idea           │
│  Apr    ◉ Measure       │ Build          │ Planning       │
│  May    ◉ Learn         ● MVP            │ Build          │
│  Jun    ◇ Archived      ◉ Measure        ● MVP            │
│  Jul    ─               ◉ Learn          ◉ Measure        │
│         ↓               ↓                ↓                │
│      Ended: Low       Active           Active             │
│      market fit                                           │
└─────────────────────────────────────────────────────────────┘
```

## TDD実装ワークフロー

### 1. プロジェクトセットアップ

#### RED
```typescript
// tests/setup/project.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have Nuxt 3 configured', async () => {
    const nuxtConfig = await import('../nuxt.config.ts');
    expect(nuxtConfig.default.ssr).toBeDefined();
    expect(nuxtConfig.default.nitro).toBeDefined();
  });

  it('should have Pinia store configured', async () => {
    const { useTimelineStore } = await import('../stores/timeline');
    const store = useTimelineStore();
    expect(store).toBeDefined();
    expect(store.events).toBeDefined();
  });
});
```

#### GREEN
```bash
npx nuxi@latest init parallel-lean-timeline
cd parallel-lean-timeline
npm install @pinia/nuxt pinia vuetify@next @mdi/font
npm install animejs valibot
npm install -D vitest @vue/test-utils nightwatch
```

### 2. タイムラインデータモデル実装

#### RED
```typescript
// tests/models/timeline.test.ts
import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { TimelineEventSchema, ProjectTimelineSchema } from '~/models/timeline';

describe('Timeline Models', () => {
  it('should validate timeline event', () => {
    const validEvent = {
      id: 'event-1',
      projectId: 'project-1',
      type: 'milestone',
      title: 'MVP Launched',
      description: 'Launched to 50 early adopters',
      date: new Date('2024-04-15'),
      stage: 'measure',
      metadata: {
        users: 50,
        feedback: 'positive'
      }
    };
    
    const result = v.safeParse(TimelineEventSchema, validEvent);
    expect(result.success).toBe(true);
  });

  it('should validate project timeline', () => {
    const validTimeline = {
      projectId: 'project-1',
      projectName: 'AI Assistant',
      startDate: new Date('2024-03-01'),
      currentStage: 'measure',
      events: [
        {
          id: 'e1',
          type: 'creation',
          title: 'Idea Created',
          date: new Date('2024-03-01')
        },
        {
          id: 'e2',
          type: 'stage_change',
          title: 'Started Building',
          date: new Date('2024-03-15')
        }
      ],
      projectedEvents: [
        {
          id: 'e3',
          type: 'milestone',
          title: 'Market Launch',
          date: new Date('2024-06-01')
        }
      ]
    };
    
    const result = v.safeParse(ProjectTimelineSchema, validTimeline);
    expect(result.success).toBe(true);
  });
});
```

#### GREEN
```typescript
// models/timeline.ts
import * as v from 'valibot';

export const EventTypeSchema = v.union([
  v.literal('creation'),
  v.literal('stage_change'),
  v.literal('milestone'),
  v.literal('pivot'),
  v.literal('metric_update'),
  v.literal('decision')
]);

export const StageSchema = v.union([
  v.literal('stock'),
  v.literal('build'),
  v.literal('measure'),
  v.literal('learn'),
  v.literal('archive')
]);

export const TimelineEventSchema = v.object({
  id: v.string(),
  projectId: v.string(),
  type: EventTypeSchema,
  title: v.string(),
  description: v.optional(v.string()),
  date: v.date(),
  stage: v.optional(StageSchema),
  metadata: v.optional(v.record(v.any())),
  isProjected: v.optional(v.boolean())
});

export const ProjectTimelineSchema = v.object({
  projectId: v.string(),
  projectName: v.string(),
  startDate: v.date(),
  endDate: v.optional(v.date()),
  currentStage: StageSchema,
  events: v.array(TimelineEventSchema),
  projectedEvents: v.optional(v.array(TimelineEventSchema))
});

export type TimelineEvent = v.Output<typeof TimelineEventSchema>;
export type ProjectTimeline = v.Output<typeof ProjectTimelineSchema>;
export type EventType = v.Output<typeof EventTypeSchema>;
export type Stage = v.Output<typeof StageSchema>;

// Helper functions
export function sortEventsByDate(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function groupEventsByMonth(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const grouped = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(event);
  });
  
  return grouped;
}

export function calculateProjectDuration(timeline: ProjectTimeline): number {
  const start = timeline.startDate.getTime();
  const end = timeline.endDate?.getTime() || Date.now();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)); // Days
}
```

### 3. Pinia Store実装

#### RED
```typescript
// tests/stores/timeline.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTimelineStore } from '~/stores/timeline';

describe('Timeline Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should add timeline events', () => {
    const store = useTimelineStore();
    
    store.addEvent({
      projectId: 'p1',
      type: 'creation',
      title: 'Project Started',
      date: new Date()
    });
    
    expect(store.events).toHaveLength(1);
    expect(store.events[0].id).toBeDefined();
  });

  it('should get events by project', () => {
    const store = useTimelineStore();
    
    store.addEvent({ projectId: 'p1', type: 'creation', title: 'P1 Start' });
    store.addEvent({ projectId: 'p2', type: 'creation', title: 'P2 Start' });
    store.addEvent({ projectId: 'p1', type: 'milestone', title: 'P1 MVP' });
    
    const p1Events = store.getProjectEvents('p1');
    expect(p1Events).toHaveLength(2);
  });

  it('should calculate timeline range', () => {
    const store = useTimelineStore();
    
    store.addEvent({
      projectId: 'p1',
      type: 'creation',
      title: 'Start',
      date: new Date('2024-01-01')
    });
    
    store.addEvent({
      projectId: 'p1',
      type: 'milestone',
      title: 'End',
      date: new Date('2024-06-30')
    });
    
    const range = store.timelineRange;
    expect(range.start.getFullYear()).toBe(2024);
    expect(range.start.getMonth()).toBe(0); // January
    expect(range.end.getMonth()).toBe(6); // June
  });

  it('should filter events by time range', () => {
    const store = useTimelineStore();
    
    store.addEvent({ date: new Date('2024-01-15'), title: 'Jan Event' });
    store.addEvent({ date: new Date('2024-02-15'), title: 'Feb Event' });
    store.addEvent({ date: new Date('2024-03-15'), title: 'Mar Event' });
    
    store.setViewRange('month');
    const visibleEvents = store.visibleEvents;
    
    // Should show events within current month range
    expect(visibleEvents.length).toBeLessThanOrEqual(3);
  });
});
```

#### GREEN
```typescript
// stores/timeline.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TimelineEvent, ProjectTimeline } from '~/models/timeline';
import { sortEventsByDate, groupEventsByMonth } from '~/models/timeline';

type ViewRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export const useTimelineStore = defineStore('timeline', () => {
  // State
  const events = ref<TimelineEvent[]>([]);
  const projects = ref<ProjectTimeline[]>([]);
  const viewRange = ref<ViewRange>('month');
  const currentDate = ref(new Date());
  const selectedProjectId = ref<string | null>(null);

  // Getters
  const sortedEvents = computed(() => sortEventsByDate(events.value));

  const timelineRange = computed(() => {
    if (events.value.length === 0) {
      return {
        start: new Date(),
        end: new Date()
      };
    }

    const dates = events.value.map(e => e.date.getTime());
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };
  });

  const visibleEvents = computed(() => {
    const now = currentDate.value;
    let startDate: Date;
    let endDate: Date;

    switch (viewRange.value) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return sortedEvents.value;
    }

    return sortedEvents.value.filter(
      event => event.date >= startDate && event.date <= endDate
    );
  });

  const groupedEvents = computed(() => {
    return groupEventsByMonth(visibleEvents.value);
  });

  // Actions
  function addEvent(eventData: Omit<TimelineEvent, 'id'>) {
    const event: TimelineEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    events.value.push(event);
  }

  function updateEvent(id: string, updates: Partial<TimelineEvent>) {
    const index = events.value.findIndex(e => e.id === id);
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updates };
    }
  }

  function deleteEvent(id: string) {
    events.value = events.value.filter(e => e.id !== id);
  }

  function getProjectEvents(projectId: string): TimelineEvent[] {
    return sortedEvents.value.filter(e => e.projectId === projectId);
  }

  function addProject(project: ProjectTimeline) {
    projects.value.push(project);
    
    // Add initial creation event
    addEvent({
      projectId: project.projectId,
      type: 'creation',
      title: `${project.projectName} created`,
      date: project.startDate,
      stage: 'stock'
    });
  }

  function setViewRange(range: ViewRange) {
    viewRange.value = range;
  }

  function setCurrentDate(date: Date) {
    currentDate.value = date;
  }

  function selectProject(projectId: string | null) {
    selectedProjectId.value = projectId;
  }

  return {
    // State
    events,
    projects,
    viewRange,
    currentDate,
    selectedProjectId,
    
    // Getters
    sortedEvents,
    timelineRange,
    visibleEvents,
    groupedEvents,
    
    // Actions
    addEvent,
    updateEvent,
    deleteEvent,
    getProjectEvents,
    addProject,
    setViewRange,
    setCurrentDate,
    selectProject
  };
});
```

### 4. タイムラインコンポーネント実装

#### RED
```typescript
// tests/components/TimelineView.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import TimelineView from '~/components/TimelineView.vue';
import { useTimelineStore } from '~/stores/timeline';

describe('TimelineView', () => {
  it('should render timeline with events', () => {
    const wrapper = mount(TimelineView, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    const store = useTimelineStore();
    store.addEvent({
      projectId: 'p1',
      type: 'milestone',
      title: 'MVP Launch',
      date: new Date('2024-04-15')
    });

    expect(wrapper.find('.timeline-event').exists()).toBe(true);
    expect(wrapper.text()).toContain('MVP Launch');
  });

  it('should show month headers', () => {
    const wrapper = mount(TimelineView, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    expect(wrapper.find('.month-header').exists()).toBe(true);
  });

  it('should handle view range changes', async () => {
    const wrapper = mount(TimelineView, {
      global: {
        plugins: [createTestingPinia()]
      }
    });

    await wrapper.find('select.view-range').setValue('year');
    
    const store = useTimelineStore();
    expect(store.viewRange).toBe('year');
  });
});
```

#### GREEN
```vue
<!-- components/TimelineView.vue -->
<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h2>ParallelLean Timeline</h2>
      <div class="controls">
        <v-btn-toggle v-model="viewRange" mandatory>
          <v-btn value="week">Week</v-btn>
          <v-btn value="month">Month</v-btn>
          <v-btn value="year">Year</v-btn>
        </v-btn-toggle>
        <v-text-field
          v-model="searchQuery"
          placeholder="🔍 Filter"
          density="compact"
          hide-details
          variant="outlined"
        />
      </div>
    </div>

    <div class="timeline-content">
      <div class="timeline-track">
        <div
          v-for="[month, monthEvents] in groupedEvents"
          :key="month"
          class="month-section"
        >
          <div class="month-header">
            <h3>{{ formatMonth(month) }}</h3>
            <div class="month-line"></div>
          </div>

          <TransitionGroup name="event" tag="div" class="events-container">
            <div
              v-for="event in monthEvents"
              :key="event.id"
              :class="['timeline-event', `type-${event.type}`, `stage-${event.stage}`]"
              @click="selectEvent(event)"
            >
              <div class="event-marker"></div>
              <div class="event-content">
                <h4>{{ event.title }}</h4>
                <p v-if="event.description">{{ event.description }}</p>
                <span class="event-date">{{ formatDate(event.date) }}</span>
              </div>
              <div class="event-line"></div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Current time indicator -->
        <div class="now-indicator" :style="nowIndicatorStyle">
          <div class="now-line"></div>
          <span class="now-label">NOW</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTimelineStore } from '~/stores/timeline';
import anime from 'animejs';

const store = useTimelineStore();
const searchQuery = ref('');

const viewRange = computed({
  get: () => store.viewRange,
  set: (value) => store.setViewRange(value)
});

const groupedEvents = computed(() => {
  const filtered = searchQuery.value
    ? store.visibleEvents.filter(e => 
        e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : store.visibleEvents;
  
  return Array.from(groupEventsByMonth(filtered));
});

const nowIndicatorStyle = computed(() => {
  // Calculate position based on current date
  const now = new Date();
  const range = store.timelineRange;
  const totalDays = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (now.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
  const percentage = (daysPassed / totalDays) * 100;
  
  return {
    top: `${percentage}%`
  };
});

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function selectEvent(event: TimelineEvent) {
  store.selectProject(event.projectId);
  
  // Animate selection
  anime({
    targets: `.timeline-event[data-id="${event.id}"]`,
    scale: [1, 1.05, 1],
    duration: 300,
    easing: 'easeInOutQuad'
  });
}

function groupEventsByMonth(events: TimelineEvent[]) {
  const grouped = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(event);
  });
  
  return grouped;
}
</script>

<style scoped>
.timeline-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Silka-Mono', monospace;
  background: #FAFAFA;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #000;
}

.timeline-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.timeline-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
}

.timeline-track {
  position: relative;
  padding-left: 100px;
  min-height: 100%;
}

.month-section {
  margin-bottom: 60px;
}

.month-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.month-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  min-width: 80px;
}

.month-line {
  flex: 1;
  height: 1px;
  background: #E0E0E0;
  margin-left: 20px;
}

.events-container {
  position: relative;
}

.timeline-event {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-event:hover {
  transform: translateX(5px);
}

.event-marker {
  width: 16px;
  height: 16px;
  border: 2px solid #000;
  border-radius: 50%;
  background: white;
  margin-right: 20px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.timeline-event.type-milestone .event-marker {
  background: #000;
}

.timeline-event.stage-build .event-marker {
  background: #E0E0E0;
}

.timeline-event.stage-measure .event-marker,
.timeline-event.stage-learn .event-marker {
  background: #333;
}

.event-content {
  flex: 1;
  background: white;
  border: 1px solid #000;
  padding: 16px;
  position: relative;
}

.event-content h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.event-content p {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
}

.event-date {
  font-size: 11px;
  color: #999;
}

.event-line {
  position: absolute;
  left: 7px;
  top: 20px;
  width: 1px;
  height: calc(100% + 30px);
  background: #E0E0E0;
  z-index: 1;
}

.timeline-event:last-child .event-line {
  display: none;
}

.now-indicator {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
}

.now-line {
  flex: 1;
  height: 2px;
  background: #000;
  margin-right: 10px;
}

.now-label {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  background: #000;
  color: white;
}

/* Animations */
.event-enter-active,
.event-leave-active {
  transition: all 0.3s ease;
}

.event-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.event-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

### 5. 並列プロジェクトビュー実装

#### RED
```typescript
// tests/components/ParallelTimeline.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ParallelTimeline from '~/components/ParallelTimeline.vue';

describe('ParallelTimeline', () => {
  it('should display multiple project timelines', () => {
    const wrapper = mount(ParallelTimeline, {
      props: {
        projects: [
          { projectId: 'p1', projectName: 'Project A' },
          { projectId: 'p2', projectName: 'Project B' }
        ]
      }
    });

    expect(wrapper.findAll('.project-lane')).toHaveLength(2);
    expect(wrapper.text()).toContain('Project A');
    expect(wrapper.text()).toContain('Project B');
  });

  it('should align events by date', () => {
    const wrapper = mount(ParallelTimeline);
    
    const eventPositions = wrapper.findAll('.timeline-event').map(el => 
      parseInt(el.element.style.left)
    );
    
    // Events on same date should have same horizontal position
    expect(new Set(eventPositions).size).toBeLessThan(eventPositions.length);
  });
});
```

#### GREEN
```vue
<!-- components/ParallelTimeline.vue -->
<template>
  <div class="parallel-timeline">
    <div class="timeline-header">
      <h3>Parallel Projects Timeline</h3>
    </div>
    
    <div class="timeline-grid">
      <!-- Month labels -->
      <div class="month-labels">
        <div
          v-for="month in visibleMonths"
          :key="month"
          class="month-label"
        >
          {{ formatMonthShort(month) }}
        </div>
      </div>
      
      <!-- Project lanes -->
      <div class="project-lanes">
        <div
          v-for="project in projects"
          :key="project.projectId"
          class="project-lane"
        >
          <div class="project-name">{{ project.projectName }}</div>
          <div class="lane-track">
            <div
              v-for="event in getProjectEvents(project.projectId)"
              :key="event.id"
              :style="getEventStyle(event)"
              :class="['lane-event', `stage-${event.stage}`]"
              @click="$emit('selectEvent', event)"
            >
              <div class="event-icon">{{ getEventIcon(event) }}</div>
              <div class="event-tooltip">
                {{ event.title }}
                <br>
                {{ formatDate(event.date) }}
              </div>
            </div>
            
            <!-- Connections between events -->
            <svg class="connections">
              <path
                v-for="(connection, index) in getProjectConnections(project.projectId)"
                :key="index"
                :d="connection"
                stroke="#666"
                stroke-width="1"
                fill="none"
                stroke-dasharray="2,2"
              />
            </svg>
          </div>
          
          <div class="project-status">
            {{ getProjectStatus(project) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimelineStore } from '~/stores/timeline';
import type { ProjectTimeline, TimelineEvent } from '~/models/timeline';

const props = defineProps<{
  projects: ProjectTimeline[];
}>();

const emit = defineEmits<{
  selectEvent: [event: TimelineEvent];
}>();

const store = useTimelineStore();

const visibleMonths = computed(() => {
  const months: string[] = [];
  const start = new Date(store.timelineRange.start);
  const end = new Date(store.timelineRange.end);
  
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
});

function getProjectEvents(projectId: string): TimelineEvent[] {
  return store.getProjectEvents(projectId);
}

function getEventStyle(event: TimelineEvent) {
  const totalMonths = visibleMonths.value.length;
  const eventMonth = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;
  const monthIndex = visibleMonths.value.indexOf(eventMonth);
  
  if (monthIndex === -1) return { display: 'none' };
  
  const position = (monthIndex / totalMonths) * 100;
  const dayInMonth = event.date.getDate();
  const daysInMonth = new Date(event.date.getFullYear(), event.date.getMonth() + 1, 0).getDate();
  const dayOffset = (dayInMonth / daysInMonth) * (100 / totalMonths);
  
  return {
    left: `${position + dayOffset}%`
  };
}

function getEventIcon(event: TimelineEvent): string {
  const icons = {
    stock: '○',
    build: '●',
    measure: '◉',
    learn: '◉',
    archive: '◇'
  };
  return icons[event.stage || 'stock'];
}

function getProjectConnections(projectId: string): string[] {
  const events = getProjectEvents(projectId);
  const paths: string[] = [];
  
  for (let i = 0; i < events.length - 1; i++) {
    const from = events[i];
    const to = events[i + 1];
    
    const fromStyle = getEventStyle(from);
    const toStyle = getEventStyle(to);
    
    if (fromStyle.left && toStyle.left) {
      const x1 = parseFloat(fromStyle.left);
      const x2 = parseFloat(toStyle.left);
      paths.push(`M ${x1} 20 L ${x2} 20`);
    }
  }
  
  return paths;
}

function getProjectStatus(project: ProjectTimeline): string {
  if (project.endDate) {
    return `Ended: ${project.currentStage}`;
  }
  return 'Active';
}

function formatMonthShort(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.parallel-timeline {
  background: white;
  border: 1px solid #000;
  padding: 20px;
  font-family: 'Silka-Mono', monospace;
}

.timeline-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.timeline-grid {
  display: flex;
  flex-direction: column;
}

.month-labels {
  display: flex;
  padding-left: 120px;
  margin-bottom: 10px;
  border-bottom: 1px solid #E0E0E0;
}

.month-label {
  flex: 1;
  font-size: 12px;
  padding: 5px;
  text-align: center;
}

.project-lanes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-lane {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.project-name {
  width: 100px;
  font-size: 12px;
  font-weight: 600;
  padding-right: 20px;
}

.lane-track {
  flex: 1;
  position: relative;
  height: 40px;
  background: #FAFAFA;
  border: 1px solid #E0E0E0;
}

.lane-event {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lane-event:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.event-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  color: white;
  padding: 8px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.lane-event:hover .event-tooltip {
  opacity: 1;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.project-status {
  width: 100px;
  padding-left: 20px;
  font-size: 11px;
  color: #666;
}
</style>
```

### 6. E2Eテスト実装

```typescript
// tests/e2e/timeline.spec.ts
import { test, expect } from 'nightwatch';

test('Timeline Navigation', () => {
  browser
    .navigateTo('/')
    .waitForElementVisible('.timeline-container')
    
    // Test view range switching
    .click('button[value="year"]')
    .assert.visible('.month-header')
    .assert.elementCount('.month-section', { min: 12 })
    
    // Test event creation
    .click('.add-event-btn')
    .setValue('input[name="title"]', 'New Milestone')
    .setValue('input[name="date"]', '2024-06-15')
    .click('button[type="submit"]')
    
    .waitForElementVisible('.timeline-event:last-child')
    .assert.containsText('.timeline-event:last-child', 'New Milestone')
    
    // Test filtering
    .setValue('.search-input', 'MVP')
    .assert.elementCount('.timeline-event', { max: 5 })
    
    // Test parallel view
    .click('.view-parallel-btn')
    .waitForElementVisible('.parallel-timeline')
    .assert.elementCount('.project-lane', { min: 2 })
    
    .end();
});

test('Timeline Interactions', () => {
  browser
    .navigateTo('/')
    
    // Test event selection
    .click('.timeline-event:first-child')
    .waitForElementVisible('.event-details-panel')
    .assert.containsText('.event-details-panel', 'Details')
    
    // Test drag to reorder (if implemented)
    .dragAndDrop('.timeline-event:first-child', '.timeline-event:last-child')
    .pause(500)
    
    // Test export functionality
    .click('.export-btn')
    .waitForElementVisible('.export-dialog')
    .click('button[value="pdf"]')
    .assert.containsText('.notification', 'Export completed')
    
    .end();
});
```

## Nuxt設定

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'vuetify-nuxt-module'
  ],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/css/main.css'
  ],
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#333333',
            error: '#000000',
            info: '#E0E0E0',
            success: '#000000',
            warning: '#666666'
          }
        }
      }
    }
  },
  typescript: {
    strict: true
  }
});
```

## デプロイ設定

### Vercel設定
```json
{
  "buildCommand": "nuxt build",
  "outputDirectory": ".output/public",
  "devCommand": "nuxt dev",
  "installCommand": "npm install",
  "framework": "nuxtjs"
}
```

## TDDワークフロー（チェックボックス式手順書）

### Phase 1: Nuxt 3環境構築
- [ ] **TODOリスト作成**
  - [ ] タイムライン機能の要件を整理
  - [ ] 時系列表示のパターンを定義
  - [ ] タスクを15分単位に分解

- [ ] **プロジェクト初期化**
  - [ ] `npx nuxi@latest init`でNuxt 3プロジェクト作成
  - [ ] TypeScript設定の確認
  - [ ] Vitestの設定
  - [ ] 最初のテスト（Nuxt設定）を作成
  - [ ] テスト失敗を確認（RED）
  - [ ] 設定を追加してテストを通す（GREEN）

### Phase 2: タイムラインデータモデル
- [ ] **Valibotでのモデル定義テスト**
  - [ ] `tests/models/timeline.test.ts`を作成
  - [ ] TimelineEventSchemaのテストを書く
  - [ ] ProjectTimelineSchemaのテストを書く
  - [ ] ヘルパー関数のテストを書く
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **モデルの実装**
  - [ ] イベントタイプの定義（仮実装）
  - [ ] タイムラインイベントの型を実装
  - [ ] プロジェクトタイムラインの型を追加
  - [ ] 日付ソート関数を実装
  - [ ] 月別グルーピング関数を追加
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 3: Piniaストア実装
- [ ] **タイムラインストアのテスト**
  - [ ] `tests/stores/timeline.test.ts`を作成
  - [ ] イベント追加のテストを書く
  - [ ] プロジェクト別イベント取得のテストを書く
  - [ ] タイムライン範囲計算のテストを書く
  - [ ] ビューレンジフィルタのテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **ストアの段階的実装**
  - [ ] 基本的なPiniaストアを定義
  - [ ] addEventアクションの仮実装
  - [ ] 最初のテストが通ることを確認
  - [ ] computed値（sortedEvents）を実装
  - [ ] フィルタリングロジックを追加
  - [ ] プロジェクト管理機能を実装
  - [ ] リファクタリング

### Phase 4: タイムラインビューコンポーネント
- [ ] **TimelineViewのテスト**
  - [ ] `tests/components/TimelineView.test.ts`を作成
  - [ ] イベント表示のテストを書く
  - [ ] 月ヘッダー表示のテストを書く
  - [ ] ビューレンジ切り替えのテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **Vue 3コンポーネント実装**
  - [ ] 基本的なテンプレート構造を作成
  - [ ] 月セクションの表示ロジック
  - [ ] イベントカードの実装
  - [ ] Piniaストアとの連携
  - [ ] トランジションアニメーション追加
  - [ ] 各ステップでテストを実行

### Phase 5: 並列プロジェクトビュー
- [ ] **ParallelTimelineのテスト**
  - [ ] 複数プロジェクト表示のテスト
  - [ ] イベント位置計算のテスト
  - [ ] 接続線描画のテスト

- [ ] **実装**
  - [ ] レーン型レイアウトの作成
  - [ ] 日付に基づく位置計算
  - [ ] SVGでの接続線描画
  - [ ] ホバーインタラクション
  - [ ] レスポンシブ対応

### Phase 6: Vuetify 3統合
- [ ] **UIコンポーネントのテスト**
  - [ ] Vuetifyコンポーネントの統合テスト
  - [ ] カスタムテーマ適用のテスト
  - [ ] ダークモード対応のテスト（白黒テーマ）

- [ ] **実装**
  - [ ] Vuetifyのインストールと設定
  - [ ] カスタムテーマ（白黒）の定義
  - [ ] コンポーネントのスタイリング
  - [ ] マテリアルデザインアイコンの統合

### Phase 7: アニメーション実装
- [ ] **Anime.js統合テスト**
  - [ ] エントランスアニメーションのテスト
  - [ ] インタラクションアニメーションのテスト
  - [ ] パフォーマンステスト

- [ ] **実装**
  - [ ] Vue Transitionsの基本設定
  - [ ] Anime.jsでの複雑なアニメーション
  - [ ] スクロール連動アニメーション
  - [ ] パフォーマンス最適化

### Phase 8: 高度な機能
- [ ] **追加機能のテスト**
  - [ ] 検索/フィルタリングのテスト
  - [ ] エクスポート機能のテスト
  - [ ] ドラッグによる日付変更のテスト

- [ ] **実装**
  - [ ] 検索機能の実装
  - [ ] 高度なフィルタリング
  - [ ] PDF/画像エクスポート
  - [ ] インタラクティブな日付編集
  - [ ] キーボードナビゲーション

### Phase 9: Nuxt 3特有の機能
- [ ] **SSR/ハイドレーション**
  - [ ] サーバーサイドレンダリングのテスト
  - [ ] ハイドレーションエラーのテスト
  - [ ] メタデータ生成のテスト

- [ ] **実装**
  - [ ] useAsyncDataでのデータフェッチ
  - [ ] SEO最適化（useHead）
  - [ ] エラーハンドリング
  - [ ] ローディング状態の管理

### Phase 10: E2Eテスト
- [ ] **Nightwatchセットアップ**
  - [ ] Nightwatchのインストールと設定
  - [ ] 基本的なナビゲーションテスト作成
  - [ ] テスト失敗を確認（RED）

- [ ] **統合テストの実装**
  - [ ] タイムライン表示フロー
  - [ ] イベント作成/編集フロー
  - [ ] ビュー切り替えフロー
  - [ ] 並列表示の動作確認
  - [ ] すべてのE2Eテストが通ることを確認（GREEN）

### Phase 11: データ永続化
- [ ] **Supabase統合テスト**
  - [ ] イベント保存のテスト
  - [ ] リアルタイム更新のテスト
  - [ ] オフライン対応のテスト

- [ ] **実装**
  - [ ] Supabaseクライアント設定
  - [ ] CRUD操作の実装
  - [ ] リアルタイムサブスクリプション
  - [ ] 楽観的更新の実装
  - [ ] エラーリカバリー

### チェックポイント
各フェーズ完了時に確認：
- [ ] すべてのテストが通っている
- [ ] Vue DevToolsでの状態確認
- [ ] パフォーマンス指標（Lighthouse）
- [ ] TypeScriptエラーが0
- [ ] アクセシビリティチェック
- [ ] SSRとクライアントの一貫性

## まとめ

このタイムライン形式UI実装は、リーンスタートアップの各プロジェクトの時系列での進化を直感的に追跡できます。縦型タイムラインと並列表示により、複数プロジェクトの進捗を一目で把握でき、過去の決定と将来の計画を統合的に管理できます。Nuxt 3とVuetifyを活用し、洗練された白黒デザインでモダンな体験を提供します。