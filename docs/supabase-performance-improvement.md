# Supabaseパフォーマンス改善案

## 現状の問題点

### 1. クライアントインスタンスの重複
- 20以上のファイルで`createClient()`を個別に呼び出し
- 各呼び出しで新しい認証セッション確認とWebSocket接続が発生
- メモリ使用量の増加とネットワークオーバーヘッド

### 2. 個別のデータベースリクエスト
- ノード位置更新で各ノードに個別のUPDATEリクエスト
- タスク依存関係作成で複数の個別INSERT
- N+1クエリ問題の発生

### 3. リアルタイム購読の非効率性
- nodes/edgesで別々のチャンネル
- コンポーネント再マウント時の再購読
- 不要なイベントの受信

### 4. ネットワークレイテンシ
- SSL接続確立: 約28.7ms
- 初回レスポンス: 約105.3ms
- 日本からのアクセスでリージョンが最適でない可能性

## 改善案

### 案1: Supabaseクライアントのシングルトン化

#### 実装内容
```typescript
// app/lib/supabase/singleton.ts
let browserClient: SupabaseClient | null = null
let serverClient: SupabaseClient | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // サーバーサイド
    if (!serverClient) {
      serverClient = createServerClient(...)
    }
    return serverClient
  } else {
    // クライアントサイド
    if (!browserClient) {
      browserClient = createBrowserClient(...)
    }
    return browserClient
  }
}

// 既存のcreateClient呼び出しを置き換え
// Before: const supabase = createClient()
// After: const supabase = getSupabaseClient()
```

#### Pros
- クライアントインスタンスの重複を完全に排除
- メモリ使用量の削減（推定30-50%）
- WebSocket接続の一元管理
- 認証状態の一貫性向上

#### Cons
- 全ファイル（20+）の修正が必要
- テストの書き換えが必要
- エラー時のクライアント再作成ロジックが複雑化

#### 推定改善効果
- 初期化時間: 50-70%削減
- メモリ使用量: 30-50%削減

---

### 案2: バルク操作の実装

#### 実装内容
```typescript
// app/lib/supabase/bulk-operations.ts
export async function bulkUpdateNodePositions(
  updates: Array<{ id: string; position: { x: number; y: number } }>
) {
  const supabase = getSupabaseClient()
  
  // 方法1: upsertを使用
  const { error } = await supabase
    .from('nodes')
    .upsert(
      updates.map(({ id, position }) => ({
        id,
        position,
        updated_at: new Date().toISOString()
      })),
      { onConflict: 'id' }
    )
  
  // 方法2: RPC関数を使用（要DB関数作成）
  const { error: rpcError } = await supabase
    .rpc('bulk_update_positions', { updates })
}

// Supabase側のDB関数
/*
CREATE OR REPLACE FUNCTION bulk_update_positions(updates jsonb)
RETURNS void AS $$
BEGIN
  UPDATE nodes
  SET position = (u->>'position')::jsonb,
      updated_at = NOW()
  FROM jsonb_array_elements(updates) AS u
  WHERE nodes.id = u->>'id';
END;
$$ LANGUAGE plpgsql;
*/
```

#### Pros
- データベースリクエスト数を大幅削減（N→1）
- ネットワークラウンドトリップの削減
- トランザクション処理で一貫性保証
- 位置更新で90%以上のパフォーマンス向上

#### Cons
- バルク操作用の新しいAPIレイヤーが必要
- エラーハンドリングが複雑化（部分的な失敗の処理）
- デバッグが困難になる可能性
- DB関数の作成・管理が必要（RPC使用時）

#### 推定改善効果
- 位置更新: 90%以上の高速化
- ネットワーク使用量: 80%削減

---

### 案3: リアルタイム購読の最適化

#### 実装内容
```typescript
// app/hooks/useOptimizedRealtimeSync.ts
export function useOptimizedRealtimeSync() {
  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // 単一チャンネルで複数テーブルを購読
    const channel = supabase
      .channel('graph-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nodes',
          filter: 'area=in.(knowledge_base,idea_stock,build,measure,learn)'
        },
        handleNodeChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edges'
        },
        handleEdgeChange
      )
      .subscribe()
    
    // グローバルな購読管理
    subscriptionManager.add('graph', channel)
    
    return () => {
      subscriptionManager.remove('graph')
    }
  }, [])
}

// 購読マネージャー
class SubscriptionManager {
  private subscriptions = new Map()
  
  add(key: string, channel: RealtimeChannel) {
    // 既存の購読があれば削除
    this.remove(key)
    this.subscriptions.set(key, channel)
  }
  
  remove(key: string) {
    const channel = this.subscriptions.get(key)
    if (channel) {
      channel.unsubscribe()
      this.subscriptions.delete(key)
    }
  }
}
```

