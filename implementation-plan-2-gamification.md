# 実装計画2: ゲーミフィケーション重視UI版

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

# ゲーミフィケーション重視UI実装計画

## 概要
リーンスタートアップのプロセスをRPGゲームのように表現し、レベルアップ、実績解除、スキルツリーなどの要素で、ユーザーのモチベーションを高めるUI。

## 技術スタック
- **フレームワーク**: Remix
- **UIライブラリ**: Chakra UI + Emotion
- **状態管理**: Redux Toolkit
- **アニメーション**: Lottie React + GSAP
- **データベース**: Supabase
- **テスト**: Vitest + Testing Library + Cypress
- **型安全性**: TypeScript + io-ts

## UI設計

### メインダッシュボード
```
┌─────────────────────────────────────────────────────────────┐
│ ParallelLean                    Lv.12 ━━━━━━━▓▓▓░░░ EXP: 850│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐     ┌──────────────────────────┐              │
│  │ AVATAR  │     │ Current Quest:           │   🏆 x12     │
│  │  ⚡️⚡️   │     │ Launch MVP for Idea #3   │   ⭐️ x245    │
│  │  ╰─╯    │     │ ▓▓▓▓▓▓▓▓░░░░ 75%        │   💎 x5      │
│  └─────────┘     └──────────────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│                      【 SKILL TREE 】                        │
│                                                             │
│        [Ideation]          [Building]         [Analytics]   │
│            ●                   ●                   ○        │
│           /│\                 /│\                 /│\       │
│          ● ● ●               ● ● ○               ○ ○ ○      │
│         /│\│/│\             /│\│/│\             /│\│/│\     │
│        ● ○ ● ○ ●           ● ● ○ ○ ○           ○ ○ ○ ○ ○    │
├─────────────────────────────────────────────────────────────┤
│  Active Projects:                         Daily Challenges: │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    □ Add 3 ideas     │
│  │Project 1│ │Project 2│ │Project 3│    ☑ Update KPI      │
│  │ ⚔️ Lv.5 │ │ 🛡️ Lv.3 │ │ 🏹 Lv.7 │    □ Complete task  │
│  └─────────┘ └─────────┘ └─────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### プロジェクト詳細ビュー（ゲームカード風）
```
┌─────────────────────────────────────────┐
│         PROJECT: AI Assistant           │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │        ⚡️ LEGENDARY ⚡️            │  │
│  │         ╱▔▔▔▔▔▔▔▔╲               │  │
│  │        │  🤖 MVP  │               │  │
│  │         ╲________╱                │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Stats:          Skills Unlocked:      │
│  ATK: ████░ 80   ✓ User Research      │
│  DEF: ███░░ 60   ✓ Rapid Prototyping  │
│  SPD: █████ 100  ○ Market Analysis    │
│                                         │
│  Stage: MEASURE  Progress: ████████░░  │
└─────────────────────────────────────────┘
```

## TDD実装ワークフロー

### 1. プロジェクトセットアップ

#### RED
```typescript
// tests/setup/project.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have Remix configured', () => {
    const remixConfig = require('../remix.config.js');
    expect(remixConfig).toBeDefined();
    expect(remixConfig.appDirectory).toBe('app');
  });

  it('should have Redux store configured', () => {
    const { store } = require('../app/store');
    expect(store.getState()).toBeDefined();
  });
});
```

#### GREEN
```bash
npx create-remix@latest parallel-lean-gamification --template remix-run/remix/templates/remix-ts
cd parallel-lean-gamification
npm install @reduxjs/toolkit react-redux @chakra-ui/react @emotion/react @emotion/styled
npm install lottie-react gsap io-ts
npm install -D vitest @testing-library/react cypress
```

### 2. ゲーミフィケーションモデル実装

#### RED
```typescript
// tests/models/player.test.ts
import { describe, it, expect } from 'vitest';
import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { PlayerCodec } from '~/models/player';

