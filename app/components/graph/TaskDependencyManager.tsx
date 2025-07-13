'use client'

import { useState } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'
import type { Node } from '@/src/types/database'

export function TaskDependencyManager() {
  const { selectedNode, nodes, addEdge } = useGraphStore()
  const [linkingMode, setLinkingMode] = useState(false)
  const [sourceTask, setSourceTask] = useState<Node | null>(null)
  const supabase = createClient()

  // Buildエリアのタスクのみ対象
  if (!selectedNode || selectedNode.type !== 'task' || selectedNode.area !== 'build') {
    return null
  }

  const startLinking = () => {
    setLinkingMode(true)
    setSourceTask(selectedNode)
  }

  const cancelLinking = () => {
    setLinkingMode(false)
    setSourceTask(null)
  }

  const createDependency = async (targetTask: Node) => {
    if (!sourceTask || !targetTask) return

    try {
      // 分岐または合流を判定
      const existingSourceEdges = await supabase
        .from('edges')
        .select('*')
        .eq('source_id', sourceTask.id)

      const existingTargetEdges = await supabase
        .from('edges')
        .select('*')
        .eq('target_id', targetTask.id)

      const isBranch = existingSourceEdges.data && existingSourceEdges.data.length > 0
      const isMerge = existingTargetEdges.data && existingTargetEdges.data.length > 0

      const { data: newEdge, error } = await supabase
        .from('edges')
        .insert({
          source_id: sourceTask.id,
          target_id: targetTask.id,
          type: 'dependency',
          is_branch: isBranch,
          is_merge: isMerge,
        })
        .select()
        .single()

      if (error) throw error

      if (newEdge) {
        addEdge(newEdge)
      }

      // 垂直配置を更新
      await updateVerticalLayout()

      setLinkingMode(false)
      setSourceTask(null)
    } catch (error) {
      console.error('Failed to create dependency:', error)
    }
  }

  const updateVerticalLayout = async () => {
    // Buildエリアのタスクを取得
    const buildTasks = nodes.filter((n) => n.type === 'task' && n.area === 'build')

    // 依存関係グラフを構築
    const { data: edges } = await supabase.from('edges').select('*').eq('type', 'dependency')

    if (!edges) return

    // トポロジカルソート用のデータ構造
    const graph = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    buildTasks.forEach((task) => {
      graph.set(task.id, [])
      inDegree.set(task.id, 0)
    })

    edges.forEach((edge) => {
      if (graph.has(edge.source_id) && graph.has(edge.target_id)) {
        graph.get(edge.source_id)!.push(edge.target_id)
        inDegree.set(edge.target_id, (inDegree.get(edge.target_id) || 0) + 1)
      }
    })

    // トポロジカルソート
    const queue: string[] = []
    const levels = new Map<string, number>()

    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
        levels.set(nodeId, 0)
      }
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentLevel = levels.get(current) || 0

      graph.get(current)?.forEach((neighbor) => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1)

        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor)
          levels.set(neighbor, currentLevel + 1)
        }
      })
    }

    // 各レベルのノードを垂直に配置
    const levelNodes = new Map<number, Node[]>()
    let maxLevel = 0

    buildTasks.forEach((task) => {
      const level = levels.get(task.id) || 0
      if (!levelNodes.has(level)) {
        levelNodes.set(level, [])
      }
      levelNodes.get(level)!.push(task)
      maxLevel = Math.max(maxLevel, level)
    })

    // Y座標を計算して更新
    const buildAreaStart = 800 // Buildエリアの開始Y座標
    const levelHeight = 150

    for (let level = 0; level <= maxLevel; level++) {
      const nodesAtLevel = levelNodes.get(level) || []
      const y = buildAreaStart + level * levelHeight

      for (const node of nodesAtLevel) {
        const position =
          typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 500, y: y }

        const newPosition = { x: position.x, y }

        await supabase.from('nodes').update({ position: newPosition }).eq('id', node.id)

        useGraphStore.getState().updateNode(node.id, { position: newPosition })
      }
    }
  }

  // 他のBuildエリアのタスクを取得
  const otherTasks = nodes.filter(
    (n) => n.type === 'task' && n.area === 'build' && n.id !== selectedNode.id
  )

  if (!linkingMode) {
    return (
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          タスク: {selectedNode.title}
        </h3>
        <button
          onClick={startLinking}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          依存関係を作成
        </button>
      </div>
    )
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        依存元: {sourceTask?.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        依存先のタスクを選択してください
      </p>

      {otherTasks.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {otherTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => createDependency(task)}
              className="block w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
            >
              {task.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">他のタスクがありません</p>
      )}

      <button
        onClick={cancelLinking}
        className="mt-3 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
      >
        キャンセル
      </button>
    </div>
  )
}
