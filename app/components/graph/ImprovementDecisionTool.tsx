'use client'

import { useState } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'
import type { Node } from '@/src/types/database'

export function ImprovementDecisionTool() {
  const { selectedNode, nodes, edges, addNode, addEdge } = useGraphStore()
  const [showDecision, setShowDecision] = useState(false)
  const [decision, setDecision] = useState<'rebuild' | 'pivot' | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const supabase = createClient()

  // Improvementノードが選択されている場合のみ表示
  if (!selectedNode || selectedNode.type !== 'improvement' || selectedNode.area !== 'learn') {
    return null
  }

  const handleDecision = async () => {
    if (!decision || !decisionReason.trim()) return

    try {
      // 決定内容をノードのmetadataに保存
      await supabase
        .from('nodes')
        .update({
          metadata: {
            ...(selectedNode.metadata as any || {}),
            decision: decision,
            decision_reason: decisionReason,
            decision_date: new Date().toISOString()
          }
        })
        .eq('id', selectedNode.id)

      if (decision === 'rebuild') {
        await handleRebuild()
      } else {
        await handlePivot()
      }

      setShowDecision(false)
      setDecision(null)
      setDecisionReason('')
    } catch (error) {
      console.error('Failed to process decision:', error)
    }
  }

  const handleRebuild = async () => {
    // 改善案から新しいProposalを生成
    const improvementPosition = typeof selectedNode.position === 'object' && selectedNode.position !== null
      ? (selectedNode.position as any)
      : { x: 500, y: 1600 }

    const { data: newProposal, error } = await supabase
      .from('nodes')
      .insert({
        type: 'proposal',
        area: 'idea_stock',
        title: `改善版: ${selectedNode.title}`,
        content: `改善理由: ${decisionReason}`,
        position: {
          x: improvementPosition.x + 200,
          y: 400  // IdeaStockエリアに戻る
        },
        size: 80,
        metadata: {
          improved_from: selectedNode.id,
          improvement_reason: decisionReason
        }
      })
      .select()
      .single()

    if (!error && newProposal) {
      addNode(newProposal)

      // 新しいプロジェクトラインを生成
      const { data: newProjectLine } = await supabase
        .from('project_lines')
        .insert({
          proposal_id: newProposal.id,
          title: `${newProposal.title} - Project`,
          status: 'active',
          x_position: improvementPosition.x + 200,
        })
        .select()
        .single()

      if (newProjectLine) {
        useGraphStore.getState().addProjectLine(newProjectLine)
      }

      // ImprovementからProposalへのエッジを作成
      const { data: edge } = await supabase
        .from('edges')
        .insert({
          source_id: selectedNode.id,
          target_id: newProposal.id,
          type: 'rebuild',
          is_branch: false,
          is_merge: false,
        })
        .select()
        .single()

      if (edge) {
        addEdge(edge)
      }
    }
  }

  const handlePivot = async () => {
    // 撤退の記録を作成
    const improvementPosition = typeof selectedNode.position === 'object' && selectedNode.position !== null
      ? (selectedNode.position as any)
      : { x: 500, y: 1600 }

    const { data: pivotNode, error } = await supabase
      .from('nodes')
      .insert({
        type: 'kb_tag',
        area: 'knowledge_base',
        title: `撤退: ${selectedNode.title.substring(0, 20)}...`,
        position: {
          x: Math.random() * 1000 + 500,
          y: Math.random() * 300 + 100
        },
        size: 60,
        metadata: {
          pivot_from: selectedNode.id,
          pivot_reason: decisionReason,
          pivot_date: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (!error && pivotNode) {
      addNode(pivotNode)

      // ImprovementからKBTagへのエッジを作成（知見として保存）
      const { data: edge } = await supabase
        .from('edges')
        .insert({
          source_id: selectedNode.id,
          target_id: pivotNode.id,
          type: 'pivot',
          is_branch: false,
          is_merge: false,
        })
        .select()
        .single()

      if (edge) {
        addEdge(edge)
      }
    }
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        改善提案: {selectedNode.title}
      </h3>

      {!showDecision ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            この改善提案に基づいて、次のアクションを選択してください。
          </p>
          <button
            onClick={() => setShowDecision(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            決定を行う
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="decision"
                value="rebuild"
                checked={decision === 'rebuild'}
                onChange={() => setDecision('rebuild')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                再構築（改善版を作成）
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="decision"
                value="pivot"
                checked={decision === 'pivot'}
                onChange={() => setDecision('pivot')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                撤退（知見として保存）
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              決定理由
            </label>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="この決定に至った理由を記入..."
              rows={3}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDecision}
              disabled={!decision || !decisionReason.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              決定を確定
            </button>
            <button
              onClick={() => {
                setShowDecision(false)
                setDecision(null)
                setDecisionReason('')
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}