describe('Player Model', () => {
  it('should validate player data', () => {
    const validPlayer = {
      id: '123',
      username: 'entrepreneur',
      level: 12,
      experience: 850,
      nextLevelExp: 1000,
      achievements: ['first_idea', 'mvp_launched'],
      skills: {
        ideation: 5,
        building: 3,
        analytics: 1
      }
    };
    
    const result = PlayerCodec.decode(validPlayer);
    expect(isRight(result)).toBe(true);
  });

  it('should calculate level progress', () => {
    const player = {
      level: 12,
      experience: 850,
      nextLevelExp: 1000
    };
    
    const progress = (player.experience / player.nextLevelExp) * 100;
    expect(progress).toBe(85);
  });
});
```

#### GREEN
```typescript
// app/models/player.ts
import * as t from 'io-ts';

export const SkillTreeCodec = t.type({
  ideation: t.number,
  building: t.number,
  analytics: t.number
});

export const PlayerCodec = t.type({
  id: t.string,
  username: t.string,
  level: t.number,
  experience: t.number,
  nextLevelExp: t.number,
  achievements: t.array(t.string),
  skills: SkillTreeCodec,
  trophies: t.number,
  stars: t.number,
  gems: t.number
});

export type Player = t.TypeOf<typeof PlayerCodec>;
export type SkillTree = t.TypeOf<typeof SkillTreeCodec>;

export const calculateLevelProgress = (player: Player): number => {
  return Math.round((player.experience / player.nextLevelExp) * 100);
};

export const getNextLevelExp = (level: number): number => {
  return level * 100 + Math.pow(level, 2) * 10;
};
```

### 3. Redux Store実装（ゲーム状態管理）

#### RED
```typescript
// tests/store/gameSlice.test.ts
import { describe, it, expect } from 'vitest';
import { store } from '~/store';
import { 
  gainExperience, 
  unlockAchievement, 
  upgradeSkill 
} from '~/store/gameSlice';

describe('Game Slice', () => {
  it('should gain experience and level up', () => {
    const initialState = store.getState().game;
    expect(initialState.player.level).toBe(1);
    
    store.dispatch(gainExperience(150));
    
    const newState = store.getState().game;
    expect(newState.player.experience).toBe(150);
    expect(newState.player.level).toBe(2);
  });

  it('should unlock achievements', () => {
    store.dispatch(unlockAchievement('first_mvp'));
    
    const state = store.getState().game;
    expect(state.player.achievements).toContain('first_mvp');
    expect(state.notifications).toHaveLength(1);
  });

  it('should upgrade skills with skill points', () => {
    store.dispatch(upgradeSkill({ skill: 'ideation', cost: 1 }));
    
    const state = store.getState().game;
    expect(state.player.skills.ideation).toBe(1);
  });
});
```

#### GREEN
```typescript
// app/store/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player, getNextLevelExp } from '~/models/player';

interface GameNotification {
  id: string;
  type: 'achievement' | 'levelup' | 'reward';
  title: string;
  description: string;
  timestamp: number;
}

interface GameState {
  player: Player;
  notifications: GameNotification[];
  dailyChallenges: DailyChallenge[];
}

const initialState: GameState = {
  player: {
    id: '1',
    username: 'player',
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    achievements: [],
    skills: { ideation: 0, building: 0, analytics: 0 },
    trophies: 0,
    stars: 0,
    gems: 0
  },
  notifications: [],
  dailyChallenges: []
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gainExperience: (state, action: PayloadAction<number>) => {
      state.player.experience += action.payload;
      
      // Check for level up
      while (state.player.experience >= state.player.nextLevelExp) {
        state.player.experience -= state.player.nextLevelExp;
        state.player.level += 1;
        state.player.nextLevelExp = getNextLevelExp(state.player.level);
        
        // Add level up notification
        state.notifications.push({
          id: crypto.randomUUID(),
          type: 'levelup',
          title: `Level ${state.player.level} Reached!`,
          description: `You've unlocked new abilities!`,
          timestamp: Date.now()
        });
      }
    },
    
    unlockAchievement: (state, action: PayloadAction<string>) => {
      if (!state.player.achievements.includes(action.payload)) {
        state.player.achievements.push(action.payload);
        state.player.trophies += 1;
        
        state.notifications.push({
          id: crypto.randomUUID(),
          type: 'achievement',
          title: 'Achievement Unlocked!',
          description: getAchievementName(action.payload),
          timestamp: Date.now()
        });
      }
    },
    
    upgradeSkill: (state, action: PayloadAction<{ skill: keyof Player['skills'], cost: number }>) => {
      const { skill, cost } = action.payload;
      if (state.player.gems >= cost) {
        state.player.gems -= cost;
        state.player.skills[skill] += 1;
      }
    }
  }
});

