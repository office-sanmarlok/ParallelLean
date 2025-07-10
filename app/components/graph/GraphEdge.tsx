'use client'

import { Line, Arrow } from 'react-konva'
import type { Edge, Node } from '@/src/types/database'
import { calculateNodePosition } from '@/app/lib/graph/nodePosition'
import { AREA_ORDER } from '@/app/lib/graph/layout'
import { useGraphStore } from '@/app/stores/graphStore'

interface GraphEdgeProps {
  edge: Edge
  nodes: Node[]
}

export function GraphEdge({ edge, nodes }: GraphEdgeProps) {
  const sourceNode = nodes.find(n => n.id === edge.source_id)
  const targetNode = nodes.find(n => n.id === edge.target_id)

  if (!sourceNode || !targetNode) return null

  // 座標を計算
  const sourcePos = calculateNodePosition(
    sourceNode, 
    undefined, 
    AREA_ORDER.indexOf(sourceNode.area)
  )
  const targetPos = calculateNodePosition(
    targetNode, 
    undefined, 
    AREA_ORDER.indexOf(targetNode.area)
  )

  // エッジタイプごとのスタイル（統一デザイン）
  const getEdgeStyle = () => {
    // 仮想エッジ（ボタンノード用）は破線
    if (edge.id.startsWith('virtual-')) {
      return {
        stroke: '#9CA3AF',
        strokeWidth: 1,
        dash: [3, 3],
        opacity: 0.5,
      }
    }
    
    // 通常のエッジは全て同じスタイル
    return {
      stroke: '#6B7280',
      strokeWidth: 1.5,
      opacity: 0.6,
    }
  }

  const style = getEdgeStyle()

  // 全て線のみ（矢印なし）で統一
  return (
    <Line
      points={[sourcePos.x, sourcePos.y, targetPos.x, targetPos.y]}
      {...style}
    />
  )
}