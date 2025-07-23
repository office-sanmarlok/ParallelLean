import type { Node, Edge, AreaType } from '@/src/types/database'
import type { ExtendedNode, AllNodeType } from '@/src/types/graph'

// エリアの高さ設定（ビューポートの比率）
// 新しい比率：KB/Measure/Learnを1.5倍、IdeaStockを0.7倍
export const AREA_HEIGHT_RATIOS: Record<AreaType, number> = {
  knowledge_base: 0.375,  // 37.5% (25% × 1.5)
  idea_stock: 0.175,      // 17.5% (25% × 0.7)
  build: 0.2625,          // 26.25% (残りを調整、合計100%に)
  measure: 0.09375,       // 9.375% (6.25% × 1.5)
  learn: 0.09375          // 9.375% (6.25% × 1.5)
}

// エリアの順序
export const AREA_ORDER: AreaType[] = ['knowledge_base', 'idea_stock', 'build', 'measure', 'learn']

// グラフのサイズ設定
export const GRAPH_DIMENSIONS = {
  width: 3000, // 2000から3000に拡大
  height: 3000, // 2000から3000に拡大
  padding: 30, // 100から30に縮小（境界付近もノード配置可能に）
}

// ノードのデフォルトサイズ
export const NODE_SIZES = {
  memo: 50,
  kb_tag: 60,
  proposal: 80,
  research: 60,
  is_tag: 60,
  task: 35,  // 70 → 35 に縮小（半分）
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
  task_link_button: 40,
  add_task_button: 40,
  status_button: 40,
  mvp_button: 40,
  debug_button: 40,
}

// エリアの境界を計算
export function getAreaBounds(area: AreaType, buildAreaMaxY?: number | null) {
  const areaIndex = AREA_ORDER.indexOf(area)
  
  // 各エリアの開始Y座標を計算
  let startY = 0
  for (let i = 0; i < areaIndex; i++) {
    startY += GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIOS[AREA_ORDER[i]]
  }
  
  // Buildエリアの動的な高さ調整
  if (area === 'build') {
    const areaHeight = GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIOS[area]
    const defaultMaxY = startY + areaHeight - GRAPH_DIMENSIONS.padding
    
    // buildAreaMaxYが設定されていて、デフォルトの境界を超えている場合は拡張
    const actualMaxY = buildAreaMaxY && buildAreaMaxY > defaultMaxY 
      ? buildAreaMaxY + 100 // 余裕を持たせる
      : defaultMaxY
      
    return {
      minY: startY + GRAPH_DIMENSIONS.padding,
      maxY: actualMaxY,
      minX: GRAPH_DIMENSIONS.padding,
      maxX: GRAPH_DIMENSIONS.width - GRAPH_DIMENSIONS.padding,
    }
  }
  
  // Measure、Learnエリアの位置調整
  if (area === 'measure' || area === 'learn') {
    // Buildエリアの実際の高さを考慮
    const buildDefaultHeight = GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIOS['build']
    const buildDefaultMaxY = GRAPH_DIMENSIONS.height * (AREA_HEIGHT_RATIOS['knowledge_base'] + AREA_HEIGHT_RATIOS['idea_stock']) + buildDefaultHeight
    
    // Buildエリアが拡張されている場合の追加の高さ
    const buildExtension = buildAreaMaxY && buildAreaMaxY > buildDefaultMaxY - GRAPH_DIMENSIONS.padding
      ? (buildAreaMaxY + 100) - (buildDefaultMaxY - GRAPH_DIMENSIONS.padding)
      : 0
      
    // 調整されたstartYを計算
    const adjustedStartY = startY + buildExtension
    const areaHeight = GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIOS[area]
    
    return {
      minY: adjustedStartY + GRAPH_DIMENSIONS.padding,
      maxY: adjustedStartY + areaHeight - GRAPH_DIMENSIONS.padding,
      minX: GRAPH_DIMENSIONS.padding,
      maxX: GRAPH_DIMENSIONS.width - GRAPH_DIMENSIONS.padding,
    }
  }
  
  // その他のエリア（KnowledgeBase、IdeaStock）
  const areaHeight = GRAPH_DIMENSIONS.height * AREA_HEIGHT_RATIOS[area]
  return {
    minY: startY + GRAPH_DIMENSIONS.padding,
    maxY: startY + areaHeight - GRAPH_DIMENSIONS.padding,
    minX: GRAPH_DIMENSIONS.padding,
    maxX: GRAPH_DIMENSIONS.width - GRAPH_DIMENSIONS.padding,
  }
}

// ノードの初期位置を計算
export function getInitialNodePosition(node: Node | ExtendedNode): { x: number; y: number } {
  const areaBounds = getAreaBounds(node.area)

  // 全エリアでランダム配置
  return {
    x: Math.random() * (areaBounds.maxX - areaBounds.minX) + areaBounds.minX,
    y: Math.random() * (areaBounds.maxY - areaBounds.minY) + areaBounds.minY,
  }
}

// エリア制約を適用
export function applyAreaConstraint(
  node: Node | ExtendedNode,
  position: { x: number; y: number },
  buildAreaMaxY?: number | null
): { x: number; y: number } {
  const areaBounds = getAreaBounds(node.area, buildAreaMaxY)

  return {
    x: Math.max(areaBounds.minX, Math.min(position.x, areaBounds.maxX)),
    y: Math.max(areaBounds.minY, Math.min(position.y, areaBounds.maxY)),
  }
}

// ノードのサイズを取得
export function getNodeSize(node: Node | ExtendedNode): number {
  if (node.type === 'memo' && node.size) {
    return node.size
  }
  return NODE_SIZES[node.type as keyof typeof NODE_SIZES] || 50
}
