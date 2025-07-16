import type { Node } from '@/src/types/database'
import type { ExtendedNode, VirtualNodeType } from '@/src/types/graph'
import { calculateNodePosition } from './nodePosition'
import { AREA_ORDER } from './layout'
import { createVirtualNode } from './createVirtualNodes'

export type ButtonType =
  | 'add-tag'
  | 'delete'
  | 'project'
  | 'add-istag'
  | 'add-research'
  | 'link-memo'
  | 'progress-build'
  | 'add-task'
  | 'change-status'
  | 'link-task'
  | 'create-mvp'
  | 'force-complete-measurement'

export interface ButtonNodeConfig {
  id: string
  type: string
  title: string
  buttonType: ButtonType
  offsetX: number
  offsetY: number
}

// ボタンノードの設定
export const BUTTON_NODE_CONFIGS: ButtonNodeConfig[] = [
  {
    id: 'virtual-tag-button',
    type: 'tag_button',
    title: '+',
    buttonType: 'add-tag',
    offsetX: 100,
    offsetY: -50,
  },
  {
    id: 'virtual-delete-button',
    type: 'delete_button',
    title: '×',
    buttonType: 'delete',
    offsetX: 100,
    offsetY: 0,
  },
  {
    id: 'virtual-project-button',
    type: 'project_button',
    title: '→',
    buttonType: 'project',
    offsetX: 100,
    offsetY: 50,
  },
]

// 最下部のTaskノードかどうかを判定
function isBottomMostTaskNode(node: Node, allNodes: Node[]): boolean {
  if (node.type !== 'task' || node.area !== 'build') return false

  const buildTaskNodes = allNodes.filter((n) => n.type === 'task' && n.area === 'build')

  if (buildTaskNodes.length === 0) return false

  // Y座標が最大のノードを見つける
  const bottomNode = buildTaskNodes.reduce((bottom, current) => {
    const bottomY = typeof bottom.position === 'object' ? (bottom.position as any).y : 0
    const currentY = typeof current.position === 'object' ? (current.position as any).y : 0
    return currentY > bottomY ? current : bottom
  })

  return node.id === bottomNode.id
}

