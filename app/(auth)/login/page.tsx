'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import { Header } from '@/app/components/ui/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data?.user) {
          alert('Confirmation email sent. Please check your email.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data?.user) {
          router.push('/graph')
          router.refresh()
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header variant="homepage" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-20">
        <div className="w-full max-w-sm">
          <div className="space-y-8">
            {/* タイトル */}
            <div className="text-center">
              <h1 className="text-5xl font-bold text-black tracking-tight">
                {isSignUp ? 'Join' : 'Login'}
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                {isSignUp
                  ? 'Create your account to get started'
                  : 'Welcome back to ParallelLean'}
              </p>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base"
                />
                
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-base"
                />
              </div>

              {error && (
                <div className="p-3 bg-black text-white text-sm rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black text-white font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* 切り替えリンク */}
            <div className="text-center space-y-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-sm text-gray-600 hover:text-black transition-colors underline"
              >
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </button>
              
              <div className="text-sm">
                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}