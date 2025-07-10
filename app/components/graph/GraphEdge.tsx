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

  // エッジタイプごとのスタイル
  const getEdgeStyle = () => {
    switch (edge.type) {
      case 'reference':
        return {
          stroke: '#6B7280',
          strokeWidth: 2,
          dash: [5, 5],
        }
      case 'tag':
        return {
          stroke: '#9CA3AF',
          strokeWidth: 1.5,
        }
      case 'flow':
        return {
          stroke: '#3B82F6',
          strokeWidth: 3,
          opacity: 0.8,
        }
      case 'dependency':
        return {
          stroke: '#EF4444',
          strokeWidth: 2,
          dash: [10, 5],
        }
      case 'improvement':
        return {
          stroke: '#F59E0B',
          strokeWidth: 2,
        }
      default:
        return {
          stroke: '#000000',
          strokeWidth: 1,
        }
    }
  }

  const style = getEdgeStyle()
  const isDependency = edge.type === 'dependency'

  // 矢印付きか線のみか
  if (isDependency || edge.type === 'flow') {
    return (
      <Arrow
        points={[sourcePos.x, sourcePos.y, targetPos.x, targetPos.y]}
        {...style}
        pointerLength={10}
        pointerWidth={10}
        fill={style.stroke}
      />
    )
  }

  return (
    <Line
      points={[sourcePos.x, sourcePos.y, targetPos.x, targetPos.y]}
      {...style}
    />
  )
}