#### Pros
- WebSocket接続数の削減
- 購読の重複を防止
- リソース使用量の削減
- 購読管理の一元化

#### Cons
- 既存のリアルタイム処理の大規模な書き換え
- フィルタリングロジックの複雑化
- デバッグツールの追加開発が必要

#### 推定改善効果
- WebSocket接続数: 50-70%削減
- リアルタイム更新の遅延: 20-30%改善

---

### 案4: React Query統合によるキャッシュ層

#### 実装内容
```typescript
// app/hooks/useNodesQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useNodesQuery() {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data
    },
    staleTime: 30000, // 30秒間はキャッシュを使用
    cacheTime: 300000, // 5分間キャッシュ保持
  })
}

export function useUpdateNodeMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async ({ id, updates }) => {
      // 楽観的更新
      await queryClient.cancelQueries(['nodes'])
      const previousNodes = queryClient.getQueryData(['nodes'])
      
      queryClient.setQueryData(['nodes'], old => 
        old.map(node => node.id === id ? { ...node, ...updates } : node)
      )
      
      return { previousNodes }
    },
    onError: (err, variables, context) => {
      // ロールバック
      queryClient.setQueryData(['nodes'], context.previousNodes)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['nodes'])
    }
  })
}
```

#### Pros
- 自動的なキャッシュ管理
- 組み込みの楽観的更新サポート
- バックグラウンド再取得
- 重複リクエストの自動排除
- エラー時の自動リトライ

#### Cons
- 新しい依存関係の追加（React Query）
- 既存のZustandストアとの統合が必要
- 学習曲線
- バンドルサイズの増加（約12KB gzipped）

#### 推定改善効果
- 重複リクエスト: 100%削減
- 平均レスポンス時間: 60-80%改善（キャッシュヒット時）

---

### 案5: Edge FunctionsによるAPI最適化

#### 実装内容
```typescript
// supabase/functions/graph-operations/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { method, body } = await req.json()
  
  switch (method) {
    case 'bulkUpdatePositions':
      return handleBulkUpdatePositions(body)
    case 'createNodeWithEdges':
      return handleCreateNodeWithEdges(body)
    case 'getGraphData':
      return handleGetGraphData(body)
  }
})

async function handleBulkUpdatePositions({ updates }) {
  // 単一のトランザクションで複数更新
  const results = await supabase.rpc('bulk_update_positions', { updates })
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
}

async function handleGetGraphData({ area }) {
  // 関連データを一度に取得
  const [nodes, edges, tags] = await Promise.all([
    supabase.from('nodes').select('*').eq('area', area),
    supabase.from('edges').select('*'),
    supabase.from('nodes').select('*').in('type', ['kb_tag', 'is_tag'])
  ])
  
  return new Response(JSON.stringify({ nodes, edges, tags }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

#### Pros
- サーバーサイドでの最適化により大幅な高速化
- 複雑なクエリの集約が可能
- データベースへの近接性（同一ネットワーク）
- カスタムビジネスロジックの実装が容易

#### Cons
- Edge Functionsの管理・デプロイが必要
- コールドスタート問題（初回リクエストが遅い）
- デバッグとモニタリングが複雑
- 追加のインフラストラクチャ

#### 推定改善効果
- 複雑なクエリ: 70-90%高速化
- ネットワークラウンドトリップ: 50%削減

---

## 推奨実装順序

1. **短期対策（1-2日）**
   - 案1: Supabaseクライアントのシングルトン化
   - 最小限の変更で大きな効果

2. **中期対策（1週間）**
   - 案2: バルク操作の実装（位置更新のみ）
   - 案3: リアルタイム購読の最適化

3. **長期対策（2-3週間）**
   - 案4: React Query統合
   - 案5: Edge Functions（必要に応じて）

## 組み合わせ効果

案1 + 案2 + 案3を実装した場合：
- 全体的なレスポンス時間: 60-80%改善
- ネットワーク使用量: 70%削減
- メモリ使用量: 40%削減

これらの改善により、楽観的更新が不要になるレベルまでパフォーマンスを向上させることが可能です。