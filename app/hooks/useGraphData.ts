'use client'

import { useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useGraphStore } from '@/app/stores/graphStore'
import type { Node, Edge } from '@/src/types/database'

export function useGraphData() {
  const supabase = createClient()
  const { setNodes, setEdges, setIsLoading } = useGraphStore()

  useEffect(() => {
    // 初期データ取得
    const fetchGraphData = async () => {
      setIsLoading(true)

      try {
        // ノード取得
        const { data: nodes, error: nodesError } = await supabase
          .from('nodes')
          .select('*')
          .order('created_at', { ascending: true })

        if (nodesError) throw nodesError

        // エッジ取得
        const { data: edges, error: edgesError } = await supabase.from('edges').select('*')

        if (edgesError) throw edgesError

        // ストアに設定
        setNodes(nodes || [])
        setEdges(edges || [])
      } catch (error) {
        console.error('Error fetching graph data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGraphData()

    // リアルタイム購読設定
    const nodesChannel = supabase
      .channel('nodes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nodes',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            useGraphStore.getState().addNode(payload.new as Node)
          } else if (payload.eventType === 'UPDATE') {
            useGraphStore.getState().updateNode(payload.new.id, payload.new as Partial<Node>)
          } else if (payload.eventType === 'DELETE') {
            useGraphStore.getState().deleteNode(payload.old.id)
          }
        }
      )
      .subscribe()

    const edgesChannel = supabase
      .channel('edges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edges',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            useGraphStore.getState().addEdge(payload.new as Edge)
          } else if (payload.eventType === 'DELETE') {
            useGraphStore.getState().deleteEdge(payload.old.id)
          }
        }
      )
      .subscribe()

    // クリーンアップ
    return () => {
      nodesChannel.unsubscribe()
      edgesChannel.unsubscribe()
    }
  }, [supabase, setNodes, setEdges, setIsLoading])
}
