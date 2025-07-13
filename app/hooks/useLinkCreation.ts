'use client'

import { useEffect } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

export function useLinkCreation() {
  const { selectedNode, linkingMode, linkingSource, setLinkingMode, setLinkingSource, addEdge } =
    useGraphStore()

  const supabase = createClient()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + L でリンク作成モード開始
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()

        if (selectedNode && !linkingMode) {
          setLinkingMode(true)
          setLinkingSource(selectedNode)
        }
      }

      // Escapeでリンク作成モードキャンセル
      if (e.key === 'Escape' && linkingMode) {
        setLinkingMode(false)
        setLinkingSource(null)
      }

      // Enterでリンク作成確定
      if (e.key === 'Enter' && linkingMode && linkingSource && selectedNode) {
        if (selectedNode.id !== linkingSource.id) {
          createLink()
        }
      }
    }

    const createLink = async () => {
      if (!linkingSource || !selectedNode) return

      try {
        const { data: newEdge, error } = await supabase
          .from('edges')
          .insert({
            source_id: linkingSource.id,
            target_id: selectedNode.id,
            type: 'link',
            is_branch: false,
            is_merge: false,
          })
          .select()
          .single()

        if (error) throw error

        if (newEdge) {
          addEdge(newEdge)
        }

        // リンクモードをリセット
        setLinkingMode(false)
        setLinkingSource(null)
      } catch (error) {
        console.error('Failed to create link:', error)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedNode,
    linkingMode,
    linkingSource,
    setLinkingMode,
    setLinkingSource,
    addEdge,
    supabase,
  ])
}