export const { gainExperience, unlockAchievement, upgradeSkill } = gameSlice.actions;
export default gameSlice.reducer;
```

### 4. ゲーミフィケーションUI実装

#### RED
```typescript
// tests/components/PlayerHUD.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerHUD } from '~/components/PlayerHUD';
import { Provider } from 'react-redux';
import { store } from '~/store';

describe('PlayerHUD', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('should display player level and experience', () => {
    renderWithProvider(<PlayerHUD />);
    
    expect(screen.getByText(/Lv\./)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show player resources', () => {
    renderWithProvider(<PlayerHUD />);
    
    expect(screen.getByText(/🏆/)).toBeInTheDocument();
    expect(screen.getByText(/⭐️/)).toBeInTheDocument();
    expect(screen.getByText(/💎/)).toBeInTheDocument();
  });
});
```

#### GREEN
```typescript
// app/components/PlayerHUD.tsx
import { Box, Flex, Text, Progress, HStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '~/store';

export function PlayerHUD() {
  const player = useSelector((state: RootState) => state.game.player);
  const expProgress = (player.experience / player.nextLevelExp) * 100;

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={6}>
          <Text fontFamily="Silka-Mono" fontSize="lg" fontWeight="bold">
            ParallelLean
          </Text>
        </HStack>

        <HStack spacing={8}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HStack>
              <Text fontFamily="Silka-Mono" fontSize="sm">
                Lv.{player.level}
              </Text>
              <Box w="150px">
                <Progress
                  value={expProgress}
                  size="sm"
                  bg="gray.200"
                  sx={{
                    '& > div': {
                      background: 'black'
                    }
                  }}
                />
              </Box>
              <Text fontFamily="Silka-Mono" fontSize="xs" color="gray.600">
                EXP: {player.experience}
              </Text>
            </HStack>
          </motion.div>

          <HStack spacing={4} fontFamily="Silka-Mono" fontSize="sm">
            <Text>🏆 x{player.trophies}</Text>
            <Text>⭐️ x{player.stars}</Text>
            <Text>💎 x{player.gems}</Text>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}
```

### 5. スキルツリーコンポーネント実装

#### RED
```typescript
// tests/components/SkillTree.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillTree } from '~/components/SkillTree';

describe('SkillTree', () => {
  it('should render skill nodes', () => {
    render(<SkillTree />);
    
    expect(screen.getByText('Ideation')).toBeInTheDocument();
    expect(screen.getByText('Building')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should show locked and unlocked states', () => {
    render(<SkillTree />);
    
    const nodes = screen.getAllByRole('button');
    expect(nodes[0]).toHaveAttribute('data-unlocked', 'true');
    expect(nodes[1]).toHaveAttribute('data-unlocked', 'false');
  });

  it('should handle skill upgrade', () => {
    const onUpgrade = vi.fn();
    render(<SkillTree onUpgrade={onUpgrade} />);
    
    const upgradeButton = screen.getByText('Upgrade');
    fireEvent.click(upgradeButton);
    
    expect(onUpgrade).toHaveBeenCalled();
  });
});
```

#### GREEN
```typescript
// app/components/SkillTree.tsx
import { Box, Grid, Text, Button, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '~/store';
import { upgradeSkill } from '~/store/gameSlice';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: 5;
  cost: number;
  unlocked: boolean;
  dependencies: string[];
}

export function SkillTree() {
  const dispatch = useDispatch();
  const skills = useSelector((state: RootState) => state.game.player.skills);
  const gems = useSelector((state: RootState) => state.game.player.gems);
  
  const skillTrees = {
    ideation: [
      { id: 'idea-1', name: 'Brainstorming', level: 0, cost: 1, unlocked: true },
      { id: 'idea-2', name: 'Market Research', level: 0, cost: 2, unlocked: false },
      { id: 'idea-3', name: 'Validation', level: 0, cost: 3, unlocked: false }
    ],
    building: [
      { id: 'build-1', name: 'MVP Design', level: 0, cost: 1, unlocked: true },
      { id: 'build-2', name: 'Rapid Prototyping', level: 0, cost: 2, unlocked: false },
      { id: 'build-3', name: 'Iteration', level: 0, cost: 3, unlocked: false }
    ],
    analytics: [
      { id: 'analytics-1', name: 'KPI Tracking', level: 0, cost: 1, unlocked: true },
      { id: 'analytics-2', name: 'User Analytics', level: 0, cost: 2, unlocked: false },
      { id: 'analytics-3', name: 'Growth Hacking', level: 0, cost: 3, unlocked: false }
    ]
  };

  const handleUpgrade = (skillType: string, node: SkillNode) => {
    if (gems >= node.cost && node.unlocked) {
      dispatch(upgradeSkill({ skill: skillType as any, cost: node.cost }));
    }
  };

  return (
    <Box p={8} bg="gray.50" borderRadius="sm">
      <Text 
        textAlign="center" 
        fontSize="2xl" 
        fontFamily="Silka-Mono" 
        mb={8}
      >
        【 SKILL TREE 】
      </Text>
      
      <Grid templateColumns="repeat(3, 1fr)" gap={8}>
        {Object.entries(skillTrees).map(([skillType, nodes]) => (
          <VStack key={skillType} spacing={4}>
            <Text fontFamily="Silka-Mono" fontWeight="bold">
              {skillType.charAt(0).toUpperCase() + skillType.slice(1)}
            </Text>
            
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  size="lg"
                  variant={node.unlocked ? "solid" : "outline"}
                  colorScheme="blackAlpha"
                  data-unlocked={node.unlocked}
                  onClick={() => handleUpgrade(skillType, node)}
                  disabled={!node.unlocked || gems < node.cost}
                  fontFamily="Silka-Mono"
                >
                  {node.unlocked ? '●' : '○'}
                </Button>
                <Text fontSize="xs" mt={1} textAlign="center">
                  {node.name}
                </Text>
              </motion.div>
            ))}
          </VStack>
        ))}
      </Grid>
    </Box>
  );
}
```

### 6. アチーブメントシステム実装

#### RED
```typescript
// tests/services/achievements.test.ts
import { describe, it, expect } from 'vitest';
import { checkAchievements, ACHIEVEMENTS } from '~/services/achievements';

