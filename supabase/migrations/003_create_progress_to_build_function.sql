-- ProposalからBuildへの進行を原子的に処理する関数
CREATE OR REPLACE FUNCTION progress_to_build(
  p_project_line JSONB,
  p_tasks JSONB,
  p_edges JSONB
) RETURNS JSONB AS $$
DECLARE
  v_project_line_id UUID;
  v_task_ids UUID[];
  v_result JSONB;
BEGIN
  -- 1. プロジェクトラインを作成
  INSERT INTO project_lines (
    id,
    title,
    x_position,
    proposal_id
  ) VALUES (
    (p_project_line->>'id')::UUID,
    p_project_line->>'title',
    (p_project_line->>'x_position')::FLOAT,
    (p_project_line->>'proposal_id')::UUID
  ) RETURNING id INTO v_project_line_id;
  
  -- 2. タスクノードを作成
  WITH inserted_tasks AS (
    INSERT INTO nodes (
      id,
      type,
      area,
      title,
      content,
      position,
      task_status,
      project_line_id,
      metadata
    )
    SELECT 
      (value->>'id')::UUID,
      (value->>'type')::node_type,
      (value->>'area')::area_type,
      value->>'title',
      value->>'content',
      value->'position',
      (value->>'task_status')::task_status,
      (value->>'project_line_id')::UUID,
      value->'metadata'
    FROM jsonb_array_elements(p_tasks)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_task_ids FROM inserted_tasks;
  
  -- 3. エッジを作成
  INSERT INTO edges (
    id,
    source_id,
    target_id,
    type
  )
  SELECT 
    (value->>'id')::UUID,
    (value->>'source_id')::UUID,
    (value->>'target_id')::UUID,
    (value->>'type')::edge_type
  FROM jsonb_array_elements(p_edges);
  
  -- 成功レスポンスを返す
  v_result := jsonb_build_object(
    'success', true,
    'project_line_id', v_project_line_id,
    'task_ids', v_task_ids
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生した場合、自動的にロールバックされる
    RAISE EXCEPTION 'Failed to progress to build: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数にコメントを追加
COMMENT ON FUNCTION progress_to_build(JSONB, JSONB, JSONB) IS 
'ProposalからBuildエリアへの進行を原子的に処理します。
プロジェクトライン、タスクノード、エッジを1つのトランザクションで作成します。';