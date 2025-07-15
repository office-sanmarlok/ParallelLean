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
    // Log error
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Server Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error.message || 'Sorry, a server error has occurred.'}
          </p>

          {error.digest && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}

          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <a
              href="/"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-center"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
