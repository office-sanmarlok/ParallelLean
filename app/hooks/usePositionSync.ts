'use client'

import { useRef, useCallback } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import type { Tables } from '@/src/types/database.generated'

type Node = Tables<'nodes'>

interface PositionUpdate {
  nodeId: string
  position: { x: number; y: number }
  timestamp: number
}

/**
 * ノードの位置更新をバッチ処理し、データベースへの保存を最適化するフック
 */
export function usePositionSync() {
  const pendingUpdatesRef = useRef<Map<string, PositionUpdate>>(new Map())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // バッチ更新を実行
  const flushUpdates = useCallback(async () => {
    const updates = Array.from(pendingUpdatesRef.current.values())
    if (updates.length === 0) return

    // 仮想ノード以外の更新のみをデータベースに保存
    const dbUpdates = updates
      .filter((update) => !update.nodeId.startsWith('virtual-'))
      .map((update) => ({
        id: update.nodeId,
        position: update.position,
      }))

    if (dbUpdates.length > 0) {
      try {
        // バッチ更新（複数のノードを一度に更新）
        const promises = dbUpdates.map((update) =>
          supabase.from('nodes').update({ position: update.position }).eq('id', update.id)
        )

        await Promise.all(promises)
      } catch (error) {
        console.error('Failed to sync positions:', error)
      }
    }

    pendingUpdatesRef.current.clear()
  }, [supabase])

  // 位置更新をキューに追加
  const queuePositionUpdate = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      pendingUpdatesRef.current.set(nodeId, {
        nodeId,
        position,
        timestamp: Date.now(),
      })

      // 既存のタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 500ms後にバッチ更新を実行
      timeoutRef.current = setTimeout(() => {
        flushUpdates()
      }, 500)
    },
    [flushUpdates]
  )

  // 即座に更新を実行（シミュレーション終了時など）
  const syncImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    flushUpdates()
  }, [flushUpdates])

  return {
    queuePositionUpdate,
    syncImmediately,
  }
}
