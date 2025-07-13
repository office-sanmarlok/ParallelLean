'use client'

import { useAuthStore } from '@/app/stores/authStore'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">ParallelLean</h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
