'use client'

import { Line, Text, Group } from 'react-konva'
import { AREA_HEIGHT_RATIO, AREA_ORDER } from '@/app/lib/graph/layout'

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
  const areaHeight = height * AREA_HEIGHT_RATIO

  return (
    <Group>
      {AREA_ORDER.map((area, index) => {
        const y = index * areaHeight
        
        return (
          <Group key={area}>
            {/* エリア境界線 */}
            {index > 0 && (
              <Line
                points={[0, y, width, y]}
                stroke="#E5E7EB"
                strokeWidth={1}
                dash={[10, 5]}
              />
            )}
            
            {/* エリアラベル */}
            <Text
              x={20}
              y={y + 20}
              text={AREA_LABELS[area]}
              fontSize={16}
              fontStyle="bold"
              fill="#6B7280"
            />
          </Group>
        )
      })}
    </Group>
  )
}