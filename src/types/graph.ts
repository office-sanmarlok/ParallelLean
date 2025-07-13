import type { Tables } from './database.generated'

// データベースのノード型
export type DbNodeType = Tables<'nodes'>['type']

// 仮想ノード（ボタン）の型
export type VirtualNodeType =
  | 'tag_button'
  | 'delete_button'
  | 'project_button'
  | 'new_memo_button'
  | 'research_button'
  | 'memo_link_button'
  | 'build_button'
  | 'task_link_button'
  | 'add_task_button'
  | 'status_button'
  | 'mvp_button'
  | 'debug_button'

// 全ノードタイプ（DB + 仮想）
export type AllNodeType = DbNodeType | VirtualNodeType

// 拡張ノード型（仮想ノードを含む）
export interface ExtendedNode extends Omit<Tables<'nodes'>, 'type'> {
  type: AllNodeType
  isVirtual?: boolean
}
