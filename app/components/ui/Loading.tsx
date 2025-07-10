export function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    </div>
  )
}