'use client'

import { useGraphStore } from '@/app/stores/graphStore'
import { useEffect } from 'react'

export function FloatingIndicator() {
  const { linkingMode, linkingSource, setLinkingMode, setLinkingSource } = useGraphStore()

  useEffect(() => {
    if (!linkingMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLinkingMode(false)
        setLinkingSource(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [linkingMode, setLinkingMode, setLinkingSource])

  if (!linkingMode || !linkingSource) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <p className="text-sm font-medium">
        リンク作成モード: {linkingSource.title} から Memoノードをクリックして接続
      </p>
      <p className="text-xs mt-1 text-blue-100">ESCキーまたは背景クリックでキャンセル</p>
    </div>
  )
}
