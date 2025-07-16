'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type Konva from 'konva'
import { Stage, Layer, Group, Rect } from 'react-konva'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'
import { getAreaBounds } from '@/app/lib/graph/layout'
import { GraphNode } from './GraphNode'
import { GraphEdge } from './GraphEdge'
import { AreaDividers } from './AreaDividers'
import { CreateNodeModal } from '../modals/CreateNodeModal'
import { InlineTagCreator } from '../modals/InlineTagCreator'
import { MDEditor } from '../editor/MDEditor'
import { TagCreationTool } from './TagCreationTool'
import { FloatingTagButton } from './FloatingTagButton'
import { TaskDependencyManager } from './TaskDependencyManager'
import { TaskStatusMenu } from './TaskStatusMenu'
import { MeasurementManager } from './MeasurementManager'
import { ImprovementDecisionTool } from './ImprovementDecisionTool'
import { ReportGenerator } from './ReportGenerator'
import { FloatingIndicator } from './FloatingIndicator'
import { MeasurementPeriodModal } from '../modals/MeasurementPeriodModal'
import type { Node, Edge, AreaType } from '@/src/types/database'
import { AREA_ORDER, AREA_HEIGHT_RATIOS } from '@/app/lib/graph/layout'
import { createButtonNodes } from '@/app/lib/graph/buttonNodes'
import { createVirtualNode } from '@/app/lib/graph/createVirtualNodes'
import { useUnifiedForceSimulation } from '@/app/hooks/useUnifiedForceSimulation'
import { useNodePositionPersist } from '@/app/hooks/useNodePositionPersist'

