import type { Database } from './database.generated'

// 基本の型定義
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// テーブルの型エイリアス
export type Node = Tables<'nodes'>
export type Edge = Tables<'edges'>
export type Profile = Tables<'profiles'>
export type AreaTransition = Tables<'area_transitions'>
export type ProjectReport = Tables<'project_reports'>
export type KpiData = Tables<'kpi_data'>
export type Attachment = Tables<'attachments'>

// Enumの型エイリアス
export type NodeType = Enums<'node_type'>
export type AreaType = Enums<'area_type'>
export type EdgeType = Enums<'edge_type'>
export type TaskStatus = Enums<'task_status'>
export type ProjectStatus = Enums<'project_status'>

// ビューの型エイリアス
export type ProjectSummary = Database['public']['Views']['project_summary']['Row']
export type NodeRelationship = Database['public']['Views']['node_relationships']['Row']

// 位置情報の型
export interface Position {
  x: number
  y: number
}

// ノードの拡張型（位置情報を型安全に）
export interface NodeWithPosition extends Omit<Node, 'position'> {
  position: Position
}