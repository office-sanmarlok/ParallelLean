'use client'

import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { createClient } from '@/app/lib/supabase/client'
import type { Node, Edge } from '@/src/types/database'
import { extractTagsFromContent } from '@/app/lib/graph/tagExtractor'
import { useGraphStore } from '@/app/stores/graphStore'

interface MDEditorProps {
  node: Node | null
  onClose: () => void
}

export function MDEditor({ node, onClose }: MDEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const supabase = createClient()
  const { updateNode, nodes, edges, addNode, addEdge, removeEdge, refreshData } = useGraphStore()

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content || '')
      // タグを取得
      loadTags()
    }
  }, [node])

  // 現在のタグを読み込む
  const loadTags = async () => {
    if (!node) return

    const tagEdges = edges.filter((e) => e.source_id === node.id && e.type === 'tag')
    const tagNodes = nodes.filter(
      (n) =>
        tagEdges.some((e) => e.target_id === n.id) && (n.type === 'kb_tag' || n.type === 'is_tag')
    )
    setTags(tagNodes.map((n) => n.title))
  }

  // タイトルの保存
  const saveTitle = async () => {
    if (!node || title === node.title) return

    setIsSaving(true)
    const { error } = await supabase.from('nodes').update({ title }).eq('id', node.id)

    if (!error) {
      updateNode(node.id, { title })
      setLastSaved(new Date())
    }
    setIsSaving(false)
    setIsEditingTitle(false)
  }

  // タグを追加
  const addTag = async () => {
    if (!node || !newTag.trim()) return

    const tagType = node.area === 'knowledge_base' ? 'kb_tag' : 'is_tag'

    // 既存のタグを確認
    const existingTag = nodes.find(
      (n) => n.type === tagType && n.area === node.area && n.title === newTag.trim()
    )

    let tagNode

    if (existingTag) {
      // 既存のタグを使用
      tagNode = existingTag
    } else {
      // 新しいタグノードを作成
      const { data: newTagNode } = await supabase
        .from('nodes')
        .insert({
          type: tagType,
          area: node.area,
          title: newTag.trim(),
          position: {
            x:
              (typeof node.position === 'object' && node.position !== null
                ? (node.position as any).x
                : 0) + 150,
            y:
              (typeof node.position === 'object' && node.position !== null
                ? (node.position as any).y
                : 0) + 50,
          },
        })
        .select()
        .single()

      if (!newTagNode) return
      tagNode = newTagNode

      // ストアに追加
      addNode(tagNode)
    }

    // エッジが既に存在するか確認
    const existingEdge = edges.find(
      (e) => e.source_id === node.id && e.target_id === tagNode.id && e.type === 'tag'
    )

    if (!existingEdge) {
      // エッジを作成
      const { data: newEdge } = await supabase
        .from('edges')
        .insert({
          source_id: node.id,
          target_id: tagNode.id,
          type: 'tag',
          is_branch: false,
          is_merge: false,
        })
        .select()
        .single()

      if (newEdge) {
        // ストアに追加
        addEdge(newEdge)
      }
    }

    setTags([...tags, newTag.trim()])
    setNewTag('')
  }

  // タグを削除
  const removeTag = async (tagToRemove: string) => {
    if (!node) return

    const tagType = node.area === 'knowledge_base' ? 'kb_tag' : 'is_tag'
    const tagNode = nodes.find((n) => n.type === tagType && n.title === tagToRemove)

    if (tagNode) {
      // エッジを削除
      const edge = edges.find(
        (e) => e.source_id === node.id && e.target_id === tagNode.id && e.type === 'tag'
      )

      if (edge) {
        await supabase.from('edges').delete().eq('id', edge.id)

        // ストアから削除
        removeEdge(edge.id)

        setTags(tags.filter((t) => t !== tagToRemove))
      }
    }
  }

  // 自動保存（1秒後）
  useEffect(() => {
    if (!node) return

    const timer = setTimeout(async () => {
      if (content !== node.content) {
        setIsSaving(true)

        // ノードの内容を更新
        const { error } = await supabase.from('nodes').update({ content }).eq('id', node.id)

        if (!error) {
          updateNode(node.id, { content })
          setLastSaved(new Date())

          // 自動タグ生成は無効化（手動管理のみ）
        }

        setIsSaving(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, node, supabase])

  if (!node) {
    return null
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* ヘッダー */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') {
                    setTitle(node.title)
                    setIsEditingTitle(false)
                  }
                }}
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  border: '2px solid #3b82f6',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  width: '100%',
                  outline: 'none',
                }}
                autoFocus
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111827',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {title}
              </h3>
            )}
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              {node.type === 'memo'
                ? 'メモ'
                : node.type === 'proposal'
                  ? '提案'
                  : node.type === 'research'
                    ? 'リサーチ'
                    : node.type === 'task'
                      ? 'タスク'
                      : node.type === 'mvp'
                        ? 'MVP'
                        : node.type === 'improvement'
                          ? '改善'
                          : node.type}{' '}
              • {node.area}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* タグセクション */}
        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '14px', color: '#6b7280' }}>タグ:</span>
            {tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    padding: '0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    marginLeft: '4px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTag()
              }}
              placeholder="新しいタグを追加..."
              style={{
                flex: 1,
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={addTag}
              style={{
                padding: '6px 16px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              追加
            </button>
          </div>
        </div>

        {/* 保存状態 */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isSaving && <span>保存中...</span>}
          {lastSaved && !isSaving && <span>最終保存: {lastSaved.toLocaleTimeString('ja-JP')}</span>}
        </div>
      </div>

      {/* エディタ */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={[markdown()]}
          onChange={(value) => setContent(value)}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
