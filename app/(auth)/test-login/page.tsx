'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

export default function TestLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('test2@example.com')

  const router = useRouter()
  const supabase = createClient()

  const handleCreateTestUser = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/create-test-user', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(`エラー: ${data.error}`)
      } else {
        setMessage('テストユーザーが作成されました！ログインしてください。')
      }
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123',
      })

      if (error) {
        setMessage(`エラー: ${error.message}`)
      } else if (data?.user) {
        setMessage('ログイン成功！リダイレクト中...')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      }
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold">開発用ログイン</h2>
          <p className="mt-2 text-center text-sm text-gray-600">テストユーザーでログインします</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>⚠️ 最初に:</strong> テストユーザーを作成してください
            </p>
            <button
              onClick={handleCreateTestUser}
              disabled={isLoading}
              className="w-full rounded-md bg-yellow-600 py-2 px-4 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {isLoading ? '作成中...' : 'テストユーザーを作成'}
            </button>
          </div>

          <div className="border-t pt-4">
            <div className="rounded-md bg-gray-100 p-4 mb-4">
              <p className="text-sm">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm">
                <strong>Password:</strong> password123
              </p>
            </div>

            <button
              onClick={handleTestLogin}
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          {message && (
            <p
              className={`text-center text-sm ${message.includes('エラー') ? 'text-red-600' : 'text-green-600'}`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