export function GraphCanvas() {
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    virtualNodes,
    setVirtualNodes,
    updateVirtualNode,
    deleteNode,
    addNode,
    addEdge,
    updateNode,
    removeEdge,
  } = useGraphStore()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createPosition, setCreatePosition] = useState<{ x: number; y: number } | undefined>()
  const [createArea, setCreateArea] = useState<AreaType>('knowledge_base')
  const [editorNode, setEditorNode] = useState<Node | null>(null)
  const [showTagButton, setShowTagButton] = useState<string | null>(null)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [isNodeDragging, setIsNodeDragging] = useState(false)
  const [newMemoPosition, setNewMemoPosition] = useState<{ x: number; y: number } | null>(null)
  const [measurementPeriodModal, setMeasurementPeriodModal] = useState<{
    isOpen: boolean
    mvpNodeId: string | null
  }>({ isOpen: false, mvpNodeId: null })
  const [isSimulationActive, setIsSimulationActive] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [taskStatusSelectionNode, setTaskStatusSelectionNode] = useState<string | null>(null)

  const supabase = createClient()

  // 統合Force Simulationを有効化（全エリア・全ノードタイプ対応）
  useUnifiedForceSimulation()
  
  // ノード位置の自動保存を有効化
  useNodePositionPersist()

  // ビューポートの計算
  const getViewport = () => {
    return {
      x: -position.x / scale,
      y: -position.y / scale,
      width: dimensions.width / scale,
      height: dimensions.height / scale,
    }
  }

  // ノードが可視かどうかを判定
  const isNodeVisible = (node: Node, viewport: ReturnType<typeof getViewport>) => {
    // positionオブジェクトから座標を取得
    const pos = node.position as { x: number; y: number } | null
    const nodeX = pos?.x || 0
    const nodeY = pos?.y || 0
    const nodeRadius = 60 // ノードの半径（最大サイズを考慮）

    return (
      nodeX + nodeRadius >= viewport.x &&
      nodeX - nodeRadius <= viewport.x + viewport.width &&
      nodeY + nodeRadius >= viewport.y &&
      nodeY - nodeRadius <= viewport.y + viewport.height
    )
  }

  // エッジが可視かどうかを判定
  const isEdgeVisible = (edge: Edge, nodes: Node[], viewport: ReturnType<typeof getViewport>) => {
    const sourceNode = nodes.find((n) => n.id === edge.source_id)
    const targetNode = nodes.find((n) => n.id === edge.target_id)
    
    if (!sourceNode || !targetNode) return false
    
    // 両端のノードのいずれかが可視なら、エッジも可視とする
    return isNodeVisible(sourceNode, viewport) || isNodeVisible(targetNode, viewport)
  }

  // 可視ノードとエッジのフィルタリング（メモ化）
  const { visibleNodes, visibleVirtualNodes, visibleEdges } = useMemo(() => {
    const viewport = getViewport()
    
    const visibleNodes = nodes.filter((node) => isNodeVisible(node, viewport))
    const visibleVirtualNodes = virtualNodes.filter((node) => isNodeVisible(node, viewport))
    const visibleEdges = edges.filter((edge) => isEdgeVisible(edge, nodes, viewport))
    
    return { visibleNodes, visibleVirtualNodes, visibleEdges }
  }, [nodes, virtualNodes, edges, position, scale, dimensions])

  // Memoノードを削除
  const handleDeleteMemo = async () => {
    if (!selectedNode || selectedNode.type !== 'memo') return

    // 楽観的更新：即座にUIから削除
    const deletedNodeId = selectedNode.id
    deleteNode(deletedNodeId)

    // UIをリセット
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', deletedNodeId)
      } catch (error) {
        console.error('Failed to delete from database:', error)
        // 必要に応じて復元処理を追加
      }
    })()
  }

  // プロジェクトを作成
  const handleCreateProject = async () => {
    if (!selectedNode || selectedNode.type !== 'memo') return

    try {
      // IdeaStockエリアにProposalノードを作成
      const proposalPosition = {
        x: Math.random() * 1000 + 200,
        y: 3000 * AREA_HEIGHT_RATIOS.knowledge_base + 200, // IdeaStockエリアの位置（KnowledgeBaseの下）
      }

      const { data: proposalNode, error } = await supabase
        .from('nodes')
        .insert({
          type: 'proposal',
          area: 'idea_stock',
          title: `${selectedNode.title} - Proposal`,
          content: `# ${selectedNode.title}\n\n## 概要\n${selectedNode.content || ''}\n\n## 提案内容\n\n## 期待される効果\n`,
          position: proposalPosition,
        })
        .select()
        .single()

      if (error) throw error

      // エッジを作成（MemoとProposalを接続）
      const { data: edge } = await supabase
        .from('edges')
        .insert({
          source_id: selectedNode.id,
          target_id: proposalNode.id,
          type: 'reference',
          // is_branch, is_mergeはDBのデフォルト値（false）を使用
        })
        .select()
        .single()

      // ストアに追加
      addNode(proposalNode)
      if (edge) addEdge(edge)

      // UIをリセット
      setVirtualNodes([])
      setShowTagButton(null)

      // 作成したProposalノードを選択
      setSelectedNode(proposalNode)
      setEditorNode(proposalNode)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  // 新規Memoノードを作成
  const handleCreateNewMemo = async () => {
    if (!newMemoPosition) return

    try {
      // 新しいMemoノードを作成
      const { data: newNode, error } = await supabase
        .from('nodes')
        .insert({
          type: 'memo',
          area: 'knowledge_base',
          title: '新しいメモ',
          content: '',
          position: newMemoPosition,
        })
        .select()
        .single()

      if (error) throw error

      // ストアに追加
      addNode(newNode)

      // 作成したノードを選択してエディタを開く
      setSelectedNode(newNode)
      setEditorNode(newNode)

      // ボタンノードをクリア
      setVirtualNodes([])
      setNewMemoPosition(null)
    } catch (error) {
      console.error('Failed to create memo:', error)
    }
  }

  // KBTagノードを削除
  const handleDeleteTag = async (tagId: string) => {
    const tagNode = nodes.find((n) => n.id === tagId && n.type === 'kb_tag')
    if (!tagNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(tagId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', tagId)
      } catch (error) {
        console.error('Failed to delete tag from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // Proposalノードを削除
  const handleDeleteProposal = async (proposalId: string) => {
    const proposalNode = nodes.find((n) => n.id === proposalId && n.type === 'proposal')
    if (!proposalNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(proposalId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', proposalId)
      } catch (error) {
        console.error('Failed to delete proposal from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // Researchノードを作成
  const handleCreateResearch = async (proposalId: string) => {
    const proposalNode = nodes.find((n) => n.id === proposalId && n.type === 'proposal')
    if (!proposalNode) return

    try {
      const proposalPos =
        typeof proposalNode.position === 'object' && proposalNode.position !== null
          ? (proposalNode.position as any)
          : { x: 0, y: 0 }

      // 新しいResearchノードを作成
      const { data: researchNode, error } = await supabase
        .from('nodes')
        .insert({
          type: 'research',
          area: 'idea_stock',
          title: `${proposalNode.title} - Research`,
          content: `# ${proposalNode.title} リサーチ\n\n## 調査内容\n\n## 参考資料\n`,
          position: {
            x: proposalPos.x + 200,
            y: proposalPos.y,
          },
        })
        .select()
        .single()

      if (error) throw error

      // エッジを作成
      const { data: edge } = await supabase
        .from('edges')
        .insert({
          source_id: proposalId,
          target_id: researchNode.id,
          type: 'reference',
          // is_branch, is_mergeはDBのデフォルト値（false）を使用
        })
        .select()
        .single()

      // ストアに追加
      addNode(researchNode)
      if (edge) addEdge(edge)

      // 作成したノードを選択
      setSelectedNode(researchNode)
      setEditorNode(researchNode)

      // ボタンノードをクリア
      setVirtualNodes([])
    } catch (error) {
      console.error('Failed to create research:', error)
    }
  }

  // Memoノードとリンク
  const handleLinkMemo = async (proposalId: string) => {
    const proposalNode = nodes.find((n) => n.id === proposalId && n.type === 'proposal')
    if (!proposalNode) return

    // リンク作成モードを開始
    useGraphStore.getState().setLinkingMode(true)
    useGraphStore.getState().setLinkingSource(proposalNode)

    // ボタンノードをクリア
    setVirtualNodes([])
    setShowTagButton(null)

  }

  // Taskノードを削除
  const handleDeleteTask = async (taskId: string) => {
    const taskNode = nodes.find((n) => n.id === taskId && n.type === 'task')
    if (!taskNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(taskId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', taskId)
      } catch (error) {
        console.error('Failed to delete task from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // 新しいTaskノードを追加
  const handleAddTask = async (parentTaskId: string) => {
    const parentTask = nodes.find((n) => n.id === parentTaskId && n.type === 'task')
    if (!parentTask) return

    const parentPos =
      typeof parentTask.position === 'object' && parentTask.position !== null
        ? (parentTask.position as any)
        : { x: 0, y: 0 }

    // 親タスクから出ているエッジの数を数える（複数の子タスクに対応）
    const childEdges = edges.filter((e) => e.source_id === parentTaskId)
    const childCount = childEdges.length

    // 新しいタスクの位置を計算（左右に広がる）
    const spacing = 150
    const offsetX =
      childCount % 2 === 0 ? spacing * (childCount / 2) : -spacing * Math.floor(childCount / 2)

    // 一時的なIDとタイムスタンプを生成
    const tempId = `temp-task-${Date.now()}`
    const now = new Date().toISOString()

    // 楽観的更新：即座に新しいタスクをUIに追加
    const tempTask: Node = {
      id: tempId,
      type: 'task',
      area: 'build',
      title: '新しいタスク',
      content: '',
      position: {
        x: parentPos.x + offsetX,
        y: parentPos.y + 150,
      },
      task_status: 'incomplete',
      metadata: {
        proposalId: (parentTask.metadata as any)?.proposalId,
      },
      created_at: now,
      updated_at: now,
      size: null,
      branch_id: null,
      color: null,
      inherited_kb_tags: null,
      project_line_id: null,
      vertical_order: null,
    }

    const tempEdge: Edge = {
      id: `temp-edge-${Date.now()}`,
      source_id: parentTaskId,
      target_id: tempId,
      type: 'flow',
      is_branch: false,
      is_merge: false,
      created_at: now,
      branch_from: null,
      merge_to: null,
    }

    // ストアに追加
    addNode(tempTask)
    addEdge(tempEdge)

    // 新しいタスクを選択
    setSelectedNode(tempTask)
    setEditorNode(tempTask)

    // ボタンノードを更新
    const buttons = createButtonNodes(tempTask, [...nodes, tempTask])
    setVirtualNodes(buttons)

    // バックグラウンドでDB作成
    ;(async () => {
      try {
        // 新しいタスクを作成
        const { data: newTask, error } = await supabase
          .from('nodes')
          .insert({
            type: 'task',
            area: 'build',
            title: '新しいタスク',
            content: '',
            position: {
              x: parentPos.x + offsetX,
              y: parentPos.y + 150,
            },
            task_status: 'incomplete',
            metadata: {
              proposalId: (parentTask.metadata as any)?.proposalId,
            },
          })
          .select()
          .single()

        if (error) throw error

        // エッジを作成（親タスクから新タスクへ）
        const { data: edge } = await supabase
          .from('edges')
          .insert({
            source_id: parentTaskId,
            target_id: newTask.id,
            type: 'flow',
          })
          .select()
          .single()

        // 一時的なIDを実際のIDに置き換え
        deleteNode(tempId)
        removeEdge(tempEdge.id)
        addNode(newTask)
        if (edge) addEdge(edge)

        // 選択中のノードも更新
        if (selectedNode?.id === tempId) {
          setSelectedNode(newTask)
          setEditorNode(newTask)
        }
      } catch (error) {
        console.error('Failed to add task to database:', error)
        // エラー時は一時的なノードを削除
        deleteNode(tempId)
        removeEdge(tempEdge.id)
        setSelectedNode(null)
        setEditorNode(null)
        setVirtualNodes([])
      }
    })()
  }

  // Taskノードの状態を変更（状態選択ノードを表示）
  const handleChangeTaskStatus = async (taskId: string) => {
    const taskNode = nodes.find((n) => n.id === taskId && n.type === 'task')
    if (!taskNode) return

    // 既に状態選択ノードが表示されている場合は閉じる
    if (taskStatusSelectionNode === taskId) {
      setTaskStatusSelectionNode(null)
      // 状態選択ノードを削除
      const statusNodes = virtualNodes.filter(node => node.id.startsWith(`virtual-status-option-${taskId}`))
      const otherNodes = virtualNodes.filter(node => !node.id.startsWith(`virtual-status-option-${taskId}`))
      setVirtualNodes(otherNodes)
      return
    }

    // 状態選択ノードを作成
    const taskPos = typeof taskNode.position === 'object' && taskNode.position !== null
      ? (taskNode.position as any)
      : { x: 0, y: 0 }

    const statusOptions = [
      { status: 'pending', label: '保留', color: '#F59E0B' },
      { status: 'incomplete', label: '未了', color: '#EF4444' },
      { status: 'completed', label: '完了', color: '#10B981' }
    ]

    const statusSelectionNodes = statusOptions.map((option, index) => {
      const angle = (index - 1) * 45 // -45°, 0°, 45°
      const distance = 80
      const x = taskPos.x + distance * Math.cos((angle - 90) * Math.PI / 180)
      const y = taskPos.y + distance * Math.sin((angle - 90) * Math.PI / 180)

      return createVirtualNode({
        id: `virtual-status-option-${taskId}-${option.status}`,
        type: 'status-option',
        area: taskNode.area,
        title: option.label,
        position: { x, y },
        metadata: {
          parentId: taskId,
          status: option.status,
          color: option.color,
          buttonType: 'select-status',
        },
      })
    })

    // 既存のバーチャルノードに状態選択ノードを追加
    setVirtualNodes([...virtualNodes, ...statusSelectionNodes])
    setTaskStatusSelectionNode(taskId)
  }

  // 実際に状態を変更する関数
  const handleSelectTaskStatus = async (taskId: string, newStatus: 'pending' | 'incomplete' | 'completed') => {
    const taskNode = nodes.find((n) => n.id === taskId && n.type === 'task')
    if (!taskNode) return

    try {
      // データベースを更新
      const { error } = await supabase
        .from('nodes')
        .update({ task_status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      // ストアを更新
      updateNode(taskId, {
        task_status: newStatus,
      })

      // 状態選択ノードを削除
      const statusNodes = virtualNodes.filter(node => !node.id.startsWith(`virtual-status-option-${taskId}`))
      setVirtualNodes(statusNodes)
      setTaskStatusSelectionNode(null)

      // 全Taskが完了しているかチェック
      if (newStatus === 'completed') {
        setTimeout(() => {
          checkAllTasksCompleted()
        }, 500)
      }
    } catch (error) {
      console.error('Failed to change task status:', error)
    }
  }

  // Taskノードを他のTaskノードとリンク
  const handleLinkTask = async (sourceTaskId: string) => {
    const sourceTask = nodes.find((n) => n.id === sourceTaskId && n.type === 'task')
    if (!sourceTask) return

    // リンク作成モードを開始
    useGraphStore.getState().setLinkingMode(true)
    useGraphStore.getState().setLinkingSource(sourceTask)

    // ボタンノードをクリア
    setVirtualNodes([])
    setShowTagButton(null)

  }

  // MVPノードを作成
  const handleCreateMVP = async (taskId: string) => {
    const taskNode = nodes.find((n) => n.id === taskId && n.type === 'task')
    if (!taskNode) return

    const taskPos =
      typeof taskNode.position === 'object' && taskNode.position !== null
        ? (taskNode.position as any)
        : { x: 0, y: 0 }

    // Measureエリアの境界を取得
    const measureBounds = getAreaBounds('measure')

    // 一時的なIDとタイムスタンプを生成
    const tempMvpId = `temp-mvp-${Date.now()}`
    const tempEdgeId = `temp-edge-${Date.now()}`
    const now = new Date().toISOString()

    // MVPノードの位置をY軸の中央に設定（X軸はタスクの位置を基準）
    const mvpPosition = {
      x: taskPos.x,
      y: (measureBounds.minY + measureBounds.maxY) / 2,
    }

    // 楽観的更新：即座にMVPノードをUIに追加
    const tempMvpNode: Node = {
      id: tempMvpId,
      type: 'mvp',
      area: 'measure',
      title: `${taskNode.title} - MVP`,
      content: `# ${taskNode.title} MVP\n\n## 概要\n\n## 主要機能\n\n## 成功指標\n`,
      position: mvpPosition,
      metadata: {
        sourceTaskId: taskId,
      },
      created_at: now,
      updated_at: now,
      size: null,
      branch_id: null,
      color: null,
      inherited_kb_tags: null,
      project_line_id: null,
      vertical_order: null,
      task_status: null,
    }

    const tempEdge: Edge = {
      id: tempEdgeId,
      source_id: taskId,
      target_id: tempMvpId,
      type: 'flow',
      is_branch: false,
      is_merge: false,
      created_at: now,
      branch_from: null,
      merge_to: null,
    }

    // ストアに追加
    addNode(tempMvpNode)
    addEdge(tempEdge)

    // MVPノードを選択してエディタを開く
    setSelectedNode(tempMvpNode)
    setEditorNode(tempMvpNode)

    // ボタンノードをクリア
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB作成
    ;(async () => {
      try {
        // MVPノードを作成
        const { data: mvpNode, error } = await supabase
          .from('nodes')
          .insert({
            type: 'mvp',
            area: 'measure',
            title: `${taskNode.title} - MVP`,
            content: `# ${taskNode.title} MVP\n\n## 概要\n\n## 主要機能\n\n## 成功指標\n`,
            position: mvpPosition,
            metadata: {
              sourceTaskId: taskId,
            },
          })
          .select()
          .single()

        if (error) throw error

        // エッジを作成（TaskからMVPへ）
        const { data: edge } = await supabase
          .from('edges')
          .insert({
            source_id: taskId,
            target_id: mvpNode.id,
            type: 'flow',
          })
          .select()
          .single()

        // 一時的なIDを実際のIDに置き換え
        deleteNode(tempMvpId)
        removeEdge(tempEdgeId)
        addNode(mvpNode)
        if (edge) addEdge(edge)

        // 選択中のノードも更新
        if (selectedNode?.id === tempMvpId) {
          setSelectedNode(mvpNode)
          setEditorNode(mvpNode)
        }

        // 全Taskが完了しているかチェック
        setTimeout(() => {
          console.log('Checking all tasks completed after MVP creation')
          checkAllTasksCompleted()
        }, 500) // ストア更新を待つ
      } catch (error) {
        console.error('Failed to create MVP in database:', error)
        // エラー時は一時的なノードを削除
        deleteNode(tempMvpId)
        removeEdge(tempEdgeId)
        setSelectedNode(null)
        setEditorNode(null)
        setVirtualNodes([])
      }
    })()
  }

  // 計測期間を強制終了してLearnエリアに移行
  const handleForceCompleteMeasurement = async (dashboardId: string) => {
    console.log('Force completing measurement for dashboard:', dashboardId)

    const dashboardNode = nodes.find((n) => n.id === dashboardId && n.type === 'dashboard')
    if (!dashboardNode) return

    // DashboardノードのmetadataからMVPノードとの関連を見つける
    const mvpEdge = edges.find((e) => e.target_id === dashboardId && e.type === 'reference')
    if (!mvpEdge) {
      console.error('No edge found connecting to dashboard')
      return
    }

    const mvpNode = nodes.find((n) => n.id === mvpEdge.source_id && n.type === 'mvp')
    if (!mvpNode) {
      console.error('MVP node not found')
      return
    }

    try {
      // Learnエリアの境界を取得
      const learnBounds = getAreaBounds('learn')

      // 位置を計算（垂直に並べる）
      const mvpPosition = mvpNode.position as { x: number; y: number } | null
      const dashboardPosition = dashboardNode.position as { x: number; y: number } | null

      const mvpNewPosition = {
        x: mvpPosition?.x || 0,
        y: learnBounds.minY + 200,
      }
      const dashboardNewPosition = {
        x: dashboardPosition?.x || 0,
        y: learnBounds.minY + 400,
      }

      // MVPノードをLearnエリアに更新
      const { error: mvpError } = await supabase
        .from('nodes')
        .update({
          area: 'learn',
          position: mvpNewPosition,
        })
        .eq('id', mvpNode.id)

      if (mvpError) throw mvpError

      // DashboardノードをLearnエリアに更新
      const { error: dashboardError } = await supabase
        .from('nodes')
        .update({
          area: 'learn',
          position: dashboardNewPosition,
        })
        .eq('id', dashboardNode.id)

      if (dashboardError) throw dashboardError

      // ストアを更新
      updateNode(mvpNode.id, {
        area: 'learn',
        position: mvpNewPosition,
      })
      updateNode(dashboardNode.id, {
        area: 'learn',
        position: dashboardNewPosition,
      })

      // ボタンをクリア
      setVirtualNodes([])
      setShowTagButton(null)

      // Improvementノードを作成
      const { data: improvementNode, error: improvementError } = await supabase
        .from('nodes')
        .insert({
          type: 'improvement',
          area: 'learn',
          title: `${mvpNode.title} - 改善点`,
          content: `# ${mvpNode.title} 改善点\n\n## 計測結果の分析\n\n## 改善提案\n\n## 次のステップ\n`,
          position: {
            x: mvpNewPosition.x - 200,
            y: mvpNewPosition.y + 100,
          },
        })
        .select()
        .single()

      if (improvementError) throw improvementError

      // MVPからImprovementへのエッジを作成
      const { data: improvementEdge } = await supabase
        .from('edges')
        .insert({
          source_id: mvpNode.id,
          target_id: improvementNode.id,
          type: 'improvement',
        })
        .select()
        .single()

      // ストアに追加
      addNode(improvementNode)
      if (improvementEdge) addEdge(improvementEdge)

      console.log('Successfully moved to Learn area and created improvement node')
    } catch (error) {
      console.error('Failed to complete measurement:', error)
    }
  }

  // Researchノードを削除
  const handleDeleteResearch = async (researchId: string) => {
    const researchNode = nodes.find((n) => n.id === researchId && n.type === 'research')
    if (!researchNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(researchId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', researchId)
      } catch (error) {
        console.error('Failed to delete research from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // ISTagノードを削除
  const handleDeleteISTag = async (isTagId: string) => {
    const isTagNode = nodes.find((n) => n.id === isTagId && n.type === 'is_tag')
    if (!isTagNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(isTagId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', isTagId)
      } catch (error) {
        console.error('Failed to delete IS tag from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // Improvementノードを削除
  const handleDeleteImprovement = async (improvementId: string) => {
    const improvementNode = nodes.find((n) => n.id === improvementId && n.type === 'improvement')
    if (!improvementNode) return

    // 楽観的更新：即座にUIから削除
    deleteNode(improvementId)
    setSelectedNode(null)
    setVirtualNodes([])
    setShowTagButton(null)

    // バックグラウンドでDB削除
    ;(async () => {
      try {
        await supabase.from('nodes').delete().eq('id', improvementId)
      } catch (error) {
        console.error('Failed to delete improvement from database:', error)
        // TODO: エラー時の復元処理
      }
    })()
  }

  // 全Taskノードが完了しているかチェック
  const checkAllTasksCompleted = () => {
    // 最新の状態を取得
    const currentNodes = useGraphStore.getState().nodes
    const allTasks = currentNodes.filter((n) => n.type === 'task' && n.area === 'build')
    console.log(
      'All tasks:',
      allTasks.map((t) => ({ id: t.id, status: t.task_status }))
    )
    const allCompleted =
      allTasks.length > 0 && allTasks.every((task) => task.task_status === 'completed')

    console.log('All tasks completed?', allCompleted)

    if (allCompleted) {
      // MVPノードが存在するかチェック
      const mvpNode = currentNodes.find((n) => n.type === 'mvp' && n.area === 'measure')
      console.log('MVP node found?', mvpNode)

      if (mvpNode) {
        // 既にDashboardノードが存在するかチェック
        const dashboardExists = currentNodes.some(
          (n) => n.type === 'dashboard' && n.area === 'measure'
        )
        console.log('Dashboard already exists?', dashboardExists)

        if (!dashboardExists) {
          console.log('Showing measurement period modal for MVP:', mvpNode.id)
          // 計測期間設定モーダルを表示
          setMeasurementPeriodModal({
            isOpen: true,
            mvpNodeId: mvpNode.id,
          })
          console.log('Modal state set:', { isOpen: true, mvpNodeId: mvpNode.id })
        }
      } else {
        console.log('No MVP node found in measure area')
      }
    }
  }

  // ウィンドウサイズに合わせてキャンバスをリサイズ
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64, // ヘッダーの高さを引く
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // ステージ参照をWindowオブジェクトに保存
  useEffect(() => {
    if (stageRef.current) {
      ;(window as any).__graphStage = stageRef.current
    }
    return () => {
      delete (window as any).__graphStage
    }
  }, [])

  // Force Simulationの状態を監視してアニメーションを制御
  useEffect(() => {
    const checkSimulationState = () => {
      // d3のシミュレーションインスタンスを取得（グローバルに保存されている場合）
      const simulation = (window as any).__d3Simulation
      if (simulation && simulation.alpha() < 0.001) {
        // シミュレーションが安定したらアニメーションを停止
        setIsSimulationActive(false)
      }
    }

    const interval = setInterval(checkSimulationState, 100)
    return () => clearInterval(interval)
  }, [])

  // ノードやエッジの変更を監視してアニメーションを再開
  useEffect(() => {
    setIsSimulationActive(true)
    setLastUpdateTime(Date.now())
    
    // 3秒後に自動的にアニメーションを停止（フォールバック）
    const timeout = setTimeout(() => {
      setIsSimulationActive(false)
    }, 3000)
    
    return () => clearTimeout(timeout)
  }, [nodes.length, edges.length, virtualNodes.length, isNodeDragging])

  // ビューポートの変更時も一時的にアニメーションを再開
  useEffect(() => {
    setIsSimulationActive(true)
    const timeout = setTimeout(() => {
      setIsSimulationActive(false)
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [position.x, position.y, scale])

  // アニメーションループ（最適化版）
  useEffect(() => {
    if (!isSimulationActive) return

    const animate = () => {
      if (layerRef.current) {
        layerRef.current.batchDraw()
      }
      if (isSimulationActive) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isSimulationActive])

  // ズーム機能
  // ProposalからBuildへの進行処理
  const handleProgressToBuild = async (proposalId: string) => {
    const proposal = nodes.find((n) => n.id === proposalId)
    if (!proposal) return

    // Buildエリアの境界を取得
    const buildBounds = getAreaBounds('build')

    // 初期のTaskノードを1つ作成
    const task = {
      id: crypto.randomUUID(),
      type: 'task' as const,
      area: 'build' as const,
      title: 'タスク 1',
      content: '',
      position: {
        x: 1000, // 中央に配置
        y: buildBounds.minY + 100,
      },
      task_status: 'pending' as const,
      metadata: {
        proposalId: proposalId, // Proposalとの関連を保存
      },
      // DB必須フィールドを追加
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      branch_id: null,
      color: null,
      project_line_id: null,
      inherited_kb_tags: null,
      size: null,
      vertical_order: null,
    }

    // エッジを作成（ProposalからTaskへ）
    const taskEdge = {
      id: crypto.randomUUID(),
      source_id: proposalId,
      target_id: task.id,
      type: 'flow' as const,
      // DB必須フィールドを追加
      is_branch: false,
      is_merge: false,
      created_at: new Date().toISOString(),
      branch_from: null,
      merge_to: null,
    }

    // 即座にストアに追加（UIに反映）
    addNode(task)
    addEdge(taskEdge)

    console.log('Created task edge:', taskEdge)
    console.log('Proposal node:', proposal)
    console.log('Task node:', task)

    // バックグラウンドでDB保存（RPC関数が利用できない場合の暫定実装）
    ;(async () => {
      try {
        // タスクをDBに保存
        const { error: nodesError } = await supabase.from('nodes').insert(task)
        if (nodesError) {
          console.error('Failed to save nodes:', nodesError)
          throw nodesError
        }

        // エッジをDBに保存
        const { error: edgesError } = await supabase.from('edges').insert(taskEdge)
        if (edgesError) {
          console.error('Failed to save edges:', edgesError)
          throw edgesError
        }

        console.log('Successfully progressed to build')
      } catch (error) {
        console.error('Failed to save to database:', error)
        // エラー時はUIから削除（ベストエフォート）
        deleteNode(task.id)
        // TODO: エッジ削除機能の実装が必要
      }
    })()
  }

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    const clampedScale = Math.max(0.1, Math.min(2, newScale))
    setScale(clampedScale)

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }
    setPosition(newPos)
  }

  // ドラッグでパン
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage
    setPosition({
      x: stage.x(),
      y: stage.y(),
    })
  }

  // ノードクリック
  const handleNodeClick = async (node: Node) => {
    const { linkingMode, linkingSource } = useGraphStore.getState()

    // リンク作成モード中の処理
    if (linkingMode && linkingSource) {
      // リンク先として有効なノードかチェック
      if (
        node.type === 'memo' &&
        node.area === 'knowledge_base' &&
        node.id !== linkingSource.id &&
        linkingSource.type === 'proposal'
      ) {
        try {
          // エッジを作成
          const { data: edge, error } = await supabase
            .from('edges')
            .insert({
              source_id: linkingSource.id,
              target_id: node.id,
              type: 'reference',
              // is_branch, is_mergeはDBのデフォルト値（false）を使用
            })
            .select()
            .single()

          if (error) throw error

          // ストアに追加
          addEdge(edge)

          // リンク作成モードを終了
          useGraphStore.getState().setLinkingMode(false)
          useGraphStore.getState().setLinkingSource(null)

        } catch (error) {
          console.error('Failed to create link:', error)
        }
      }
      // Taskノード同士のリンク作成
      else if (
        node.type === 'task' &&
        node.area === 'build' &&
        node.id !== linkingSource.id &&
        linkingSource.type === 'task'
      ) {
        try {
          // 既存のエッジをチェック（重複を防ぐ）
          const existingEdge = edges.find(
            (e) => e.source_id === linkingSource.id && e.target_id === node.id
          )

          if (existingEdge) {
            // リンク作成モードを終了
            useGraphStore.getState().setLinkingMode(false)
            useGraphStore.getState().setLinkingSource(null)
            return
          }

          // 楽観的更新：即座にエッジをUIに追加
          const tempEdgeId = `temp-edge-${Date.now()}`
          const now = new Date().toISOString()
          const tempEdge: Edge = {
            id: tempEdgeId,
            source_id: linkingSource.id,
            target_id: node.id,
            type: 'dependency',
            is_branch: false,
            is_merge: false,
            created_at: now,
            branch_from: null,
            merge_to: null,
          }
          
          // ストアに追加
          addEdge(tempEdge)

          // バックグラウンドでDB作成
          ;(async () => {
            try {
              const { data: edge, error } = await supabase
                .from('edges')
                .insert({
                  source_id: linkingSource.id,
                  target_id: node.id,
                  type: 'dependency',
                })
                .select()
                .single()

              if (error) throw error

              // 一時的なエッジを実際のエッジに置き換え
              removeEdge(tempEdgeId)
              addEdge(edge)
            } catch (error) {
              console.error('Failed to create dependency in database:', error)
              // エラー時は一時的なエッジを削除
              removeEdge(tempEdgeId)
            }
          })()

          // リンク作成モードを終了
          useGraphStore.getState().setLinkingMode(false)
          useGraphStore.getState().setLinkingSource(null)

          console.log(`タスク依存関係を作成しました: ${linkingSource.title} → ${node.title}`)
        } catch (error) {
          console.error('Failed to create task link:', error)
        }
      }
      return
    }

    // ボタンノードがクリックされた場合の処理
    if (node.id === 'virtual-tag-button') {
      setIsCreatingTag(true)
      return
    } else if (node.id === 'virtual-delete-button') {
      handleDeleteMemo()
      return
    } else if (node.id === 'virtual-project-button') {
      handleCreateProject()
      return
    } else if (node.id.startsWith('virtual-tag-delete-')) {
      const metadata = node.metadata as any
      handleDeleteTag(metadata?.parentId)
      return
    } else if (node.id === 'virtual-new-memo-button') {
      handleCreateNewMemo()
      return
    } else if (node.id.startsWith('virtual-proposal-delete-')) {
      const metadata = node.metadata as any
      handleDeleteProposal(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-proposal-tag-')) {
      const metadata = node.metadata as any
      setSelectedNode(nodes.find((n) => n.id === metadata?.parentId) || null)
      setIsCreatingTag(true)
      return
    } else if (node.id.startsWith('virtual-proposal-research-')) {
      const metadata = node.metadata as any
      handleCreateResearch(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-proposal-memo-')) {
      const metadata = node.metadata as any
      handleLinkMemo(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-proposal-build-')) {
      const metadata = node.metadata as any
      handleProgressToBuild(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-task-delete-')) {
      const metadata = node.metadata as any
      handleDeleteTask(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-task-add-')) {
      const metadata = node.metadata as any
      handleAddTask(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-task-status-')) {
      const metadata = node.metadata as any
      if (metadata?.parentId) {
        handleChangeTaskStatus(metadata.parentId)
      }
      return
    } else if (node.id.startsWith('virtual-status-option-')) {
      const metadata = node.metadata as any
      if (metadata?.parentId && metadata?.status) {
        handleSelectTaskStatus(metadata.parentId, metadata.status)
      }
      return
    } else if (node.id.startsWith('virtual-task-link-')) {
      const metadata = node.metadata as any
      handleLinkTask(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-task-mvp-')) {
      const metadata = node.metadata as any
      handleCreateMVP(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-dashboard-force-complete-')) {
      const metadata = node.metadata as any
      handleForceCompleteMeasurement(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-research-delete-')) {
      const metadata = node.metadata as any
      handleDeleteResearch(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-istag-delete-')) {
      const metadata = node.metadata as any
      handleDeleteISTag(metadata?.parentId)
      return
    } else if (node.id.startsWith('virtual-improvement-delete-')) {
      const metadata = node.metadata as any
      handleDeleteImprovement(metadata?.parentId)
      return
    }

    // 既に選択されているノード以外がクリックされた場合、ボタンノードを削除
    if (selectedNode && selectedNode.id !== node.id) {
      setShowTagButton(null)
      setVirtualNodes([])
    }

    setSelectedNode(node)

    // 各ノードタイプに応じてボタンを表示
    if ((node.type === 'memo' || node.type === 'kb_tag') && node.area === 'knowledge_base') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'proposal' && node.area === 'idea_stock') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'task' && node.area === 'build') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'dashboard' && node.area === 'measure') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'research' && node.area === 'idea_stock') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'is_tag' && node.area === 'idea_stock') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else if (node.type === 'improvement' && node.area === 'learn') {
      setShowTagButton(node.id)
      const buttons = createButtonNodes(node, nodes)
      setVirtualNodes(buttons)
    } else {
      setShowTagButton(null)
      setVirtualNodes([])
    }

    // シングルクリック時はエディタを開かない（ボタンノードの表示のみ）
  }

  // ノードダブルクリック
  const handleNodeDblClick = (node: Node) => {
    // エディタが必要なノードタイプの場合はエディタを開く
    const editableTypes = ['memo', 'proposal', 'research', 'task', 'mvp', 'improvement']
    if (editableTypes.includes(node.type)) {
      setEditorNode(node)
    }
    // KBTag、ISTagの場合は名前編集（TODO: 実装予定）
    else if (node.type === 'kb_tag' || node.type === 'is_tag') {
      // TODO: タグ名編集モーダルを表示
      console.log('Tag name editing not implemented yet')
    }
    // Dashboardの場合はダッシュボードを開く（TODO: 実装予定）
    else if (node.type === 'dashboard') {
      // TODO: ダッシュボード画面を表示
      console.log('Dashboard view not implemented yet')
    }
  }

  // 背景クリック
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // クリックされたのがステージ自体の場合のみ選択解除
    if (e.target === e.target.getStage()) {
      setSelectedNode(null)
      setShowTagButton(null)
      setVirtualNodes([])
      setIsCreatingTag(false)

      // リンク作成モードも解除
      if (useGraphStore.getState().linkingMode) {
        useGraphStore.getState().setLinkingMode(false)
        useGraphStore.getState().setLinkingSource(null)
      }
    }
  }

  // ダブルクリックで新規ノード作成ボタンを表示
  const handleStageDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 背景がダブルクリックされた場合のみ処理
    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // クリック位置からエリアを判定
    const relativeY = (pointer.y - position.y) / scale
    let area: AreaType = 'knowledge_base'
    let cumulativeHeight = 0
    
    // 各エリアの高さを累積して、クリック位置がどのエリアか判定
    for (const areaName of AREA_ORDER) {
      const areaHeight = 3000 * AREA_HEIGHT_RATIOS[areaName]
      if (relativeY < cumulativeHeight + areaHeight) {
        area = areaName
        break
      }
      cumulativeHeight += areaHeight
    }

    // KnowledgeBaseエリアの場合のみ新規作成ボタンを表示
    if (area === 'knowledge_base') {
      const clickPosition = {
        x: (pointer.x - position.x) / scale,
        y: relativeY,
      }

      setNewMemoPosition(clickPosition)

      // 新規作成ボタンノードを作成
      const newMemoButton = createVirtualNode({
        id: 'virtual-new-memo-button',
        type: 'new_memo_button' as any,
        area: 'knowledge_base',
        title: '+',
        position: clickPosition,
        metadata: { buttonType: 'new-memo' },
      })

      setVirtualNodes([newMemoButton])
      setSelectedNode(null)
      setShowTagButton(null)
    }
  }

  return (
    <>
      <div
        className="relative h-full w-full overflow-visible"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={!isNodeDragging}
          onWheel={handleWheel}
          onDragEnd={handleDragEnd}
          onClick={handleStageClick}
        >
          <Layer ref={layerRef}>
            {/* 背景 */}
            <Rect
              x={0}
              y={0}
              width={3000}
              height={3000 * 5}
              fill="#f9fafb"
              listening={true}
              onClick={() => {
                setSelectedNode(null)
                setShowTagButton(null)
                setVirtualNodes([])
                setIsCreatingTag(false)
              }}
              onDblClick={handleStageDblClick}
            />

            {/* エリア境界線 */}
            <AreaDividers width={3000} height={3000} />

            {/* エッジ */}
            <Group>
              {visibleEdges.map((edge) => (
                <GraphEdge key={edge.id} edge={edge} nodes={nodes} />
              ))}
            </Group>

            {/* 親ノードとボタンノードを繋ぐ点線（ノードの下に描画） */}
            {virtualNodes.length > 0 && selectedNode && (
              <Group>
                {virtualNodes.map((buttonNode, index) => (
                  <GraphEdge
                    key={`virtual-edge-${index}`}
                    edge={{
                      id: `virtual-edge-${index}`,
                      source_id: selectedNode.id,
                      target_id: buttonNode.id,
                      type: 'tag',
                      // 仮想エッジのためのデフォルト値
                      is_branch: false,
                      is_merge: false,
                      created_at: new Date().toISOString(),
                      branch_from: null,
                      merge_to: null,
                    }}
                    nodes={[...nodes, ...virtualNodes]}
                  />
                ))}
              </Group>
            )}

            {/* ノード */}
            <Group>
              {visibleNodes.map((node) => (
                <GraphNode
                  key={node.id}
                  node={node}
                  onClick={() => handleNodeClick(node)}
                  onDblClick={() => handleNodeDblClick(node)}
                  selected={selectedNode?.id === node.id}
                  onDragStart={() => setIsNodeDragging(true)}
                  onDragEnd={() => setIsNodeDragging(false)}
                />
              ))}
              {/* ボタンノード */}
              {visibleVirtualNodes.map((node) => (
                <GraphNode
                  key={node.id}
                  node={node}
                  onClick={() => handleNodeClick(node)}
                  selected={false}
                />
              ))}
            </Group>
          </Layer>
        </Stage>

        {/* ノード作成モーダル */}
        <CreateNodeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          area={createArea}
          position={createPosition}
        />

        {/* インラインタグ作成 */}
        {isCreatingTag && selectedNode && (
          <InlineTagCreator
            parentNode={selectedNode}
            onClose={() => {
              setIsCreatingTag(false)
              setShowTagButton(null)
            }}
            onCreated={() => {
              setIsCreatingTag(false)
              setShowTagButton(null)
            }}
          />
        )}

        {/* タスク依存関係マネージャー */}
        <TaskDependencyManager />

        {/* タスク状態メニュー */}
        {selectedNode && selectedNode.type === 'task' && <TaskStatusMenu node={selectedNode} />}

        {/* 計測管理 */}
        <MeasurementManager />

        {/* 改善決定ツール */}
        <ImprovementDecisionTool />

        {/* レポート生成 */}
        <ReportGenerator />

        {/* リンク作成モードインジケーター */}
        <FloatingIndicator />
      </div>

      {/* MDエディタ（サイドパネル） */}
      {editorNode && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            right: 0,
            height: 'calc(100vh - 64px)',
            width: '384px',
            zIndex: 50,
            backgroundColor: '#ffffff',
            boxShadow: '-4px 0 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <MDEditor node={editorNode} onClose={() => setEditorNode(null)} />
        </div>
      )}

      {/* 計測期間設定モーダル */}
      <MeasurementPeriodModal
        isOpen={measurementPeriodModal.isOpen}
        mvpNodeId={measurementPeriodModal.mvpNodeId}
        onClose={() => setMeasurementPeriodModal({ isOpen: false, mvpNodeId: null })}
      />
    </>
  )
}
