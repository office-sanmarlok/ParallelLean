'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

/**
 * ノードの位置をデータベースに自動保存するフック
 */
export function useNodePositionPersist() {
  const { nodes } = useGraphStore()
  const supabase = createClient()
  const lastPositionsRef = useRef<Record<string, { x: number; y: number }>>({})

  // ノードの位置変更を監視
  useEffect(() => {
    nodes.forEach((node) => {
      if (node.position && typeof node.position === 'object') {
        const pos = node.position as any
        const lastPos = lastPositionsRef.current[node.id]
        
        // 位置が変更されている場合のみ保存
        if (!lastPos || lastPos.x !== pos.x || lastPos.y !== pos.y) {
          lastPositionsRef.current[node.id] = { x: pos.x, y: pos.y }
          
          // 即座に保存
          supabase
            .from('nodes')
            .update({ position: { x: pos.x, y: pos.y } })
            .eq('id', node.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to save node position:', error)
              }
            })
        }
      }
    })
  }, [nodes, supabase])
}