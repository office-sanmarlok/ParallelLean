'use client'

import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'

export function LinkCreationTool() {
  const { selectedNode, linkingMode, linkingSource, setLinkingMode, setLinkingSource, addEdge } =
    useGraphStore()
  const supabase = createClient()

  // リンク作成開始
  const startLinking = () => {
    if (selectedNode && selectedNode.type === 'memo') {
      setLinkingMode(true)
      setLinkingSource(selectedNode)
    }
  }

  // リンク作成キャンセル
  const cancelLinking = () => {
    setLinkingMode(false)
    setLinkingSource(null)
  }

  // リンク作成
  const createLink = async (targetNode: typeof selectedNode) => {
    if (!linkingSource || !targetNode) return

    try {
      // エッジタイプを決定
      let edgeType: 'link' | 'tag' = 'link'

      // KBTagとMemoの接続は特別なタイプ
      if (
        (linkingSource.type === 'kb_tag' && targetNode.type === 'memo') ||
        (linkingSource.type === 'memo' && targetNode.type === 'kb_tag')
      ) {
        edgeType = 'tag'
      }

      // ISTagとProposalの接続も特別なタイプ
      if (
        (linkingSource.type === 'is_tag' && targetNode.type === 'proposal') ||
        (linkingSource.type === 'proposal' && targetNode.type === 'is_tag')
      ) {
        edgeType = 'tag'
      }

      const { data: newEdge, error } = await supabase
        .from('edges')
        .insert({
          source_id: linkingSource.id,
          target_id: targetNode.id,
          type: edgeType,
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

  // リンク作成可能なノードタイプを判定
  const canCreateLink = (node: typeof selectedNode) => {
    if (!node) return false
    // KnowledgeBaseエリアのノードはすべてリンク可能
    if (node.area === 'knowledge_base') return true
    // その他のエリアでは特定のタイプのみ
    return ['proposal', 'research', 'task', 'mvp', 'improvement'].includes(node.type)
  }

  // リンク作成ボタンを表示
  if (selectedNode && canCreateLink(selectedNode) && !linkingMode) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          zIndex: 10,
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
          選択中: {selectedNode.title}
        </h3>
        <button
          onClick={() => {
            setLinkingMode(true)
            setLinkingSource(selectedNode)
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4F46E5',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          他のノードへリンク作成
        </button>
      </div>
    )
  }

  // リンクモード中の表示
  if (linkingMode && linkingSource) {
    const canLinkTo =
      selectedNode && selectedNode.id !== linkingSource.id && canCreateLink(selectedNode)

    return (
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          zIndex: 10,
          minWidth: '300px',
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
          リンク元: {linkingSource.title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '12px',
          }}
        >
          リンク先のノードを選択してください
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canLinkTo && (
            <button
              onClick={() => createLink(selectedNode)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10B981',
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              「{selectedNode.title}」へリンク
            </button>
          )}
          <button
            onClick={cancelLinking}
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

  return null
}
