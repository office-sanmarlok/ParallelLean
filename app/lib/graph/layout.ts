import type { Node, Edge, AreaType } from '@/src/types/database'

// エリアの高さ設定（ビューポートの比率）
export const AREA_HEIGHT_RATIO = 0.25 // 各エリアは画面の25%の高さ（20%から拡大）

// エリアの順序
export const AREA_ORDER: AreaType[] = [
  'knowledge_base',
  'idea_stock',
  'build',
  'measure',
  'learn',
]

// グラフのサイズ設定
export const GRAPH_DIMENSIONS = {
  width: 3000,  // 2000から3000に拡大
  height: 3000, // 2000から3000に拡大
  padding: 100, // パディングも50から100に拡大
}

// ノードのデフォルトサイズ
export const NODE_SIZES = {
  memo: 50,
  kb_tag: 60,
  proposal: 80,
  research: 60,
  is_tag: 60,
  task: 70,
  mvp: 100,
  dashboard: 80,
  improvement: 60,
  tag_button: 40,
  delete_button: 40,
  project_button: 40,
  new_memo_button: 50,
  research_button: 40,
  memo_link_button: 40,
  build_button: 40,
}

// エリアの境界を計算
export function getAreaBounds(area: AreaType) {
  const areaIndex = AREA_ORDER.indexOf(area)
  const areaHeight = GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIO
  
  return {
    minY: areaIndex * areaHeight + GRAPH_DIMENSIONS.padding,
    maxY: (areaIndex + 1) * areaHeight - GRAPH_DIMENSIONS.padding,
    minX: GRAPH_DIMENSIONS.padding,
    maxX: GRAPH_DIMENSIONS.width - GRAPH_DIMENSIONS.padding,
  }
}

// ノードの初期位置を計算
export function getInitialNodePosition(node: Node): { x: number; y: number } {
  const areaBounds = getAreaBounds(node.area)
  
  // 全エリアでランダム配置
  return {
    x: Math.random() * (areaBounds.maxX - areaBounds.minX) + areaBounds.minX,
    y: Math.random() * (areaBounds.maxY - areaBounds.minY) + areaBounds.minY,
  }
}


// エリア制約を適用
export function applyAreaConstraint(
  node: Node,
  position: { x: number; y: number }
): { x: number; y: number } {
  const areaBounds = getAreaBounds(node.area)
  
  return {
    x: Math.max(areaBounds.minX, Math.min(position.x, areaBounds.maxX)),
    y: Math.max(areaBounds.minY, Math.min(position.y, areaBounds.maxY)),
  }
}

// ノードのサイズを取得
export function getNodeSize(node: Node): number {
  if (node.type === 'memo' && node.size) {
    return node.size
  }
  return NODE_SIZES[node.type] || 50
}