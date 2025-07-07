import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseクライアントの作成
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 認証ヘルパー関数
export const auth = {
  // サインアップ
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // サインイン
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // サインアウト
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 現在のユーザー取得
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // セッション取得
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// リアルタイムサブスクリプション用のヘルパー（共有ワークスペース版）
export const realtime = {
  // ノードの変更を監視（全ユーザー共通）
  subscribeToNodes(callback: (payload: any) => void) {
    return supabase
      .channel('nodes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nodes',
        },
        callback
      )
      .subscribe();
  },

  // エッジの変更を監視（全ユーザー共通）
  subscribeToEdges(callback: (payload: any) => void) {
    return supabase
      .channel('edges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edges',
        },
        callback
      )
      .subscribe();
  },

  // プロジェクトラインの変更を監視（全ユーザー共通）
  subscribeToProjectLines(callback: (payload: any) => void) {
    return supabase
      .channel('project_lines_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_lines',
        },
        callback
      )
      .subscribe();
  },
};