describe('Achievement System', () => {
  it('should unlock first idea achievement', () => {
    const state = {
      ideas: [{ id: '1', title: 'First Idea' }]
    };
    
    const unlocked = checkAchievements(state, []);
    expect(unlocked).toContain('first_idea');
  });

  it('should unlock MVP launched achievement', () => {
    const state = {
      ideas: [{ id: '1', stage: 'measure' }]
    };
    
    const unlocked = checkAchievements(state, []);
    expect(unlocked).toContain('mvp_launched');
  });

  it('should not unlock already unlocked achievements', () => {
    const state = { ideas: [{ id: '1' }] };
    const alreadyUnlocked = ['first_idea'];
    
    const unlocked = checkAchievements(state, alreadyUnlocked);
    expect(unlocked).toHaveLength(0);
  });
});
```

#### GREEN
```typescript
// app/services/achievements.ts
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: any) => boolean;
  rewards: {
    exp: number;
    stars: number;
    gems: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_idea',
    name: 'First Steps',
    description: 'Create your first idea',
    icon: '💡',
    condition: (state) => state.ideas.length >= 1,
    rewards: { exp: 50, stars: 5, gems: 1 }
  },
  {
    id: 'mvp_launched',
    name: 'MVP Master',
    description: 'Launch your first MVP',
    icon: '🚀',
    condition: (state) => state.ideas.some((i: any) => i.stage === 'measure'),
    rewards: { exp: 100, stars: 10, gems: 2 }
  },
  {
    id: 'pivot_master',
    name: 'Pivot Master',
    description: 'Successfully pivot a project',
    icon: '🔄',
    condition: (state) => state.ideas.some((i: any) => i.pivotCount > 0),
    rewards: { exp: 150, stars: 15, gems: 3 }
  },
  {
    id: 'idea_machine',
    name: 'Idea Machine',
    description: 'Have 10 ideas in your backlog',
    icon: '🏭',
    condition: (state) => state.ideas.filter((i: any) => i.stage === 'stock').length >= 10,
    rewards: { exp: 200, stars: 20, gems: 5 }
  }
];