// ボタンノードを作成
export function createButtonNodes(
  parentNode: Node,
  allNodes: Node[] | null = null
): ExtendedNode[] {
  // 親ノードの座標を統一された方法で計算
  const parentPos = calculateNodePosition(
    parentNode,
    undefined,
    AREA_ORDER.indexOf(parentNode.area)
  )

  // MEMOノードの場合は3つのボタン
  if (parentNode.type === 'memo') {
    return BUTTON_NODE_CONFIGS.map((config) =>
      createVirtualNode({
        id: config.id,
        type: config.type as VirtualNodeType,
        area: 'knowledge_base',
        title: config.title,
        position: {
          x: parentPos.x + config.offsetX,
          y: parentPos.y + config.offsetY,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: config.buttonType,
        },
      })
    )
  }

  // KBTagノードの場合は削除ボタンのみ
  if (parentNode.type === 'kb_tag') {
    return [
      createVirtualNode({
        id: `virtual-tag-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'knowledge_base',
        title: '×',
        position: {
          x: parentPos.x + 60,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
    ]
  }

  // Taskノードの場合
  if (parentNode.type === 'task') {
    const buttons = [
      createVirtualNode({
        id: `virtual-task-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'build',
        title: '×',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y - 60,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-task-add-${parentNode.id}`,
        type: 'add_task_button' as VirtualNodeType,
        area: 'build',
        title: '+',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y - 20,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'add-task' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-task-link-${parentNode.id}`,
        type: 'task_link_button' as VirtualNodeType,
        area: 'build',
        title: '🔗',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y + 20,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'link-task' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-task-status-${parentNode.id}`,
        type: 'status_button' as VirtualNodeType,
        area: 'build',
        title: '◐',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y + 60,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'change-status' as ButtonType,
        },
      }),
    ]

    // 最下部のTaskノードの場合、MVPボタンを追加
    if (allNodes && isBottomMostTaskNode(parentNode, allNodes)) {
      buttons.push(
        createVirtualNode({
          id: `virtual-task-mvp-${parentNode.id}`,
          type: 'mvp_button' as VirtualNodeType,
          area: 'build',
          title: '⭐',
          position: {
            x: parentPos.x + 80,
            y: parentPos.y + 100,
          },
          metadata: {
            parentId: parentNode.id,
            buttonType: 'create-mvp' as ButtonType,
          },
        })
      )
    }

    return buttons
  }

  // Proposalノードの場合は5つのボタン
  if (parentNode.type === 'proposal') {
    return [
      createVirtualNode({
        id: `virtual-proposal-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '×',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y - 80,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-proposal-tag-${parentNode.id}`,
        type: 'tag_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '+',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y - 40,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'add-istag' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-proposal-research-${parentNode.id}`,
        type: 'research_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '🔍',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'add-research' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-proposal-memo-${parentNode.id}`,
        type: 'memo_link_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '🔗',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y + 40,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'link-memo' as ButtonType,
        },
      }),
      createVirtualNode({
        id: `virtual-proposal-build-${parentNode.id}`,
        type: 'build_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '↓',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y + 80,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'progress-build' as ButtonType,
        },
      }),
    ]
  }

  // Dashboardノードの場合はデバッグボタン
  if (parentNode.type === 'dashboard') {
    return [
      createVirtualNode({
        id: `virtual-dashboard-force-complete-${parentNode.id}`,
        type: 'debug_button' as VirtualNodeType,
        area: 'measure',
        title: '⏩',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'force-complete-measurement' as ButtonType,
        },
      }),
    ]
  }

  // Researchノードの場合は削除ボタンのみ
  if (parentNode.type === 'research') {
    return [
      createVirtualNode({
        id: `virtual-research-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '×',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
    ]
  }

  // ISTagノードの場合は削除ボタンのみ
  if (parentNode.type === 'is_tag') {
    return [
      createVirtualNode({
        id: `virtual-istag-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'idea_stock',
        title: '×',
        position: {
          x: parentPos.x + 60,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
    ]
  }

  // Improvementノードの場合は削除ボタンのみ
  if (parentNode.type === 'improvement') {
    return [
      createVirtualNode({
        id: `virtual-improvement-delete-${parentNode.id}`,
        type: 'delete_button' as VirtualNodeType,
        area: 'learn',
        title: '×',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y,
        },
        metadata: {
          parentId: parentNode.id,
          buttonType: 'delete' as ButtonType,
        },
      }),
    ]
  }

  return []
}

// ボタンノードかどうかを判定
export function isButtonNode(node: Node | ExtendedNode): boolean {
  return (
    node.type === 'tag_button' ||
    node.type === 'delete_button' ||
    node.type === 'project_button' ||
    node.type === 'new_memo_button' ||
    node.type === 'research_button' ||
    node.type === 'memo_link_button' ||
    node.type === 'build_button' ||
    node.type === 'task_link_button' ||
    node.type === 'add_task_button' ||
    node.type === 'status_button' ||
    node.type === 'mvp_button' ||
    node.type === 'debug_button'
  )
}

// ボタンノードのスタイルを取得
export function getButtonNodeStyle(node: Node | ExtendedNode, isHovered: boolean) {
  switch (node.type) {
    case 'tag_button':
      return {
        fill: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        stroke: '#3B82F6',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'delete_button':
      return {
        fill: isHovered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        stroke: '#EF4444',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'project_button':
      return {
        fill: isHovered ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
        stroke: '#22C55E',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'new_memo_button':
      return {
        fill: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        stroke: '#3B82F6',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'research_button':
      return {
        fill: isHovered ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.1)',
        stroke: '#FB923C',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'memo_link_button':
      return {
        fill: isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
        stroke: '#6366F1',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'build_button':
      return {
        fill: isHovered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        stroke: '#10B981',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'task_link_button':
      return {
        fill: isHovered ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
        stroke: '#6366F1',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'add_task_button':
      return {
        fill: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        stroke: '#3B82F6',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'status_button':
      // select-statusタイプの場合はmetadataの色を使用
      const metadata = (node as any).metadata
      if (metadata?.buttonType === 'select-status' && metadata?.color) {
        return {
          fill: metadata.color,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: isHovered ? 1 : 0.9,
        }
      }
      return {
        fill: isHovered ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.1)',
        stroke: '#FB923C',
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.8,
      }
    case 'mvp_button':
      return {
        fill: isHovered ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)',
        stroke: '#FBBF24',
        strokeWidth: 3,
        dash: [5, 5],
        opacity: 0.9,
        shadowBlur: 10,
        shadowColor: '#FBBF24',
        shadowOpacity: 0.3,
      }
    case 'debug_button':
      return {
        fill: isHovered ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)',
        stroke: '#DC2626',
        strokeWidth: 2,
        dash: [3, 3],
        opacity: 0.8,
      }
    default:
      return {}
  }
}
