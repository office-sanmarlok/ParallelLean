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
    // 現在の状態を保存（ロールバック用）
    const oldStatus = node.task_status

    // 楽観的更新：即座にUIを更新
    updateNode(node.id, { task_status: newStatus })
    setIsOpen(false)

    // MVP生成チェックを先に実行（楽観的）
    if (newStatus === 'completed') {
      checkForMVPGeneration()
    }

    try {
      // バックグラウンドでデータベースを更新
      const { error } = await supabase
        .from('nodes')
        .update({ task_status: newStatus })
        .eq('id', node.id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to update task status:', error)
      
      // エラー時はロールバック
      updateNode(node.id, { task_status: oldStatus })
      setIsOpen(false)
    }
  }

  const checkForMVPGeneration = async () => {
    // Check all tasks in the same project line
    const { nodes } = useGraphStore.getState()

    // Find the project line for this task
    const { data: edges } = await supabase
      .from('edges')
      .select('*')
      .or(`source_id.eq.${node.id},target_id.eq.${node.id}`)

    if (!edges) return

    // Collect all tasks belonging to the project line
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

      // Find connected nodes
      edges.forEach((edge) => {
        if (edge.source_id === currentId && !visitedNodes.has(edge.target_id)) {
          queue.push(edge.target_id)
        }
        if (edge.target_id === currentId && !visitedNodes.has(edge.source_id)) {
          queue.push(edge.source_id)
        }
      })
    }

    // Check if all tasks are completed
    const allCompleted = projectTasks.every((task) => task.task_status === 'completed')

    if (allCompleted && projectTasks.length > 0) {
      // Automatic MVP generation
      await generateMVP(projectTasks)
    }
  }

  const generateMVP = async (tasks: Node[]) => {
    // Calculate average X coordinate of tasks
    const avgX =
      tasks.reduce((sum, task) => {
        const pos =
          typeof task.position === 'object' && task.position !== null ? (task.position as any).x : 0
        return sum + pos
      }, 0) / tasks.length

    // Create MVP node
    const { data: mvpNode, error } = await supabase
      .from('nodes')
      .insert({
        type: 'mvp',
        area: 'measure',
        title: 'MVP - ' + new Date().toLocaleDateString('en-US'),
        position: {
          x: avgX,
          y: 1200, // Position in Measure area
        },
        size: 100,
      })
      .select()
      .single()

    if (!error && mvpNode) {
      // Create edges from all tasks to MVP
      for (const task of tasks) {
        await supabase.from('edges').insert({
          source_id: task.id,
          target_id: mvpNode.id,
          type: 'link',
          is_branch: false,
          is_merge: true, // Indicates merge
        })
      }

      // Add to store
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
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'incomplete':
        return 'Incomplete'
      default:
        return status || 'Not Set'
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
            Incomplete
          </button>
          <button
            onClick={() => updateTaskStatus('pending')}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600"
          >
            Pending
          </button>
          <button
            onClick={() => updateTaskStatus('completed')}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"
          >
            Completed
          </button>
        </div>
      )}
    </div>
  )
}
