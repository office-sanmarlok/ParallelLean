export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)'
  }
  public: {
    Tables: {
      area_transitions: {
        Row: {
          from_area: Database['public']['Enums']['area_type']
          id: string
          node_id: string
          project_line_id: string
          to_area: Database['public']['Enums']['area_type']
          transitioned_at: string | null
        }
        Insert: {
          from_area: Database['public']['Enums']['area_type']
          id?: string
          node_id: string
          project_line_id: string
          to_area: Database['public']['Enums']['area_type']
          transitioned_at?: string | null
        }
        Update: {
          from_area?: Database['public']['Enums']['area_type']
          id?: string
          node_id?: string
          project_line_id?: string
          to_area?: Database['public']['Enums']['area_type']
          transitioned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'area_transitions_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['source_id']
          },
          {
            foreignKeyName: 'area_transitions_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['target_id']
          },
          {
            foreignKeyName: 'area_transitions_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'area_transitions_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_lines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'area_transitions_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_summary'
            referencedColumns: ['id']
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          node_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          node_id: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          node_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attachments_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['source_id']
          },
          {
            foreignKeyName: 'attachments_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['target_id']
          },
          {
            foreignKeyName: 'attachments_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'nodes'
            referencedColumns: ['id']
          },
        ]
      }
      edges: {
        Row: {
          branch_from: string | null
          created_at: string | null
          id: string
          is_branch: boolean | null
          is_merge: boolean | null
          merge_to: string | null
          source_id: string
          target_id: string
          type: Database['public']['Enums']['edge_type']
        }
        Insert: {
          branch_from?: string | null
          created_at?: string | null
          id?: string
          is_branch?: boolean | null
          is_merge?: boolean | null
          merge_to?: string | null
          source_id: string
          target_id: string
          type: Database['public']['Enums']['edge_type']
        }
        Update: {
          branch_from?: string | null
          created_at?: string | null
          id?: string
          is_branch?: boolean | null
          is_merge?: boolean | null
          merge_to?: string | null
          source_id?: string
          target_id?: string
          type?: Database['public']['Enums']['edge_type']
        }
        Relationships: [
          {
            foreignKeyName: 'edges_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['source_id']
          },
          {
            foreignKeyName: 'edges_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['target_id']
          },
          {
            foreignKeyName: 'edges_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'edges_target_id_fkey'
            columns: ['target_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['source_id']
          },
          {
            foreignKeyName: 'edges_target_id_fkey'
            columns: ['target_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['target_id']
          },
          {
            foreignKeyName: 'edges_target_id_fkey'
            columns: ['target_id']
            isOneToOne: false
            referencedRelation: 'nodes'
            referencedColumns: ['id']
          },
        ]
      }
      kpi_data: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          mvp_id: string
          project_line_id: string
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          mvp_id: string
          project_line_id: string
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          mvp_id?: string
          project_line_id?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'kpi_data_mvp_id_fkey'
            columns: ['mvp_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['source_id']
          },
          {
            foreignKeyName: 'kpi_data_mvp_id_fkey'
            columns: ['mvp_id']
            isOneToOne: false
            referencedRelation: 'node_relationships'
            referencedColumns: ['target_id']
          },
          {
            foreignKeyName: 'kpi_data_mvp_id_fkey'
            columns: ['mvp_id']
            isOneToOne: false
            referencedRelation: 'nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kpi_data_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_lines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'kpi_data_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_summary'
            referencedColumns: ['id']
          },
        ]
      }
      nodes: {
        Row: {
          area: Database['public']['Enums']['area_type']
          branch_id: string | null
          color: string | null
          content: string | null
          created_at: string | null
          id: string
          inherited_kb_tags: string[] | null
          metadata: Json | null
          position: Json | null
          project_line_id: string | null
          size: number | null
          task_status: Database['public']['Enums']['task_status'] | null
          title: string
          type: Database['public']['Enums']['node_type']
          updated_at: string | null
          vertical_order: number | null
        }
        Insert: {
          area: Database['public']['Enums']['area_type']
          branch_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          inherited_kb_tags?: string[] | null
          metadata?: Json | null
          position?: Json | null
          project_line_id?: string | null
          size?: number | null
          task_status?: Database['public']['Enums']['task_status'] | null
          title: string
          type: Database['public']['Enums']['node_type']
          updated_at?: string | null
          vertical_order?: number | null
        }
        Update: {
          area?: Database['public']['Enums']['area_type']
          branch_id?: string | null
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          inherited_kb_tags?: string[] | null
          metadata?: Json | null
          position?: Json | null
          project_line_id?: string | null
          size?: number | null
          task_status?: Database['public']['Enums']['task_status'] | null
          title?: string
          type?: Database['public']['Enums']['node_type']
          updated_at?: string | null
          vertical_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'nodes_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_lines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'nodes_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_summary'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_lines: {
        Row: {
          created_at: string | null
          id: string
          measurement_end_date: string | null
          measurement_period_days: number | null
          measurement_start_date: string | null
          proposal_id: string | null
          status: Database['public']['Enums']['project_status']
          title: string
          updated_at: string | null
          x_position: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          measurement_end_date?: string | null
          measurement_period_days?: number | null
          measurement_start_date?: string | null
          proposal_id?: string | null
          status?: Database['public']['Enums']['project_status']
          title: string
          updated_at?: string | null
          x_position: number
        }
        Update: {
          created_at?: string | null
          id?: string
          measurement_end_date?: string | null
          measurement_period_days?: number | null
          measurement_start_date?: string | null
          proposal_id?: string | null
          status?: Database['public']['Enums']['project_status']
          title?: string
          updated_at?: string | null
          x_position?: number
        }
        Relationships: []
      }
      project_reports: {
        Row: {
          created_at: string | null
          id: string
          lessons_learned: Json | null
          metrics: Json | null
          node_snapshots: Json | null
          project_line_id: string
          report_type: string
          summary: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lessons_learned?: Json | null
          metrics?: Json | null
          node_snapshots?: Json | null
          project_line_id: string
          report_type: string
          summary: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lessons_learned?: Json | null
          metrics?: Json | null
          node_snapshots?: Json | null
          project_line_id?: string
          report_type?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_reports_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_lines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_reports_project_line_id_fkey'
            columns: ['project_line_id']
            isOneToOne: false
            referencedRelation: 'project_summary'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      node_relationships: {
        Row: {
          created_at: string | null
          edge_type: Database['public']['Enums']['edge_type'] | null
          source_id: string | null
          source_title: string | null
          source_type: Database['public']['Enums']['node_type'] | null
          target_id: string | null
          target_title: string | null
          target_type: Database['public']['Enums']['node_type'] | null
        }
        Relationships: []
      }
      project_summary: {
        Row: {
          completed_tasks: number | null
          completion_rate: number | null
          created_at: string | null
          id: string | null
          measurement_end_date: string | null
          measurement_start_date: string | null
          status: Database['public']['Enums']['project_status'] | null
          title: string | null
          total_tasks: number | null
          updated_at: string | null
          x_position: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_node_size: {
        Args: { content_length: number }
        Returns: number
      }
      check_all_tasks_completed: {
        Args: { p_project_line_id: string }
        Returns: boolean
      }
      get_next_vertical_order: {
        Args: { p_project_line_id: string }
        Returns: number
      }
    }
    Enums: {
      area_type: 'knowledge_base' | 'idea_stock' | 'build' | 'measure' | 'learn'
      edge_type:
        | 'reference'
        | 'tag'
        | 'flow'
        | 'dependency'
        | 'improvement'
        | 'link'
        | 'measurement'
        | 'learning'
        | 'rebuild'
        | 'pivot'
      node_type:
        | 'memo'
        | 'kb_tag'
        | 'proposal'
        | 'research'
        | 'is_tag'
        | 'task'
        | 'mvp'
        | 'dashboard'
        | 'improvement'
      project_status:
        | 'active'
        | 'idea_stock'
        | 'build'
        | 'measure'
        | 'learn'
        | 'pivot'
        | 'shutdown'
        | 'archived'
      task_status: 'completed' | 'incomplete' | 'pending'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      area_type: ['knowledge_base', 'idea_stock', 'build', 'measure', 'learn'],
      edge_type: [
        'reference',
        'tag',
        'flow',
        'dependency',
        'improvement',
        'link',
        'measurement',
        'learning',
        'rebuild',
        'pivot',
      ],
      node_type: [
        'memo',
        'kb_tag',
        'proposal',
        'research',
        'is_tag',
        'task',
        'mvp',
        'dashboard',
        'improvement',
      ],
      project_status: [
        'active',
        'idea_stock',
        'build',
        'measure',
        'learn',
        'pivot',
        'shutdown',
        'archived',
      ],
      task_status: ['completed', 'incomplete', 'pending'],
    },
  },
} as const

// Additional type exports for convenience
export type Node = Tables<'nodes'>
export type Edge = Tables<'edges'>
export type ProjectLine = Tables<'project_lines'>
export type AreaType = Database['public']['Enums']['area_type']
export type NodeType = Database['public']['Enums']['node_type']
export type EdgeType = Database['public']['Enums']['edge_type']
export type TaskStatus = Database['public']['Enums']['task_status']
export type ProjectStatus = Database['public']['Enums']['project_status']
