'use client'

import { useState } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

export function TagCreationTool() {
  const { selectedNode } = useGraphStore()
  const [isCreating, setIsCreating] = useState(false)
  const [tagName, setTagName] = useState('')
  const supabase = createClient()
  const { addNode, addEdge } = useGraphStore()

  // タグ作成可能なノードかチェック
  const canCreateTag =
    selectedNode &&
    ((selectedNode.type === 'memo' && selectedNode.area === 'knowledge_base') ||
      (selectedNode.type === 'proposal' && selectedNode.area === 'idea_stock'))

  const handleCreateTag = async () => {
    if (!selectedNode || !tagName.trim()) return

    try {
      // タグノードを作成
      const tagType = selectedNode.area === 'knowledge_base' ? 'kb_tag' : 'is_tag'
      const tagPosition = {
        x: (selectedNode.position as any).x + 150,
        y: (selectedNode.position as any).y,
      }

      const { data: newTag, error: tagError } = await supabase
        .from('nodes')
        .insert({
          type: tagType,
          area: selectedNode.area,
          title: tagName.trim(),
          content: '',
          position: tagPosition,
          size: 60,
        })
        .select()
        .single()

      if (tagError) throw tagError

      // エッジを作成
      const { data: newEdge, error: edgeError } = await supabase
        .from('edges')
        .insert({
          source_id: selectedNode.id,
          target_id: newTag.id,
          type: 'tag',
          is_branch: false,
          is_merge: false,
        })
        .select()
        .single()

      if (edgeError) throw edgeError

      // ストアに追加
      addNode(newTag)
      addEdge(newEdge)

      // リセット
      setTagName('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  if (!canCreateTag) return null

  if (isCreating) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          zIndex: 10,
          minWidth: '250px',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827',
            marginBottom: '8px',
          }}
        >
          新規タグ作成
        </h3>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="タグ名を入力"
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateTag()
            if (e.key === 'Escape') setIsCreating(false)
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCreateTag}
            disabled={!tagName.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: tagName.trim() ? '#10B981' : '#9CA3AF',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              cursor: tagName.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            作成
          </button>
          <button
            onClick={() => setIsCreating(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setIsCreating(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#8B5CF6',
          color: '#ffffff',
          borderRadius: '6px',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        タグを追加
      </button>
    </div>
  )
}
