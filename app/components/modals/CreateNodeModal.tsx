'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useGraphStore } from '@/app/stores/graphStore'
import { ModalPortal } from './ModalPortal'
import type { NodeType, AreaType } from '@/src/types/database'

interface CreateNodeModalProps {
  isOpen: boolean
  onClose: () => void
  area: AreaType
  position?: { x: number; y: number }
}

const AREA_NODE_TYPES: Record<AreaType, NodeType[]> = {
  knowledge_base: ['memo', 'kb_tag'],
  idea_stock: ['proposal', 'research', 'is_tag'],
  build: ['task'],
  measure: ['mvp', 'dashboard'],
  learn: ['improvement'],
}

export function CreateNodeModal({ isOpen, onClose, area, position }: CreateNodeModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nodeType, setNodeType] = useState<NodeType>(AREA_NODE_TYPES[area][0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const addNode = useGraphStore((state) => state.addNode)

  // エリアが変わったらノードタイプもリセット
  useEffect(() => {
    setNodeType(AREA_NODE_TYPES[area][0])
  }, [area])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ノードサイズを計算（タイプによって変える）
      const nodeSize = nodeType.includes('tag') ? 60 : 80

      const { data: newNode, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          type: nodeType,
          area,
          title: title.trim(),
          content,
          position: position || { x: 500, y: 300 },
          size: nodeSize,
          task_status: nodeType === 'task' ? 'incomplete' : null,
        })
        .select()
        .single()

      if (nodeError) throw nodeError

      // ストアに追加
      addNode(newNode)

      setTitle('')
      setContent('')
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <ModalPortal>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* オーバーレイ */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={onClose}
        />

        {/* モーダル本体 */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '448px',
            width: '100%',
            margin: '0 16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 60,
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            Create New Node - {area}
          </h3>

          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            {/* ノードタイプ選択 */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="type"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Type
              </label>
              <select
                id="type"
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as NodeType)}
                style={{
                  marginTop: '4px',
                  display: 'block',
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  padding: '8px 12px',
                  fontSize: '14px',
                }}
              >
                {AREA_NODE_TYPES[area].map((type) => (
                  <option key={type} value={type}>
                    {getNodeTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px',
                }}
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getPlaceholder(nodeType)}
                style={{
                  marginTop: '4px',
                  display: 'block',
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  padding: '8px 12px',
                  fontSize: '14px',
                }}
                autoFocus
              />
            </div>

            {/* タグ以外のノードには内容フィールドを表示 */}
            {!nodeType.includes('tag') && (
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="content"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px',
                  }}
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    padding: '8px 12px',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#FEE2E2',
                  padding: '12px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: '#991B1B',
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  borderRadius: '6px',
                  backgroundColor: isLoading ? '#9CA3AF' : '#4F46E5',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#FFFFFF',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  )
}

function getNodeTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    memo: 'Memo',
    kb_tag: 'KB Tag',
    proposal: 'Proposal',
    research: 'Research',
    is_tag: 'IS Tag',
    task: 'Task',
    mvp: 'MVP',
    dashboard: 'Dashboard',
    improvement: 'Improvement',
  }
  return labels[type] || type
}

function getPlaceholder(type: NodeType): string {
  const placeholders: Record<NodeType, string> = {
    memo: 'Record ideas and insights...',
    kb_tag: 'Tag name...',
    proposal: 'Proposal title...',
    research: 'Research topic...',
    is_tag: 'Tag name...',
    task: 'Task name...',
    mvp: 'MVP name...',
    dashboard: 'Dashboard name...',
    improvement: 'Improvement details...',
  }
  return placeholders[type] || ''
}
