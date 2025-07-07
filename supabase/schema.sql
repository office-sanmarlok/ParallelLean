-- ParallelLean Database Schema for Supabase (共有ワークスペース版)
-- 
-- このスキーマはSupabaseのPostgreSQLデータベース用に設計されています。
-- 全ユーザーが同一のデータを共有して操作します。

-- =====================
-- ENUMS（型定義）
-- =====================

-- ノードタイプ
CREATE TYPE node_type AS ENUM (
  'memo',
  'kb_tag',
  'proposal',
  'research',
  'is_tag',
  'task',
  'mvp',
  'dashboard',
  'improvement'
);

-- エリアタイプ
CREATE TYPE area_type AS ENUM (
  'knowledge_base',
  'idea_stock',
  'build',
  'measure',
  'learn'
);

-- エッジタイプ
CREATE TYPE edge_type AS ENUM (
  'reference',    -- Memo -> Proposal
  'tag',          -- Node -> Tag
  'flow',         -- 垂直線上のフロー
  'dependency',   -- Task間の依存関係
  'improvement'   -- MVP -> Improvement
);

-- タスクステータス
CREATE TYPE task_status AS ENUM (
  'completed',    -- 緑
  'incomplete',   -- 赤
  'pending'       -- 黄
);

-- プロジェクトステータス
CREATE TYPE project_status AS ENUM (
  'idea_stock',
  'build',
  'measure',
  'learn',
  'pivot',        -- 再構築
  'shutdown',     -- 撤退
  'archived'      -- アーカイブ済み
);

-- =====================
-- TABLES（テーブル）
-- =====================

-- ユーザープロファイル（認証用、作成者記録は行わない）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロジェクトライン（垂直の線）
CREATE TABLE project_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  x_position FLOAT NOT NULL, -- 横方向の位置（0-1000）
  status project_status NOT NULL DEFAULT 'idea_stock',
  
  -- 計測期間設定
  measurement_period_days INTEGER DEFAULT 30,
  measurement_start_date TIMESTAMPTZ,
  measurement_end_date TIMESTAMPTZ GENERATED ALWAYS AS (
    CASE 
      WHEN measurement_start_date IS NOT NULL 
      THEN measurement_start_date + (measurement_period_days || ' days')::INTERVAL
      ELSE NULL
    END
  ) STORED,
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ノード
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type node_type NOT NULL,
  area area_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- MDファイルの内容
  
  -- 位置情報
  position JSONB DEFAULT '{"x": 0, "y": 0}' CHECK (
    position ? 'x' AND position ? 'y'
  ),
  
  -- プロジェクトライン関連
  project_line_id UUID REFERENCES project_lines(id) ON DELETE CASCADE,
  vertical_order INTEGER CHECK (vertical_order >= 0), -- 垂直線上での順序
  branch_id TEXT, -- 分岐識別子（例: "main", "branch-1"）
  
  -- スタイル関連
  size INTEGER DEFAULT 50 CHECK (size > 0), -- Memoノードのサイズ
  color TEXT, -- カスタム色（オプション）
  
  -- タスク専用
  task_status task_status,
  
  -- タグ継承（Proposal用）
  inherited_kb_tags TEXT[], -- 継承されたKBTagのタイトル
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT node_area_type_check CHECK (
    (type = 'memo' AND area = 'knowledge_base') OR
    (type = 'kb_tag' AND area = 'knowledge_base') OR
    (type IN ('proposal', 'research', 'is_tag') AND area = 'idea_stock') OR
    (type = 'task' AND area = 'build') OR
    (type IN ('mvp', 'dashboard') AND area IN ('measure', 'learn')) OR
    (type = 'improvement' AND area = 'learn')
  ),
  CONSTRAINT task_status_check CHECK (
    (type = 'task' AND task_status IS NOT NULL) OR
    (type != 'task' AND task_status IS NULL)
  ),
  CONSTRAINT project_line_check CHECK (
    (type IN ('memo', 'kb_tag') AND project_line_id IS NULL) OR
    (type NOT IN ('memo', 'kb_tag'))
  )
);

-- エッジ（ノード間の関係）
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type edge_type NOT NULL,
  
  -- 分岐・合流情報
  is_branch BOOLEAN DEFAULT FALSE,
  is_merge BOOLEAN DEFAULT FALSE,
  branch_from TEXT, -- どのブランチから分岐したか
  merge_to TEXT,    -- どのブランチに合流するか
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT no_self_edge CHECK (source_id != target_id),
  CONSTRAINT unique_edge UNIQUE(source_id, target_id)
);

-- エリア間遷移履歴
CREATE TABLE area_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  project_line_id UUID NOT NULL REFERENCES project_lines(id) ON DELETE CASCADE,
  from_area area_type NOT NULL,
  to_area area_type NOT NULL,
  transitioned_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT different_areas CHECK (from_area != to_area)
);

-- プロジェクトレポート（再構築・撤退時）
CREATE TABLE project_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_line_id UUID NOT NULL REFERENCES project_lines(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('pivot', 'shutdown')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  
  -- 構造化データ
  metrics JSONB DEFAULT '{}', -- KPIデータ
  lessons_learned JSONB DEFAULT '[]', -- 学習事項のリスト
  
  -- 関連ノードのスナップショット
  node_snapshots JSONB DEFAULT '[]', -- 当時のノード情報
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIデータ（将来の拡張用）
CREATE TABLE kpi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mvp_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  project_line_id UUID NOT NULL REFERENCES project_lines(id) ON DELETE CASCADE,
  
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  metadata JSONB DEFAULT '{}',
  
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 複合インデックス用
  CONSTRAINT unique_metric_per_time UNIQUE(mvp_id, metric_name, recorded_at)
);

