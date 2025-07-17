'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

/**
 * ノードの位置をデータベースに自動保存するフック
 * ページ離脱時と1分ごとに保存
 */
export function useNodePositionPersist() {
  const { nodes } = useGraphStore()
  const supabase = createClient()
  const pendingUpdatesRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const isSavingRef = useRef(false)

  // 保存処理
  const savePositions = useCallback(async () => {
    if (isSavingRef.current || pendingUpdatesRef.current.size === 0) return
    
    console.log(`[NodePositionPersist] 保存開始: ${pendingUpdatesRef.current.size}個のノード位置を保存`)
    
    isSavingRef.current = true
    const updates = Array.from(pendingUpdatesRef.current.entries())
    
    try {
      // バッチ更新用のPromiseを作成
      const promises = updates.map(([nodeId, position]) => 
        supabase
          .from('nodes')
          .update({ position })
          .eq('id', nodeId)
      )
      
      // すべての更新を並列実行
      const results = await Promise.all(promises)
      
      // エラーチェック
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Failed to save position for node ${updates[index][0]}:`, result.error)
        }
      })
      
      // 成功した更新をクリア
      pendingUpdatesRef.current.clear()
      console.log('[NodePositionPersist] 保存完了')
    } catch (error) {
      console.error('Failed to save node positions:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [supabase])

  // ノードの位置変更を監視（保存はしない）
  useEffect(() => {
    nodes.forEach((node) => {
      if (node.position && typeof node.position === 'object') {
        const pos = node.position as any
        const currentSaved = pendingUpdatesRef.current.get(node.id)
        
        // 位置が変更されている場合は保留リストに追加
        if (!currentSaved || currentSaved.x !== pos.x || currentSaved.y !== pos.y) {
          pendingUpdatesRef.current.set(node.id, { x: pos.x, y: pos.y })
        }
      }
    })
  }, [nodes])

  // 1分ごとの定期保存
  useEffect(() => {
    const interval = setInterval(savePositions, 60000) // 1分 = 60000ms
    return () => clearInterval(interval)
  }, [savePositions])

  // ページ離脱時の保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingUpdatesRef.current.size > 0) {
        // 同期的な保存を試みる（ブラウザによっては動作しない可能性がある）
        savePositions()
        
        // 念のため警告を表示（保存が間に合わない可能性がある場合）
        e.preventDefault()
        e.returnValue = '未保存の変更があります。このまま離れますか？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [savePositions])

  // visibility change時の保存（バックグラウンドタブになった時）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        savePositions()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [savePositions])
}