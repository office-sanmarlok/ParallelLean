'use client'

import { GraphCanvasWrapper } from '@/app/components/graph/GraphCanvasWrapper'
import { useGraphData } from '@/app/hooks/useGraphData'
import { useLinkCreation } from '@/app/hooks/useLinkCreation'
import { useGraphStore } from '@/app/stores/graphStore'
import { Loading } from '@/app/components/ui/Loading'

export default function GraphPage() {
  // グラフデータの取得とリアルタイム同期
  useGraphData()

  // リンク作成のキーボードショートカット
  useLinkCreation()

  const { isLoading } = useGraphStore()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ backgroundColor: '#f9fafb' }}>
      <GraphCanvasWrapper />
    </div>
  )
}
