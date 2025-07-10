'use client'

import { GraphCanvasWrapper } from '@/app/components/graph/GraphCanvasWrapper'
import { useGraphData } from '@/app/hooks/useGraphData'
import { useForceSimulation } from '@/app/hooks/useForceSimulation'
import { useLinkCreation } from '@/app/hooks/useLinkCreation'
import { useGraphStore } from '@/app/stores/graphStore'
import { Loading } from '@/app/components/ui/Loading'

export default function GraphPage() {
  // グラフデータの取得とリアルタイム同期
  useGraphData()
  
  // KnowledgeBaseエリアのForce Simulation（統合シミュレーションを使用するため無効化）
  // useForceSimulation()
  
  
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