export function checkAchievements(state: any, unlockedIds: string[]): string[] {
  const newlyUnlocked: string[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition(state)) {
      newlyUnlocked.push(achievement.id);
    }
  }
  
  return newlyUnlocked;
}
```

### 7. E2Eテスト実装

```typescript
// cypress/e2e/gamification-flow.cy.ts
describe('Gamification Flow', () => {
  it('should gain experience from creating ideas', () => {
    cy.visit('/');
    
    // Check initial level
    cy.contains('Lv.1').should('be.visible');
    
    // Create an idea
    cy.get('[data-testid="add-idea-button"]').click();
    cy.get('input[name="title"]').type('My First Startup Idea');
    cy.get('button[type="submit"]').click();
    
    // Check experience gain animation
    cy.contains('+50 EXP').should('be.visible');
    
    // Check achievement unlock
    cy.contains('Achievement Unlocked!').should('be.visible');
    cy.contains('First Steps').should('be.visible');
  });

  it('should unlock skills with gems', () => {
    cy.visit('/skill-tree');
    
    // Check initial gem count
    cy.contains('💎 x5').should('be.visible');
    
    // Upgrade a skill
    cy.get('[data-testid="skill-ideation-1"]').click();
    cy.get('button').contains('Upgrade').click();
    
    // Check gem decrease and skill unlock
    cy.contains('💎 x4').should('be.visible');
    cy.get('[data-testid="skill-ideation-1"]').should('have.attr', 'data-level', '1');
  });
});
```

## デプロイ設定

### Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "remix"
}
```

## TDDワークフロー（チェックボックス式手順書）

### Phase 1: Remix環境構築
- [ ] **TODOリスト作成**
  - [ ] ゲーミフィケーション要素をリストアップ
  - [ ] MVPに含める機能を選定
  - [ ] 各機能を小さなタスクに分解（15分単位）

- [ ] **Remixプロジェクト初期化**
  - [ ] `npx create-remix@latest`でプロジェクト作成
  - [ ] TypeScript設定の確認
  - [ ] Vitestの設定を追加
  - [ ] 最初のテスト（プロジェクト設定）を作成
  - [ ] テストが失敗することを確認（RED）
  - [ ] 設定ファイルを追加してテストを通す（GREEN）

### Phase 2: プレイヤーモデル実装
- [ ] **io-tsでのモデル定義テスト**
  - [ ] `tests/models/player.test.ts`を作成
  - [ ] PlayerCodecの検証テストを書く
  - [ ] レベル計算のテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **モデルの段階的実装**
  - [ ] 最小限のPlayerCodecを定義（仮実装）
  - [ ] 基本的なバリデーションが通ることを確認
  - [ ] スキルツリーの型を追加
  - [ ] レベル計算関数を実装
  - [ ] 経験値計算ロジックを追加
  - [ ] すべてのテストが通ることを確認（GREEN）

### Phase 3: Redux Toolkitストア実装
- [ ] **ゲームスライスのテスト作成**
  - [ ] `tests/store/gameSlice.test.ts`を作成
  - [ ] 経験値獲得のテストを書く
  - [ ] レベルアップのテストを書く
  - [ ] アチーブメント解除のテストを書く
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **スライスの実装**
  - [ ] 初期stateの定義
  - [ ] gainExperienceアクションの仮実装
  - [ ] 経験値獲得テストが通ることを確認
  - [ ] レベルアップロジックを追加
  - [ ] 通知システムを実装
  - [ ] アチーブメント機能を追加
  - [ ] リファクタリング（重複コードの削除）

