'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useGraphStore } from '@/app/stores/graphStore'
import type { Node, Tables } from '@/src/types/database'

type TaskStatus = Tables<'nodes'>['task_status']

interface TaskStatusMenuProps {
  node: Node
}

export function TaskStatusMenu({ node }: TaskStatusMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const updateNode = useGraphStore((state) => state.updateNode)

  if (node.type !== 'task') return null

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('nodes')
        .update({ task_status: newStatus })
        .eq('id', node.id)

      if (!error) {
        // ストアを更新
        updateNode(node.id, { task_status: newStatus })
        setIsOpen(false)

        // 全タスク完了時のMVP自動生成をチェック
        checkForMVPGeneration()
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const checkForMVPGeneration = async () => {
    // 同じプロジェクトラインの全タスクをチェック
    const { nodes } = useGraphStore.getState()

    // このタスクのプロジェクトラインを見つける
    const { data: edges } = await supabase
      .from('edges')
      .select('*')
      .or(`source_id.eq.${node.id},target_id.eq.${node.id}`)

    if (!edges) return

    // プロジェクトラインに属する全タスクを収集
    const projectTasks: Node[] = []
    const visitedNodes = new Set<string>()
    const queue = [node.id]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      if (visitedNodes.has(currentId)) continue
      visitedNodes.add(currentId)

      const currentNode = nodes.find((n) => n.id === currentId)
      if (currentNode?.type === 'task') {
        projectTasks.push(currentNode)
      }

      // 接続されたノードを探す
      edges.forEach((edge) => {
        if (edge.source_id === currentId && !visitedNodes.has(edge.target_id)) {
          queue.push(edge.target_id)
        }
        if (edge.target_id === currentId && !visitedNodes.has(edge.source_id)) {
          queue.push(edge.source_id)
        }
      })
    }

    // 全タスクが完了しているかチェック
    const allCompleted = projectTasks.every((task) => task.task_status === 'completed')

    if (allCompleted && projectTasks.length > 0) {
      // MVP自動生成
      await generateMVP(projectTasks)
    }
  }

  const generateMVP = async (tasks: Node[]) => {
    // タスクの平均X座標を計算
    const avgX =
      tasks.reduce((sum, task) => {
        const pos =
          typeof task.position === 'object' && task.position !== null ? (task.position as any).x : 0
        return sum + pos
      }, 0) / tasks.length

    // MVPノードを作成
    const { data: mvpNode, error } = await supabase
      .from('nodes')
      .insert({
        type: 'mvp',
        area: 'measure',
        title: 'MVP - ' + new Date().toLocaleDateString('ja-JP'),
        position: {
          x: avgX,
          y: 1200, // Measureエリアの位置
        },
        size: 100,
      })
      .select()
      .single()

    if (!error && mvpNode) {
      // 全タスクからMVPへのエッジを作成
      for (const task of tasks) {
        await supabase.from('edges').insert({
          source_id: task.id,
          target_id: mvpNode.id,
          type: 'link',
          is_branch: false,
          is_merge: true, // 合流を示す
        })
      }

      // ストアに追加
      useGraphStore.getState().addNode(mvpNode)
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'incomplete':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return '完了'
      case 'pending':
        return '保留'
      case 'incomplete':
        return '未完了'
      default:
        return status || '未設定'
    }
  }

  return (
    <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 text-sm font-medium ${getStatusColor(node.task_status)}`}
      >
        {getStatusLabel(node.task_status)}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => updateTaskStatus('incomplete')}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
          >
            未完了
          </button>
          <button
            onClick={() => updateTaskStatus('pending')}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600"
          >
            保留
          </button>
          <button
            onClick={() => updateTaskStatus('completed')}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"
          >
            完了
          </button>
        </div>
      )}
    </div>
  )
}
