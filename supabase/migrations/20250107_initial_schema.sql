-- Initial schema migration for ParallelLean
-- 
-- Run this migration with:
-- supabase migration up

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the schema
\i ../schema.sql