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

  // Show only when Improvement node is selected
  if (!selectedNode || selectedNode.type !== 'improvement' || selectedNode.area !== 'learn') {
    return null
  }

  const handleDecision = async () => {
    if (!decision || !decisionReason.trim()) return

    try {
      // Save decision content to node metadata
      await supabase
        .from('nodes')
        .update({
          metadata: {
            ...((selectedNode.metadata as any) || {}),
            decision: decision,
            decision_reason: decisionReason,
            decision_date: new Date().toISOString(),
          },
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
    // Generate new Proposal from improvement plan
    const improvementPosition =
      typeof selectedNode.position === 'object' && selectedNode.position !== null
        ? (selectedNode.position as any)
        : { x: 500, y: 1600 }

    const { data: newProposal, error } = await supabase
      .from('nodes')
      .insert({
        type: 'proposal',
        area: 'idea_stock',
        title: `Improved: ${selectedNode.title}`,
        content: `Improvement Reason: ${decisionReason}`,
        position: {
          x: improvementPosition.x + 200,
          y: 400, // Return to IdeaStock area
        },
        size: 80,
        metadata: {
          improved_from: selectedNode.id,
          improvement_reason: decisionReason,
        },
      })
      .select()
      .single()

    if (!error && newProposal) {
      addNode(newProposal)

      // Generate new project line
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

      // Project line is managed by separate process

      // Create edge from Improvement to Proposal
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
    // Create pivot record
    const improvementPosition =
      typeof selectedNode.position === 'object' && selectedNode.position !== null
        ? (selectedNode.position as any)
        : { x: 500, y: 1600 }

    const { data: pivotNode, error } = await supabase
      .from('nodes')
      .insert({
        type: 'kb_tag',
        area: 'knowledge_base',
        title: `Pivoted: ${selectedNode.title.substring(0, 20)}...`,
        position: {
          x: Math.random() * 1000 + 500,
          y: Math.random() * 300 + 100,
        },
        size: 60,
        metadata: {
          pivot_from: selectedNode.id,
          pivot_reason: decisionReason,
          pivot_date: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (!error && pivotNode) {
      addNode(pivotNode)

      // Create edge from Improvement to KBTag (save as knowledge)
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
        Improvement Proposal: {selectedNode.title}
      </h3>

      {!showDecision ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on this improvement proposal, please select the next action.
          </p>
          <button
            onClick={() => setShowDecision(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Make Decision
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
                Rebuild (Create improved version)
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
                Pivot (Save as knowledge)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Decision Reason
            </label>
            <textarea
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="Enter the reason for this decision..."
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
              Confirm Decision
            </button>
            <button
              onClick={() => {
                setShowDecision(false)
                setDecision(null)
                setDecisionReason('')
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
