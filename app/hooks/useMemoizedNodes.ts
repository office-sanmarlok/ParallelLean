'use client'

import { useMemo } from 'react'
import type { Tables } from '@/src/types/database.generated'

type Node = Tables<'nodes'>
type Edge = Tables<'edges'>

/**
 * ノードとエッジをメモ化し、位置の更新による不要な再レンダリングを防ぐ
 */
export function useMemoizedNodes(
  nodes: Node[],
  edges: Edge[],
  virtualNodes: Node[],
  area: 'knowledge_base' | 'idea_stock'
) {
  // エリアに応じたノードをフィルタリング（位置以外の属性でメモ化）
  const areaNodes = useMemo(() => {
    const filtered = nodes.filter(n => n.area === area)
    const virtualFiltered = virtualNodes.filter(n => n.area === area)
    return [...filtered, ...virtualFiltered]
  }, [
    // 位置以外の属性の変更を検出
    nodes.map(n => `${n.id}-${n.area}-${n.node_type}-${n.title}`).join(','),
    virtualNodes.map(n => `${n.id}-${n.area}-${n.node_type}-${n.title}`).join(','),
    area
  ])
  
  // エリアに応じたエッジをフィルタリング
  const areaEdges = useMemo(() => {
    const nodeIds = new Set(areaNodes.map(n => n.id))
    return edges.filter(e => 
      nodeIds.has(e.source_id) && nodeIds.has(e.target_id)
    )
  }, [
    // エッジの接続関係の変更を検出
    edges.map(e => `${e.id}-${e.source_id}-${e.target_id}-${e.type}`).join(','),
    areaNodes.map(n => n.id).join(',')
  ])
  
  return { areaNodes, areaEdges }
}