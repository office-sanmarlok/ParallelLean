'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

/**
 * ノードの位置をデータベースに自動保存するフック
 * - 1分ごとに変更をバッチ保存
 */
export function useNodePositionPersist() {
  const { nodes } = useGraphStore()
  const supabase = createClient()
  const lastPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const dirtyNodesRef = useRef<Set<string>>(new Set())
  const saveIntervalRef = useRef<NodeJS.Timeout>()

  // 変更のあったノードをDBに保存
  const saveDirtyNodes = async () => {
    const dirtyNodeIds = Array.from(dirtyNodesRef.current)
    if (dirtyNodeIds.length === 0) return

    console.log(`Saving positions for ${dirtyNodeIds.length} nodes`)
    
    // バッチ更新用のPromise配列
    const updatePromises = dirtyNodeIds.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId)
      if (!node || !node.position) return null
      
      return supabase
        .from('nodes')
        .update({ position: lastPositionsRef.current[nodeId] })
        .eq('id', nodeId)
    }).filter(Boolean)

    // 並列実行
    const results = await Promise.all(updatePromises)
    
    // エラーチェック
    results.forEach((result, index) => {
      if (result?.error) {
        console.error(`Failed to save position for node ${dirtyNodeIds[index]}:`, result.error)
      }
    })

    // 保存完了後にクリア
    dirtyNodesRef.current.clear()
  }

  // ノードの位置変更を監視
  useEffect(() => {
    nodes.forEach((node) => {
      if (node.position && typeof node.position === 'object') {
        const pos = node.position as any
        const lastPos = lastPositionsRef.current[node.id]
        
        // 位置が変更されている場合
        if (!lastPos || lastPos.x !== pos.x || lastPos.y !== pos.y) {
          lastPositionsRef.current[node.id] = { x: pos.x, y: pos.y }
          dirtyNodesRef.current.add(node.id)
        }
      }
    })
  }, [nodes])

  // 1分ごとの定期保存
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      saveDirtyNodes()
    }, 60000) // 1分

    // クリーンアップ
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
      }
      // アンマウント時に未保存の変更を保存
      saveDirtyNodes()
    }
  }, [])
}