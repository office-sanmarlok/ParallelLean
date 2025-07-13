// 環境変数の直接参照（Next.jsでは静的に置き換えられる）
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

// 開発時のみ環境変数をチェック
if (process.env.NODE_ENV === 'development') {
  const missingVars: string[] = []

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
    )
  }
}

// Supabase設定のヘルパー
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // オプション設定
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },

  // リアルタイム設定
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}

// 環境判定ヘルパー
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'
