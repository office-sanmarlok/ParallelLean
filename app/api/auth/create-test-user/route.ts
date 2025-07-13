import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Service Roleキーを使用してadmin権限でクライアントを作成
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 新しいテストユーザーを作成
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'test2@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User 2',
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'テストユーザーが作成されました',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
