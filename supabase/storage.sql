-- Supabase Storage設定
-- 
-- このファイルはSupabase Storageのバケットと
-- RLSポリシーを設定します。

-- =====================
-- STORAGE BUCKETS
-- =====================

-- 添付ファイル用バケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'parallel-lean-files',
  'parallel-lean-files',
  false, -- プライベートバケット
  10485760, -- 10MB制限
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json'
  ]
);

-- =====================
-- STORAGE POLICIES
-- =====================

-- 認証されたユーザーは全ファイルにアクセス可能（共有ワークスペース）
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'parallel-lean-files' AND
  auth.role() = 'authenticated'
);

-- 認証されたユーザーは全ファイルを閲覧可能
CREATE POLICY "Authenticated users can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'parallel-lean-files' AND
  auth.role() = 'authenticated'
);

-- 認証されたユーザーは全ファイルを更新可能
CREATE POLICY "Authenticated users can update all files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'parallel-lean-files' AND
  auth.role() = 'authenticated'
);

-- 認証されたユーザーは全ファイルを削除可能
CREATE POLICY "Authenticated users can delete all files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'parallel-lean-files' AND
  auth.role() = 'authenticated'
);

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- ファイルの公開URL生成関数
CREATE OR REPLACE FUNCTION get_attachment_public_url(storage_path TEXT)
RETURNS TEXT AS $$
DECLARE
  supabase_url TEXT;
BEGIN
  -- 環境変数からSupabase URLを取得
  SELECT current_setting('app.supabase_url', true) INTO supabase_url;
  
  IF supabase_url IS NULL THEN
    -- デフォルトURLパターン
    RETURN format('https://%s.supabase.co/storage/v1/object/public/parallel-lean-files/%s',
                  current_database(), storage_path);
  ELSE
    RETURN format('%s/storage/v1/object/public/parallel-lean-files/%s',
                  supabase_url, storage_path);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ノードの添付ファイル数を取得
CREATE OR REPLACE FUNCTION get_node_attachment_count(p_node_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM attachments
    WHERE node_id = p_node_id
  );
END;
$$ LANGUAGE plpgsql;

-- ノードの添付ファイル合計サイズを取得
CREATE OR REPLACE FUNCTION get_node_attachment_size(p_node_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(file_size)
     FROM attachments
     WHERE node_id = p_node_id),
    0
  );
END;
$$ LANGUAGE plpgsql;