// ParallelLean Database Types (共有ワークスペース版)
// 
// このファイルはSupabaseのスキーマに対応するTypeScript型定義です。
// 全ユーザーが同一のデータを共有するモデルです。

export type NodeType = 
  | 'memo'
  | 'kb_tag'
  | 'proposal'
  | 'research'
  | 'is_tag'
  | 'task'
  | 'mvp'
  | 'dashboard'
  | 'improvement';

export type AreaType = 
  | 'knowledge_base'
  | 'idea_stock'
  | 'build'
  | 'measure'
  | 'learn';

export type EdgeType = 
  | 'reference'    // Memo -> Proposal
  | 'tag'          // Node -> Tag
  | 'flow'         // 垂直線上のフロー
  | 'dependency'   // Task間の依存関係
  | 'improvement'; // MVP -> Improvement

export type TaskStatus = 
  | 'completed'    // 緑
  | 'incomplete'   // 赤
  | 'pending';     // 黄

export type ProjectStatus = 
  | 'idea_stock'
  | 'build'
  | 'measure'
  | 'learn'
  | 'pivot'        // 再構築
  | 'shutdown'     // 撤退
  | 'archived';    // アーカイブ済み

export interface Position {
  x: number;
  y: number;
}

export interface Profile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectLine {
  id: string;
  title: string;
  x_position: number;
  status: ProjectStatus;
  measurement_period_days: number;
  measurement_start_date?: string;
  measurement_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  type: NodeType;
  area: AreaType;
  title: string;
  content?: string;
  position: Position;
  project_line_id?: string;
  vertical_order?: number;
  branch_id?: string;
  size: number;
  color?: string;
  task_status?: TaskStatus;
  inherited_kb_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Edge {
  id: string;
  source_id: string;
  target_id: string;
  type: EdgeType;
  is_branch: boolean;
  is_merge: boolean;
  branch_from?: string;
  merge_to?: string;
  created_at: string;
}

export interface AreaTransition {
  id: string;
  node_id: string;
  project_line_id: string;
  from_area: AreaType;
  to_area: AreaType;
  transitioned_at: string;
}

export interface ProjectReport {
  id: string;
  project_line_id: string;
  report_type: 'pivot' | 'shutdown';
  title: string;
  summary: string;
  metrics: Record<string, any>;
  lessons_learned: string[];
  node_snapshots: any[];
  created_at: string;
}

export interface KPIData {
  id: string;
  mvp_id: string;
  project_line_id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  metadata: Record<string, any>;
  recorded_at: string;
}

export interface Attachment {
  id: string;
  node_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

// ビューの型定義
export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  x_position: number;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  measurement_start_date?: string;
  measurement_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface NodeRelationship {
  source_id: string;
  source_title: string;
  source_type: NodeType;
  edge_type: EdgeType;
  target_id: string;
  target_title: string;
  target_type: NodeType;
  created_at: string;
}

// Supabaseクライアント用の型
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      project_lines: {
        Row: ProjectLine;
        Insert: Omit<ProjectLine, 'id' | 'created_at' | 'updated_at' | 'measurement_end_date'>;
        Update: Partial<Omit<ProjectLine, 'id' | 'created_at' | 'updated_at' | 'measurement_end_date'>>;
      };
      nodes: {
        Row: Node;
        Insert: Omit<Node, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Node, 'id' | 'created_at' | 'updated_at'>>;
      };
      edges: {
        Row: Edge;
        Insert: Omit<Edge, 'id' | 'created_at'>;
        Update: never; // エッジは更新不可
      };
      area_transitions: {
        Row: AreaTransition;
        Insert: Omit<AreaTransition, 'id' | 'transitioned_at'>;
        Update: never;
      };
      project_reports: {
        Row: ProjectReport;
        Insert: Omit<ProjectReport, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectReport, 'id' | 'project_line_id' | 'created_at'>>;
      };
      kpi_data: {
        Row: KPIData;
        Insert: Omit<KPIData, 'id' | 'recorded_at'>;
        Update: Partial<Omit<KPIData, 'id' | 'mvp_id' | 'project_line_id' | 'recorded_at'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'created_at'>;
        Update: never; // 添付ファイルは更新不可（削除して再アップロード）
      };
    };
    Views: {
      project_summary: {
        Row: ProjectSummary;
      };
      node_relationships: {
        Row: NodeRelationship;
      };
    };
    Functions: {
      calculate_node_size: {
        Args: { content_length: number };
        Returns: number;
      };
      get_next_vertical_order: {
        Args: { p_project_line_id: string };
        Returns: number;
      };
      check_all_tasks_completed: {
        Args: { p_project_line_id: string };
        Returns: boolean;
      };
    };
  };
}