-- 添付ファイル管理（画像など）
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES（インデックス）
-- =====================

-- ノード検索高速化
CREATE INDEX idx_nodes_type_area ON nodes(type, area);
CREATE INDEX idx_nodes_project_line ON nodes(project_line_id) WHERE project_line_id IS NOT NULL;

-- エッジ検索高速化
CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_edges_target ON edges(target_id);

-- プロジェクトライン検索
CREATE INDEX idx_project_lines_status ON project_lines(status);

-- KPIデータ検索
CREATE INDEX idx_kpi_data_mvp ON kpi_data(mvp_id, recorded_at DESC);

-- 添付ファイル検索
CREATE INDEX idx_attachments_node ON attachments(node_id);

-- =====================
-- FUNCTIONS（関数）
-- =====================

-- ノードサイズ自動計算（Memoノード用）
CREATE OR REPLACE FUNCTION calculate_node_size(content_length INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- 100文字ごとに10ピクセル増加、最小50、最大200
  RETURN LEAST(GREATEST(50 + (content_length / 100) * 10, 50), 200);
END;
$$ LANGUAGE plpgsql;

-- プロジェクトラインの次の垂直順序を取得
CREATE OR REPLACE FUNCTION get_next_vertical_order(p_project_line_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_order INTEGER;
BEGIN
  SELECT COALESCE(MAX(vertical_order), -1) + 1
  INTO max_order
  FROM nodes
  WHERE project_line_id = p_project_line_id;
  
  RETURN max_order;
END;
$$ LANGUAGE plpgsql;

-- すべてのタスクが完了しているかチェック
CREATE OR REPLACE FUNCTION check_all_tasks_completed(p_project_line_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM nodes
    WHERE project_line_id = p_project_line_id
      AND type = 'task'
      AND task_status != 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- =====================
-- TRIGGERS（トリガー）
-- =====================

-- 更新時刻自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_lines_updated_at
  BEFORE UPDATE ON project_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Memoノードのサイズ自動計算
CREATE OR REPLACE FUNCTION auto_calculate_memo_size()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'memo' AND NEW.content IS NOT NULL THEN
    NEW.size = calculate_node_size(LENGTH(NEW.content));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_size_memo_nodes
  BEFORE INSERT OR UPDATE ON nodes
  FOR EACH ROW
  WHEN (NEW.type = 'memo')
  EXECUTE FUNCTION auto_calculate_memo_size();

-- プロジェクトステータス自動更新
CREATE OR REPLACE FUNCTION auto_update_project_status()
RETURNS TRIGGER AS $$
DECLARE
  all_tasks_done BOOLEAN;
BEGIN
  -- Buildエリアのすべてのタスクが完了したら、Measureへ
  IF NEW.area = 'build' AND NEW.task_status = 'completed' THEN
    all_tasks_done := check_all_tasks_completed(NEW.project_line_id);
    
    IF all_tasks_done THEN
      UPDATE project_lines
      SET status = 'measure',
          measurement_start_date = NOW()
      WHERE id = NEW.project_line_id
        AND status = 'build';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_project_advancement
  AFTER UPDATE ON nodes
  FOR EACH ROW
  WHEN (NEW.type = 'task' AND NEW.task_status = 'completed')
  EXECUTE FUNCTION auto_update_project_status();

-- =====================
-- VIEWS（ビュー）
-- =====================

-- プロジェクト概要ビュー
CREATE VIEW project_summary AS
SELECT 
  pl.id,
  pl.title,
  pl.status,
  pl.x_position,
  COUNT(DISTINCT n.id) FILTER (WHERE n.type = 'task') AS total_tasks,
  COUNT(DISTINCT n.id) FILTER (WHERE n.type = 'task' AND n.task_status = 'completed') AS completed_tasks,
  CASE 
    WHEN COUNT(DISTINCT n.id) FILTER (WHERE n.type = 'task') > 0
    THEN (COUNT(DISTINCT n.id) FILTER (WHERE n.type = 'task' AND n.task_status = 'completed')::FLOAT / 
          COUNT(DISTINCT n.id) FILTER (WHERE n.type = 'task'))
    ELSE 0
  END AS completion_rate,
  pl.measurement_start_date,
  pl.measurement_end_date,
  pl.created_at,
  pl.updated_at
FROM project_lines pl
LEFT JOIN nodes n ON pl.id = n.project_line_id
GROUP BY pl.id;

-- ノード関係ビュー
CREATE VIEW node_relationships AS
SELECT 
  n1.id AS source_id,
  n1.title AS source_title,
  n1.type AS source_type,
  e.type AS edge_type,
  n2.id AS target_id,
  n2.title AS target_title,
  n2.type AS target_type,
  e.created_at
FROM edges e
JOIN nodes n1 ON e.source_id = n1.id
JOIN nodes n2 ON e.target_id = n2.id;

-- =====================
-- RLS（Row Level Security）
-- =====================

-- 共有ワークスペースのため、全ユーザーがアクセス可能
-- ただし、認証されたユーザーのみに限定

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーは全データにアクセス可能
CREATE POLICY "Authenticated users can access all data"
  ON project_lines FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all nodes"
  ON nodes FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all edges"
  ON edges FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all transitions"
  ON area_transitions FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all reports"
  ON project_reports FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all KPI data"
  ON kpi_data FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all attachments"
  ON attachments FOR ALL
  USING (auth.role() = 'authenticated');

-- プロファイルは自分のものだけ更新可能
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================
-- INITIAL DATA（初期データ）
-- =====================

-- Supabase Authのユーザー作成時に自動的にプロファイルを作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();