'use client'

import { useRef, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useGraphStore } from '@/app/stores/graphStore'
import type { Node } from '@/src/types/database'

interface InlineTagCreatorProps {
  parentNode: Node
  onClose: () => void
  onCreated: () => void
}

export function InlineTagCreator({ parentNode, onClose, onCreated }: InlineTagCreatorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { addNode, addEdge } = useGraphStore()

  const position =
    typeof parentNode.position === 'object' && parentNode.position !== null
      ? (parentNode.position as any)
      : { x: 0, y: 0 }

  // Canvasの変換を取得（グローバルに保存されているStageを使用）
  const stage = (window as any).__graphStage
  let screenX = position.x + 100
  let screenY = position.y

  if (stage) {
    // Canvas座標からスクリーン座標に変換
    const stagePosition = stage.position()
    const stageScale = stage.scale()
    screenX = (position.x + 100) * stageScale.x + stagePosition.x
    screenY = position.y * stageScale.y + stagePosition.y
  }

  // 画面内に収まるように調整
  const inputWidth = 200 // 推定入力欄幅
  const inputHeight = 40 // 推定入力欄高さ
  const padding = 20 // 画面端からの余白
  
  // 右端チェック
  if (screenX + inputWidth / 2 > window.innerWidth - padding) {
    screenX = window.innerWidth - padding - inputWidth / 2
  }
  // 左端チェック
  if (screenX - inputWidth / 2 < padding) {
    screenX = padding + inputWidth / 2
  }
  // 下端チェック
  if (screenY + inputHeight / 2 > window.innerHeight - padding) {
    screenY = window.innerHeight - padding - inputHeight / 2
  }
  // 上端チェック（ヘッダーの高さを考慮）
  const headerHeight = 64
  if (screenY - inputHeight / 2 < headerHeight + padding) {
    screenY = headerHeight + padding + inputHeight / 2
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCreate = async (tagName: string) => {
    if (!tagName.trim()) return

    try {
      // タイプとエリアを決定（親ノードがProposalならISTag、それ以外はKBTag）
      const isProposal = parentNode.type === 'proposal'
      const tagType = isProposal ? 'is_tag' : 'kb_tag'
      const tagArea = isProposal ? 'idea_stock' : 'knowledge_base'

      // 既存のタグを確認
      const { data: existingTags } = await supabase
        .from('nodes')
        .select('*')
        .eq('type', tagType)
        .eq('area', tagArea)
        .eq('title', tagName.trim())
        .single()

      let tagNode

      if (existingTags) {
        // 既存のタグを使用
        tagNode = existingTags
      } else {
        // 新しいタグノードを作成
        const tagPosition = {
          x: position.x + 150,
          y: position.y,
        }

        const { data: newTag, error: tagError } = await supabase
          .from('nodes')
          .insert({
            type: tagType,
            area: tagArea,
            title: tagName.trim(),
            content: '',
            position: tagPosition,
          })
          .select()
          .single()

        if (tagError) throw tagError
        tagNode = newTag

        // 新しいノードの場合のみストアに追加
        addNode(tagNode)
      }

      // 既存のエッジを確認
      const { data: existingEdge } = await supabase
        .from('edges')
        .select('*')
        .eq('source_id', parentNode.id)
        .eq('target_id', tagNode.id)
        .eq('type', 'tag')
        .single()

      if (!existingEdge) {
        // エッジを作成
        const { data: newEdge, error: edgeError } = await supabase
          .from('edges')
          .insert({
            source_id: parentNode.id,
            target_id: tagNode.id,
            type: 'tag',
            is_branch: false,
            is_merge: false,
          })
          .select()
          .single()

        if (edgeError) throw edgeError

        // ストアに追加
        addEdge(newEdge)
      }

      onCreated()
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${screenX}px`,
        top: `${screenY}px`,
        zIndex: 100,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="タグ名を入力..."
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          border: '2px solid #4F46E5',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          minWidth: '180px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
          outline: 'none',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCreate(e.currentTarget.value)
          } else if (e.key === 'Escape') {
            onClose()
          }
        }}
        onBlur={onClose}
      />
    </div>
  )
}
