'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { useAuthStore } from '@/app/stores/authStore'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setIsLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_IN') {
        router.refresh()
      }
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    // 初期認証状態をチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, setUser, setIsLoading, supabase.auth])

  return <>{children}</>
}