'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import type { Node, Edge } from '@/src/types/database'

// PERT図レイアウトのパラメータ
const PERT_PARAMS = {
  nodeSpacingX: 150, // ノード間の水平間隔
  nodeSpacingY: 120, // ノード間の垂直間隔
  startY: 100,       // 開始Y座標（Buildエリア内の相対位置）
}

interface NodeWithLevel extends Node {
  level?: number
  column?: number
}

export function usePertLayout() {
  const { nodes, edges, updateNode } = useGraphStore()
  const processedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // BuildエリアのTaskノードを取得
    const buildNodes = nodes.filter(n => n.area === 'build' && n.type === 'task')
    if (buildNodes.length === 0) return

    // エッジから依存関係グラフを構築
    const graph = new Map<string, string[]>()
    const reverseGraph = new Map<string, string[]>()
    
    buildNodes.forEach(node => {
      graph.set(node.id, [])
      reverseGraph.set(node.id, [])
    })

    edges.forEach(edge => {
      const source = buildNodes.find(n => n.id === edge.source_id)
      const target = buildNodes.find(n => n.id === edge.target_id)
      
      if (source && target) {
        graph.get(source.id)?.push(target.id)
        reverseGraph.get(target.id)?.push(source.id)
      }
    })

    // トポロジカルソートとレベル割り当て
    const levels = new Map<string, number>()
    const visited = new Set<string>()
    
    // 開始ノード（依存関係なし）を見つける
    const startNodes = buildNodes.filter(node => {
      const parents = reverseGraph.get(node.id) || []
      return parents.length === 0
    })

    // BFSでレベルを割り当て
    const queue: { id: string; level: number }[] = []
    startNodes.forEach(node => {
      queue.push({ id: node.id, level: 0 })
      levels.set(node.id, 0)
    })

    while (queue.length > 0) {
      const { id, level } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)

      const children = graph.get(id) || []
      children.forEach(childId => {
        const currentLevel = levels.get(childId) ?? -1
        const newLevel = level + 1
        
        if (newLevel > currentLevel) {
          levels.set(childId, newLevel)
          queue.push({ id: childId, level: newLevel })
        }
      })
    }

    // 各レベルでの列位置を計算
    const levelColumns = new Map<number, number>()
    const nodeColumns = new Map<string, number>()
    
    // レベルごとにノードをグループ化
    const nodesByLevel = new Map<number, string[]>()
    levels.forEach((level, nodeId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, [])
      }
      nodesByLevel.get(level)!.push(nodeId)
    })

    // 各レベルでノードを配置
    nodesByLevel.forEach((nodeIds, level) => {
      nodeIds.forEach((nodeId, index) => {
        nodeColumns.set(nodeId, index)
      })
      levelColumns.set(level, nodeIds.length)
    })

    // Buildエリアの境界を取得
    const buildAreaY = 2 * 2000 * 0.2 // 3番目のエリア（0-indexed）

    // ノードの位置を更新
    buildNodes.forEach(node => {
      const level = levels.get(node.id) ?? 0
      const column = nodeColumns.get(node.id) ?? 0
      const totalColumns = levelColumns.get(level) ?? 1
      
      // 中央揃えのためのオフセットを計算
      const offsetX = -(totalColumns - 1) * PERT_PARAMS.nodeSpacingX / 2
      
      const newPosition = {
        x: 1000 + offsetX + column * PERT_PARAMS.nodeSpacingX,
        y: buildAreaY + PERT_PARAMS.startY + level * PERT_PARAMS.nodeSpacingY
      }

      // 位置が変更された場合のみ更新
      const currentPos = typeof node.position === 'object' && node.position !== null
        ? (node.position as any)
        : { x: 0, y: 0 }
      
      if (Math.abs(currentPos.x - newPosition.x) > 1 || 
          Math.abs(currentPos.y - newPosition.y) > 1) {
        updateNode(node.id, { position: newPosition })
      }
    })
  }, [nodes.length, edges.length]) // ノードやエッジの数が変わったときのみ実行
}