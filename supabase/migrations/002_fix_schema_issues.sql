-- Add missing edge types
ALTER TYPE edge_type ADD VALUE IF NOT EXISTS 'link';
ALTER TYPE edge_type ADD VALUE IF NOT EXISTS 'measurement';
ALTER TYPE edge_type ADD VALUE IF NOT EXISTS 'learning';
ALTER TYPE edge_type ADD VALUE IF NOT EXISTS 'rebuild';
ALTER TYPE edge_type ADD VALUE IF NOT EXISTS 'pivot';

-- Add metadata field to nodes table
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add proposal_id to project_lines table
ALTER TABLE project_lines ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES nodes(id) ON DELETE SET NULL;

-- Update project_status enum to include 'active'
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM (
  'active',       -- アクティブ
  'idea_stock',
  'build',
  'measure',
  'learn',
  'pivot',        -- 再構築
  'shutdown',     -- 撤退
  'archived'      -- アーカイブ済み
);

-- Recreate project_lines table with new status type
ALTER TABLE project_lines ALTER COLUMN status TYPE project_status USING status::text::project_status;
ALTER TABLE project_lines ALTER COLUMN status SET DEFAULT 'active';

-- Update the check constraint for project_line_check
ALTER TABLE nodes DROP CONSTRAINT IF EXISTS project_line_check;
ALTER TABLE nodes ADD CONSTRAINT project_line_check CHECK (
  (type IN ('memo', 'kb_tag') AND project_line_id IS NULL) OR
  (type NOT IN ('memo', 'kb_tag')) OR
  project_line_id IS NOT NULL
);