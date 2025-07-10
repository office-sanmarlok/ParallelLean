import type { Node } from '@/src/types/database'
import { calculateNodePosition } from './nodePosition'
import { AREA_ORDER } from './layout'
import { createVirtualNode } from './createVirtualNodes'

export type ButtonType = 'add-tag' | 'delete' | 'project' | 'add-istag' | 'add-research' | 'link-memo' | 'progress-build' | 'add-task' | 'change-status' | 'link-task' | 'create-mvp' | 'force-complete-measurement'

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
    offsetY: -50
  },
  {
    id: 'virtual-delete-button',
    type: 'delete_button',
    title: '×',
    buttonType: 'delete',
    offsetX: 100,
    offsetY: 0
  },
  {
    id: 'virtual-project-button',
    type: 'project_button',
    title: '→',
    buttonType: 'project',
    offsetX: 100,
    offsetY: 50
  }
]

// 最下部のTaskノードかどうかを判定
function isBottomMostTaskNode(node: Node, allNodes: Node[]): boolean {
  if (node.type !== 'task' || node.area !== 'build') return false
  
  const buildTaskNodes = allNodes.filter(
    n => n.type === 'task' && n.area === 'build'
  )
  
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
export function createButtonNodes(parentNode: Node, allNodes: Node[] | null = null): Node[] {
  // 親ノードの座標を統一された方法で計算
  const parentPos = calculateNodePosition(
    parentNode,
    undefined,
    AREA_ORDER.indexOf(parentNode.area)
  )
  
  // MEMOノードの場合は3つのボタン
  if (parentNode.type === 'memo') {
    return BUTTON_NODE_CONFIGS.map(config => createVirtualNode({
      id: config.id,
      type: config.type as any,
      area: 'knowledge_base',
      title: config.title,
      position: {
        x: parentPos.x + config.offsetX,
        y: parentPos.y + config.offsetY
      },
      metadata: { 
        parentId: parentNode.id, 
        buttonType: config.buttonType 
      }
    }))
  }
  
  // KBTagノードの場合は削除ボタンのみ
  if (parentNode.type === 'kb_tag') {
    return [createVirtualNode({
      id: `virtual-tag-delete-${parentNode.id}`,
      type: 'delete_button' as any,
      area: 'knowledge_base',
      title: '×',
      position: {
        x: parentPos.x + 60,
        y: parentPos.y
      },
      metadata: { 
        parentId: parentNode.id, 
        buttonType: 'delete' as ButtonType
      }
    })]
  }
  
  // Taskノードの場合
  if (parentNode.type === 'task') {
    const buttons = [
      createVirtualNode({
        id: `virtual-task-delete-${parentNode.id}`,
        type: 'delete_button' as any,
        area: 'build',
        title: '×',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y - 60
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'delete' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-task-add-${parentNode.id}`,
        type: 'add_task_button' as any,
        area: 'build',
        title: '+',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y - 20
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'add-task' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-task-link-${parentNode.id}`,
        type: 'task_link_button' as any,
        area: 'build',
        title: '🔗',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y + 20
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'link-task' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-task-status-${parentNode.id}`,
        type: 'status_button' as any,
        area: 'build',
        title: '◐',
        position: {
          x: parentPos.x + 80,
          y: parentPos.y + 60
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'change-status' as ButtonType
        }
      })
    ]
    
    // 最下部のTaskノードの場合、MVPボタンを追加
    if (allNodes && isBottomMostTaskNode(parentNode, allNodes)) {
      buttons.push(
        createVirtualNode({
          id: `virtual-task-mvp-${parentNode.id}`,
          type: 'mvp_button' as any,
          area: 'build',
          title: '⭐',
          position: {
            x: parentPos.x + 80,
            y: parentPos.y + 100
          },
          metadata: { 
            parentId: parentNode.id, 
            buttonType: 'create-mvp' as ButtonType
          }
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
        type: 'delete_button' as any,
        area: 'idea_stock',
        title: '×',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y - 80
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'delete' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-proposal-tag-${parentNode.id}`,
        type: 'tag_button' as any,
        area: 'idea_stock',
        title: '+',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y - 40
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'add-istag' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-proposal-research-${parentNode.id}`,
        type: 'research_button' as any,
        area: 'idea_stock',
        title: '🔍',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'add-research' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-proposal-memo-${parentNode.id}`,
        type: 'memo_link_button' as any,
        area: 'idea_stock',
        title: '🔗',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y + 40
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'link-memo' as ButtonType
        }
      }),
      createVirtualNode({
        id: `virtual-proposal-build-${parentNode.id}`,
        type: 'build_button' as any,
        area: 'idea_stock',
        title: '↓',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y + 80
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'progress-build' as ButtonType
        }
      })
    ]
  }
  
  // Dashboardノードの場合はデバッグボタン
  if (parentNode.type === 'dashboard') {
    return [
      createVirtualNode({
        id: `virtual-dashboard-force-complete-${parentNode.id}`,
        type: 'debug_button' as any,
        area: 'measure',
        title: '⏩',
        position: {
          x: parentPos.x + 120,
          y: parentPos.y
        },
        metadata: { 
          parentId: parentNode.id, 
          buttonType: 'force-complete-measurement' as ButtonType
        }
      })
    ]
  }
  
  return []
}

// ボタンノードかどうかを判定
export function isButtonNode(node: Node): boolean {
  return node.type === 'tag_button' || 
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
}

// ボタンノードのスタイルを取得
export function getButtonNodeStyle(node: Node, isHovered: boolean) {
  switch (node.type) {
    case 'tag_button':
      return {
        fill: isHovered ? '#E5E7EB' : '#F3F4F6',
        stroke: '#9CA3AF',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'delete_button':
      return {
        fill: isHovered ? '#FEE2E2' : '#FEF2F2',
        stroke: '#F87171',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'project_button':
      return {
        fill: isHovered ? '#DBEAFE' : '#EFF6FF',
        stroke: '#60A5FA',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'new_memo_button':
      return {
        fill: isHovered ? '#E5E7EB' : '#F3F4F6',
        stroke: '#9CA3AF',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'research_button':
      return {
        fill: isHovered ? '#FEF3C7' : '#FFFBEB',
        stroke: '#F59E0B',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'memo_link_button':
      return {
        fill: isHovered ? '#E0E7FF' : '#EEF2FF',
        stroke: '#6366F1',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'build_button':
      return {
        fill: isHovered ? '#D1FAE5' : '#ECFDF5',
        stroke: '#10B981',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'task_link_button':
      return {
        fill: isHovered ? '#E0E7FF' : '#EEF2FF',
        stroke: '#6366F1',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'add_task_button':
      return {
        fill: isHovered ? '#E5E7EB' : '#F3F4F6',
        stroke: '#9CA3AF',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'status_button':
      return {
        fill: isHovered ? '#FEF3C7' : '#FFFBEB',
        stroke: '#F59E0B',
        strokeWidth: 2,
        dash: [5, 5],
      }
    case 'mvp_button':
      return {
        fill: isHovered ? '#FDE68A' : '#FEF3C7',
        stroke: '#F59E0B',
        strokeWidth: 3,
        dash: [5, 5],
        shadowBlur: 10,
        shadowColor: '#F59E0B',
        shadowOpacity: 0.3,
      }
    case 'debug_button':
      return {
        fill: isHovered ? '#FCA5A5' : '#FEE2E2',
        stroke: '#DC2626',
        strokeWidth: 2,
        dash: [3, 3],
      }
    default:
      return {}
  }
}