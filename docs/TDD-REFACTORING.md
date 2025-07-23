# GraphCanvas.tsx TDDリファクタリング手順

## 背景

GraphCanvas.tsx（1,725行）のリファクタリングに失敗し、以下のバグが発生しました：
- Memoノードがエリア外に脱出
- タスクノードのエッジが非表示
- ProposalノードがLearnエリアに誤配置

原因：テストなしで大規模な変更を行ったため。

## 目標

テストを書きながら、GraphCanvas.tsxを安全に分割する。

## 手順

### 1. テスト環境構築（15分）

```bash
# インストール
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @types/jest

# jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
EOF

# jest.setup.js
cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom'

// Supabaseモック
jest.mock('@/app/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  }),
}))
EOF

# package.jsonに追加
npm pkg set scripts.test="jest" scripts.test:watch="jest --watch"

# 確認
npm test
```

### 2. 現在の動作を記録（30分）

```typescript
// __tests__/characterization/graph-canvas.test.tsx
import { render, screen } from '@testing-library/react'
import { GraphCanvas } from '@/app/components/graph/GraphCanvas'

describe('GraphCanvas 現状の動作', () => {
  it('レンダリングできる', () => {
    render(<GraphCanvas />)
    expect(screen.getByTestId('graph-stage')).toBeInTheDocument()
  })

  it('初期サイズが正しい', () => {
    const { container } = render(<GraphCanvas />)
    const stage = container.querySelector('[data-testid="graph-stage"]')
    expect(stage).toHaveAttribute('width', '800')
    expect(stage).toHaveAttribute('height', '600')
  })

  // 最低5個のテストを書く（現在の動作を記録）
})
```

### 3. 純粋関数の抽出（1時間）

GraphCanvas.tsxから副作用のない関数を探して抽出：

```typescript
// 対象となる関数（GraphCanvas.tsx内）
const isNodeVisible = (node, viewport) => { /* ... */ }
const isEdgeVisible = (edge) => { /* ... */ }
const getViewport = () => { /* ... */ }

// テストを書く
// __tests__/unit/graph/visibility.test.ts
import { isNodeVisible } from '@/app/lib/graph/visibility'

describe('isNodeVisible', () => {
  const viewport = { x: 0, y: 0, width: 800, height: 600 }
  
  it('ビューポート内のノードは可視', () => {
    const node = { position: { x: 400, y: 300 } }
    expect(isNodeVisible(node, viewport)).toBe(true)
  })
  
  it('ビューポート外のノードは不可視', () => {
    const node = { position: { x: 1000, y: 1000 } }
    expect(isNodeVisible(node, viewport)).toBe(false)
  })
})

// 新ファイルに移動
// app/lib/graph/visibility.ts
export function isNodeVisible(node, viewport) {
  const pos = node.position
  if (!pos) return false
  const nodeRadius = 60
  return (
    pos.x + nodeRadius >= viewport.x &&
    pos.x - nodeRadius <= viewport.x + viewport.width &&
    pos.y + nodeRadius >= viewport.y &&
    pos.y - nodeRadius <= viewport.y + viewport.height
  )
}

// GraphCanvas.tsxでimport
import { isNodeVisible } from '@/app/lib/graph/visibility'
```

### 4. カスタムフックの抽出（1時間）

状態管理ロジックをフックに：

```typescript
// テストを書く
// __tests__/unit/hooks/useViewport.test.ts
import { renderHook, act } from '@testing-library/react'
import { useViewport } from '@/app/hooks/useViewport'

describe('useViewport', () => {
  it('初期値が正しい', () => {
    const { result } = renderHook(() => useViewport())
    expect(result.current.scale).toBe(1)
    expect(result.current.position).toEqual({ x: 0, y: 0 })
  })

  it('ズームできる', () => {
    const { result } = renderHook(() => useViewport())
    act(() => result.current.zoomIn())
    expect(result.current.scale).toBe(1.2)
  })
})

// フックを実装
// app/hooks/useViewport.ts
export function useViewport(initialDimensions = { width: 800, height: 600 }) {
  const [dimensions, setDimensions] = useState(initialDimensions)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const zoomIn = () => setScale(s => Math.min(s * 1.2, 5))
  const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.1))
  
  return { dimensions, scale, position, zoomIn, zoomOut }
}

// GraphCanvas.tsxで使用
const viewport = useViewport()
```

### 5. イベントハンドラーの分離（2時間）

依存関係を明示的に：

```typescript
// テストを書く
// __tests__/unit/handlers/node-handlers.test.ts
describe('NodeHandlers', () => {
  it('ノードを削除できる', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null })
    const handlers = createNodeHandlers({ deleteNode: mockDelete })
    
    await handlers.handleDeleteNode('node-1')
    
    expect(mockDelete).toHaveBeenCalledWith('node-1')
  })
})

// ハンドラーを分離
// app/components/graph/handlers/node-handlers.ts
export function createNodeHandlers(deps: {
  deleteNode: (id: string) => Promise<any>
  updateNode: (id: string, data: any) => Promise<any>
}) {
  return {
    handleDeleteNode: async (id: string) => {
      const result = await deps.deleteNode(id)
      if (result.error) console.error(result.error)
    },
    // 他のハンドラー
  }
}

// GraphCanvas.tsxで使用
const handlers = createNodeHandlers({
  deleteNode: (id) => supabase.from('nodes').delete().eq('id', id),
  updateNode: (id, data) => supabase.from('nodes').update(data).eq('id', id),
})
```

### 6. CI設定（15分）

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

## 成功基準

- [ ] `npm test`が動く
- [ ] 10個以上のテストがある
- [ ] GraphCanvas.tsxが200行以上減った
- [ ] CIが通る
- [ ] リファクタリング前と同じ動作をする

## 注意事項

1. **動くものを壊さない** - テストが通ってからリファクタリング
2. **小さく進める** - 1回の変更は100行以内
3. **すぐ戻せる** - こまめにコミット

## トラブルシューティング

- **テストが書けない場合**: 対象が大きすぎる。もっと小さな関数から始める
- **モックが複雑な場合**: 依存を減らすリファクタリングを先に行う
- **時間が足りない場合**: 純粋関数の抽出だけでも価値がある

---

このドキュメントだけで、GraphCanvas.tsxのTDDリファクタリングが実行できます。