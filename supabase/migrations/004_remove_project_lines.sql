-- Remove project_lines table and related constraints

-- Drop foreign key constraint from nodes table
ALTER TABLE nodes DROP CONSTRAINT IF EXISTS nodes_project_line_id_fkey;

-- Drop project_line_id column from nodes table
ALTER TABLE nodes DROP COLUMN IF EXISTS project_line_id;

-- Drop project_lines table
DROP TABLE IF EXISTS project_lines;

-- Remove project line related functions and triggers if any exist
DROP FUNCTION IF EXISTS create_project_line CASCADE;
DROP FUNCTION IF EXISTS update_project_line CASCADE;