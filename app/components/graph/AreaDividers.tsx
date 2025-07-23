'use client'

import { Line, Text, Group } from 'react-konva'
import { AREA_HEIGHT_RATIOS, AREA_ORDER, getAreaBounds } from '@/app/lib/graph/layout'
import { useGraphStore } from '@/app/stores/graphStore'

interface AreaDividersProps {
  width: number
  height: number
}

const AREA_LABELS = {
  knowledge_base: 'Knowledge Base',
  idea_stock: 'Idea Stock',
  build: 'Build',
  measure: 'Measure',
  learn: 'Learn',
}

export function AreaDividers({ width, height }: AreaDividersProps) {
  const { buildAreaMaxY } = useGraphStore()
  
  // 各エリアの動的な境界を取得
  const getAreaY = (area: typeof AREA_ORDER[number]) => {
    const bounds = getAreaBounds(area, buildAreaMaxY)
    return {
      minY: bounds.minY,
      maxY: bounds.maxY
    }
  }

  return (
    <Group>
      {AREA_ORDER.map((area, index) => {
        const { minY } = getAreaY(area)
        
        // Measureエリアの境界線はBuildエリアが拡張されている場合はスキップ
        const shouldSkipBorder = area === 'measure' && buildAreaMaxY && 
          buildAreaMaxY > getAreaBounds('build').maxY - 100
        
        return (
          <Group key={area}>
            {/* エリア境界線 */}
            {index > 0 && !shouldSkipBorder && (
              <Line 
                points={[0, minY - 30, width, minY - 30]} 
                stroke="#E5E7EB" 
                strokeWidth={1} 
                dash={[10, 5]} 
              />
            )}

            {/* エリアラベル */}
            <Text
              x={20}
              y={minY}
              text={AREA_LABELS[area]}
              fontSize={16}
              fontStyle="bold"
              fill="#6B7280"
            />
          </Group>
        )
      })}
      
      {/* Build エリアの動的な下限線を表示 */}
      {buildAreaMaxY && (
        <Line 
          points={[0, buildAreaMaxY + 100, width, buildAreaMaxY + 100]} 
          stroke="#9CA3AF" 
          strokeWidth={1} 
          dash={[5, 3]}
          opacity={0.5}
        />
      )}
    </Group>
  )
}
