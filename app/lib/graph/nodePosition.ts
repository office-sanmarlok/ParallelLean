import type { Node } from '@/src/types/database'
import { AREA_HEIGHT_RATIO } from './layout'

// ノード間の垂直間隔
const VERTICAL_SPACING = 100
const AREA_OFFSET_Y = 100

/**
 * ノードの表示位置を計算
 * KnowledgeBaseエリアはForce Simulation、その他のエリアは論理的に計算
 */
export function calculateNodePosition(
  node: Node,
  projectLine?: any,
  areaIndex: number = 0
): { x: number; y: number } {
  // KnowledgeBaseエリアの場合はForce Simulationが管理するのでpositionをそのまま使用
  if (node.area === 'knowledge_base') {
    if (node.position && typeof node.position === 'object') {
      const pos = node.position as any
      return { x: pos.x || 0, y: pos.y || 0 }
    }
    // デフォルト位置
    return {
      x: 100 + Math.random() * 800,
      y: AREA_OFFSET_Y + Math.random() * 400
    }
  }
  
  
  // フォールバック: DBの位置をそのまま使用
  if (node.position && typeof node.position === 'object') {
    const pos = node.position as any
    return { x: pos.x || 0, y: pos.y || 0 }
  }
  
  return { x: 0, y: 0 }
}

/**
 * vertical_orderからY座標を計算
 */
export function calculateYFromOrder(
  verticalOrder: number,
  areaIndex: number
): number {
  const baseY = areaIndex * 2000 * AREA_HEIGHT_RATIO + AREA_OFFSET_Y
  return baseY + (verticalOrder * VERTICAL_SPACING)
}

/**
 * Y座標からvertical_orderを計算
 */
export function calculateOrderFromY(
  y: number,
  areaIndex: number
): number {
  const baseY = areaIndex * 2000 * AREA_HEIGHT_RATIO + AREA_OFFSET_Y
  return Math.round((y - baseY) / VERTICAL_SPACING)
}