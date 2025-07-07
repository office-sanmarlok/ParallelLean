import { supabase } from './client';
import type {
  Node,
  Edge,
  ProjectLine,
  NodeType,
  AreaType,
  TaskStatus,
  ProjectStatus,
} from '@/types/database';

// ===============================
// Node Queries
// ===============================

export const nodeQueries = {
  // 全ノード取得
  async getAll() {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  // エリアごとのノード取得
  async getByArea(area: AreaType) {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('area', area)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  // 単一ノード取得
  async getById(nodeId: string) {
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();
    
    return { data, error };
  },

  // ノード作成
  async create(node: Omit<Node, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('nodes')
      .insert(node)
      .select()
      .single();
    
    return { data, error };
  },

  // ノード更新
  async update(nodeId: string, updates: Partial<Node>) {
    const { data, error } = await supabase
      .from('nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single();
    
    return { data, error };
  },

  // ノード削除
  async delete(nodeId: string) {
    const { error } = await supabase
      .from('nodes')
      .delete()
      .eq('id', nodeId);
    
    return { error };
  },

  // Memoノード作成（サイズ自動計算）
  async createMemo(title: string, content: string, position: { x: number; y: number }) {
    return this.create({
      type: 'memo',
      area: 'knowledge_base',
      title,
      content,
      position,
      size: 50, // トリガーで自動計算される
    });
  },

  // Proposalノード作成
  async createProposal(projectLineId: string, title: string, content: string, inheritedKbTags: string[]) {
    const { data: order } = await supabase
      .rpc('get_next_vertical_order', { p_project_line_id: projectLineId });
    
    return this.create({
      type: 'proposal',
      area: 'idea_stock',
      title,
      content,
      position: { x: 0, y: 0 }, // 自動配置される
      project_line_id: projectLineId,
      vertical_order: order || 0,
      inherited_kb_tags: inheritedKbTags,
      size: 50,
    });
  },

  // タスク状態更新
  async updateTaskStatus(taskId: string, status: TaskStatus) {
    return this.update(taskId, { task_status: status });
  },
};

// ===============================
// Edge Queries
// ===============================

export const edgeQueries = {
  // 全エッジ取得
  async getAll() {
    const { data, error } = await supabase
      .from('edges')
      .select('*');
    
    return { data, error };
  },

  // ノードに関連するエッジ取得
  async getByNode(nodeId: string) {
    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`);
    
    return { data, error };
  },

  // エッジ作成
  async create(edge: Omit<Edge, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('edges')
      .insert(edge)
      .select()
      .single();
    
    return { data, error };
  },

  // エッジ削除
  async delete(edgeId: string) {
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', edgeId);
    
    return { error };
  },

  // ノード間のエッジ削除
  async deleteByNodes(sourceId: string, targetId: string) {
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('source_id', sourceId)
      .eq('target_id', targetId);
    
    return { error };
  },
};

// ===============================
// ProjectLine Queries
// ===============================

export const projectLineQueries = {
  // 全プロジェクトライン取得
  async getAll() {
    const { data, error } = await supabase
      .from('project_lines')
      .select('*')
      .order('x_position', { ascending: true });
    
    return { data, error };
  },

  // アクティブなプロジェクトライン取得
  async getActive() {
    const { data, error } = await supabase
      .from('project_lines')
      .select('*')
      .not('status', 'in', ['archived', 'shutdown'])
      .order('x_position', { ascending: true });
    
    return { data, error };
  },

  // プロジェクトライン作成
  async create(projectLine: Omit<ProjectLine, 'id' | 'created_at' | 'updated_at' | 'measurement_end_date'>) {
    const { data, error } = await supabase
      .from('project_lines')
      .insert(projectLine)
      .select()
      .single();
    
    return { data, error };
  },

  // プロジェクトステータス更新
  async updateStatus(projectLineId: string, status: ProjectStatus) {
    const updates: any = { status };
    
    // Measureに入る時は計測開始日を設定
    if (status === 'measure') {
      updates.measurement_start_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('project_lines')
      .update(updates)
      .eq('id', projectLineId)
      .select()
      .single();
    
    return { data, error };
  },

  // プロジェクトサマリー取得
  async getSummary() {
    const { data, error } = await supabase
      .from('project_summary')
      .select('*')
      .order('x_position', { ascending: true });
    
    return { data, error };
  },
};

// ===============================
// Graph Queries (Combined)
// ===============================

export const graphQueries = {
  // グラフ全体のデータ取得
  async getGraphData() {
    const [nodes, edges, projectLines] = await Promise.all([
      nodeQueries.getAll(),
      edgeQueries.getAll(),
      projectLineQueries.getActive(),
    ]);
    
    return {
      nodes: nodes.data || [],
      edges: edges.data || [],
      projectLines: projectLines.data || [],
      error: nodes.error || edges.error || projectLines.error,
    };
  },

  // ノード関係の取得
  async getNodeRelationships(nodeId: string) {
    const { data, error } = await supabase
      .from('node_relationships')
      .select('*')
      .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`);
    
    return { data, error };
  },
};

// ===============================
// Transition Queries
// ===============================

export const transitionQueries = {
  // エリア遷移の記録
  async recordTransition(nodeId: string, projectLineId: string, fromArea: AreaType, toArea: AreaType) {
    const { data, error } = await supabase
      .from('area_transitions')
      .insert({
        node_id: nodeId,
        project_line_id: projectLineId,
        from_area: fromArea,
        to_area: toArea,
      })
      .select()
      .single();
    
    return { data, error };
  },

  // プロジェクトの遷移履歴取得
  async getProjectHistory(projectLineId: string) {
    const { data, error } = await supabase
      .from('area_transitions')
      .select('*, nodes!inner(title, type)')
      .eq('project_line_id', projectLineId)
      .order('transitioned_at', { ascending: true });
    
    return { data, error };
  },
};

// ===============================
// Batch Operations
// ===============================

export const batchOperations = {
  // プロジェクトラインとProposalノードを同時に作成
  async createProject(title: string, xPosition: number, proposalContent: string, memoIds: string[], kbTags: string[]) {
    // トランザクション的な処理
    const { data: projectLine, error: plError } = await projectLineQueries.create({
      title,
      x_position: xPosition,
      status: 'idea_stock',
      measurement_period_days: 30,
    });
    
    if (plError || !projectLine) {
      return { error: plError };
    }
    
    // Proposalノード作成
    const { data: proposal, error: propError } = await nodeQueries.createProposal(
      projectLine.id,
      title,
      proposalContent,
      kbTags
    );
    
    if (propError || !proposal) {
      // ロールバック的な処理（プロジェクトライン削除）
      await supabase.from('project_lines').delete().eq('id', projectLine.id);
      return { error: propError };
    }
    
    // MemoノードからProposalへのエッジ作成
    const edgePromises = memoIds.map(memoId =>
      edgeQueries.create({
        source_id: memoId,
        target_id: proposal.id,
        type: 'reference',
        is_branch: false,
        is_merge: false,
      })
    );
    
    await Promise.all(edgePromises);
    
    return { data: { projectLine, proposal }, error: null };
  },

  // 全タスク完了チェックとMVP作成
  async completeAllTasksAndCreateMVP(projectLineId: string) {
    // 全タスク完了確認
    const { data: allCompleted } = await supabase
      .rpc('check_all_tasks_completed', { p_project_line_id: projectLineId });
    
    if (!allCompleted) {
      return { error: new Error('Not all tasks are completed') };
    }
    
    // MVPノード作成
    const { data: mvp, error: mvpError } = await nodeQueries.create({
      type: 'mvp',
      area: 'measure',
      title: 'MVP',
      content: '',
      position: { x: 0, y: 0 },
      project_line_id: projectLineId,
      vertical_order: 1000, // 十分大きな値
      size: 80,
    });
    
    if (mvpError || !mvp) {
      return { error: mvpError };
    }
    
    // Dashboardノード作成
    const { data: dashboard, error: dashError } = await nodeQueries.create({
      type: 'dashboard',
      area: 'measure',
      title: 'Dashboard',
      position: { x: 100, y: 0 },
      project_line_id: projectLineId,
      size: 60,
    });
    
    if (dashError || !dashboard) {
      return { error: dashError };
    }
    
    // MVPとDashboardを接続
    await edgeQueries.create({
      source_id: mvp.id,
      target_id: dashboard.id,
      type: 'flow',
      is_branch: false,
      is_merge: false,
    });
    
    // プロジェクトステータス更新
    await projectLineQueries.updateStatus(projectLineId, 'measure');
    
    return { data: { mvp, dashboard }, error: null };
  },
};