### Phase 4: ゲームUIコンポーネント
- [ ] **PlayerHUDのテスト**
  - [ ] `tests/components/PlayerHUD.test.tsx`を作成
  - [ ] レベル表示のテストを書く
  - [ ] 経験値バー表示のテストを書く
  - [ ] リソース表示のテストを書く
  - [ ] テスト失敗を確認（RED）

- [ ] **コンポーネントの実装**
  - [ ] 静的なモックアップを作成
  - [ ] Chakra UIでスタイリング
  - [ ] ストアとの接続を追加
  - [ ] アニメーション（Framer Motion）を追加
  - [ ] 各ステップでテストを実行

### Phase 5: スキルツリー実装
- [ ] **スキルツリーのテスト**
  - [ ] スキルノード表示のテスト
  - [ ] アップグレード機能のテスト
  - [ ] ジェム消費のテスト
  - [ ] すべてのテストが失敗することを確認（RED）

- [ ] **段階的な機能追加**
  - [ ] 基本的なツリーレイアウト
  - [ ] ノードの状態管理
  - [ ] クリックイベントの処理
  - [ ] ジェム消費ロジック
  - [ ] ビジュアルフィードバック
  - [ ] 各機能追加後にテスト実行

### Phase 6: アチーブメントシステム
- [ ] **アチーブメントサービスのテスト**
  - [ ] `tests/services/achievements.test.ts`を作成
  - [ ] 条件チェックのテスト
  - [ ] 報酬付与のテスト
  - [ ] 重複解除防止のテスト

- [ ] **サービス実装**
  - [ ] アチーブメント定義の作成
  - [ ] 条件評価関数の実装
  - [ ] 報酬システムの実装
  - [ ] 通知連携の追加
  - [ ] パフォーマンス最適化

### Phase 7: アニメーション統合
- [ ] **Lottieアニメーション**
  - [ ] アニメーションファイルの準備
  - [ ] レベルアップエフェクトの実装
  - [ ] アチーブメント獲得エフェクト

- [ ] **GSAPトランジション**
  - [ ] ページ遷移アニメーション
  - [ ] 要素の出現アニメーション
  - [ ] インタラクションフィードバック

### Phase 8: E2Eテスト
- [ ] **Cypressセットアップ**
  - [ ] Cypressのインストールと設定
  - [ ] 基本的なナビゲーションテスト
  - [ ] ゲームフローのE2Eテスト作成

- [ ] **統合テストの実装**
  - [ ] アイデア作成→経験値獲得フロー
  - [ ] スキルアップグレードフロー
  - [ ] アチーブメント獲得フロー
  - [ ] すべてのE2Eテストが通ることを確認

### Phase 9: Remix特有の機能
- [ ] **ローダー/アクション実装**
  - [ ] データローディングのテスト
  - [ ] フォーム送信のテスト
  - [ ] エラーハンドリングのテスト

- [ ] **最適化**
  - [ ] プリフェッチの設定
  - [ ] キャッシュ戦略の実装
  - [ ] バンドルサイズの最適化

### チェックポイント
各フェーズ完了時に確認：
- [ ] すべてのユニットテストが通っている
- [ ] E2Eテストが通っている
- [ ] TypeScriptエラーが0
- [ ] アクセシビリティチェック合格
- [ ] パフォーマンス指標が基準値以内
- [ ] ゲームバランスの確認（レベルアップ速度など）

## まとめ

このゲーミフィケーション重視実装は、リーンスタートアップのプロセスを楽しく継続できるようにゲーム要素を取り入れています。レベルアップ、スキルツリー、アチーブメントなどのシステムにより、ユーザーの継続的なエンゲージメントを促進します。白黒のモダンデザインを維持しながら、アニメーションとインタラクションでゲーム的な体験を提供します。