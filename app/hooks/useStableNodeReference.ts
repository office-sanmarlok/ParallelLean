'use client'

import { useRef, useEffect } from 'react'
import { Node, Edge } from '@/src/types/database'

/**
 * ノードとエッジの構造的な変更を検出するカスタムフック
 * 位置の変更は無視し、ノードの追加・削除、エッジの接続関係の変更のみを検出
 */
export function useStableNodeReference(nodes: Node[], edges: Edge[], virtualNodes: any[]) {
  const structuralTimestampRef = useRef(Date.now())
  const previousNodesRef = useRef<Map<string, Node>>(new Map())
  const previousEdgesRef = useRef<Map<string, Edge>>(new Map())
  const previousVirtualNodesRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    let hasStructuralChange = false

    // ノードの構造的変更をチェック
    const currentNodeIds = new Set(nodes.map((n) => n.id))
    const previousNodeIds = new Set(previousNodesRef.current.keys())

    // ノードの追加・削除をチェック
    if (currentNodeIds.size !== previousNodeIds.size) {
      hasStructuralChange = true
    } else {
      // すべてのIDが同じか確認
      currentNodeIds.forEach((id) => {
        if (!previousNodeIds.has(id)) {
          hasStructuralChange = true
        }
      })
    }

    // エッジの構造的変更をチェック
    if (!hasStructuralChange) {
      const currentEdgeKeys = new Set(edges.map((e) => `${e.source_id}-${e.target_id}-${e.type}`))
      const previousEdgeKeys = new Set(
        Array.from(previousEdgesRef.current.values()).map(
          (e) => `${e.source_id}-${e.target_id}-${e.type}`
        )
      )

      if (currentEdgeKeys.size !== previousEdgeKeys.size) {
        hasStructuralChange = true
      } else {
        currentEdgeKeys.forEach((key) => {
          if (!previousEdgeKeys.has(key)) {
            hasStructuralChange = true
          }
        })
      }
    }

    // 仮想ノードの構造的変更をチェック
    if (!hasStructuralChange) {
      const currentVirtualNodeIds = new Set(virtualNodes.map((n) => n.id))
      const previousVirtualNodeIds = new Set(previousVirtualNodesRef.current.keys())

      if (currentVirtualNodeIds.size !== previousVirtualNodeIds.size) {
        hasStructuralChange = true
      } else {
        currentVirtualNodeIds.forEach((id) => {
          if (!previousVirtualNodeIds.has(id)) {
            hasStructuralChange = true
          }
        })
      }
    }

    // 構造的変更があった場合のみタイムスタンプを更新
    if (hasStructuralChange) {
      structuralTimestampRef.current = Date.now()

      // 現在の状態を保存
      previousNodesRef.current.clear()
      nodes.forEach((node) => previousNodesRef.current.set(node.id, node))

      previousEdgesRef.current.clear()
      edges.forEach((edge) => previousEdgesRef.current.set(edge.id, edge))

      previousVirtualNodesRef.current.clear()
      virtualNodes.forEach((vNode) => previousVirtualNodesRef.current.set(vNode.id, vNode))
    }
  }, [nodes, edges, virtualNodes])

  return structuralTimestampRef.current
}
