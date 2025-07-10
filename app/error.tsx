'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            サーバーエラー
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error.message || '申し訳ございません。サーバーでエラーが発生しました。'}
          </p>
          
          {error.digest && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              エラーID: {error.digest}
            </p>
          )}
          
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              再試行
            </button>
            <a
              href="/"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}