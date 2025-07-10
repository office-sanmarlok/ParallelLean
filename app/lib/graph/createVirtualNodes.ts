import type { Node } from '@/src/types/database'

// 仮想ノード（ボタンノード）の作成ヘルパー
export function createVirtualNode(
  baseData: {
    id: string
    type: string
    area: Node['area']
    title: string
    position: { x: number; y: number }
    metadata?: any
  }
): Node {
  return {
    ...baseData,
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // 必須フィールドをnullで初期化
    branch_id: null,
    color: null,
    inherited_kb_tags: null,
    size: null,
    task_status: null,
    vertical_order: null,
  } as Node
}