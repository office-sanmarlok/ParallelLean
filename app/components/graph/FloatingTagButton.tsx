'use client'

import { useEffect, useState, useRef } from 'react'
import { Circle, Line, Group, Text } from 'react-konva'
import { useGraphStore } from '@/app/stores/graphStore'
import type { Node } from '@/src/types/database'
import Konva from 'konva'

interface FloatingTagButtonProps {
  parentNode: Node
  onClick: () => void
}

export function FloatingTagButton({ parentNode, onClick }: FloatingTagButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const groupRef = useRef<Konva.Group>(null)
  const { nodes, edges } = useGraphStore()
  
  // ボタン自体の位置（Force Simulationで更新される）
  const [buttonPosition, setButtonPosition] = useState(() => {
    const parentPos = typeof parentNode.position === 'object' && parentNode.position !== null
      ? (parentNode.position as any)
      : { x: 0, y: 0 }
    return {
      x: parentPos.x + 100,
      y: parentPos.y + 50
    }
  })
  
  const buttonRadius = 20
  
  // フェードインアニメーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Force Simulationの影響を受ける
  useEffect(() => {
    const parentPos = typeof parentNode.position === 'object' && parentNode.position !== null
      ? (parentNode.position as any)
      : { x: 0, y: 0 }
    
    // 親ノードとの理想的な距離
    const idealDistance = 80
    const angle = Math.PI / 4 // 45度（右下）
    
    // 他のノードとの反発力を計算
    let forceX = 0
    let forceY = 0
    
    nodes.forEach(node => {
      if (node.id === parentNode.id) return
      
      const nodePos = typeof node.position === 'object' && node.position !== null
        ? (node.position as any)
        : { x: 0, y: 0 }
      
      const dx = buttonPosition.x - nodePos.x
      const dy = buttonPosition.y - nodePos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100 && distance > 0) {
        // 反発力
        const force = 50 / (distance * distance)
        forceX += (dx / distance) * force
        forceY += (dy / distance) * force
      }
    })
    
    // 親ノードへの引力
    const dx = parentPos.x + Math.cos(angle) * idealDistance - buttonPosition.x
    const dy = parentPos.y + Math.sin(angle) * idealDistance - buttonPosition.y
    const parentForce = 0.1
    
    forceX += dx * parentForce
    forceY += dy * parentForce
    
    // 位置を更新
    setButtonPosition(prev => ({
      x: prev.x + forceX,
      y: prev.y + forceY
    }))
    
    // アニメーション
    if (groupRef.current) {
      groupRef.current.to({
        x: buttonPosition.x,
        y: buttonPosition.y,
        duration: 0.3,
        easing: Konva.Easings.EaseOut
      })
    }
  }, [parentNode.position, nodes, buttonPosition.x, buttonPosition.y])
  
  const parentPos = typeof parentNode.position === 'object' && parentNode.position !== null
    ? (parentNode.position as any)
    : { x: 0, y: 0 }
  
  return (
    <Group ref={groupRef} x={buttonPosition.x} y={buttonPosition.y} opacity={opacity}>
      {/* 点線 */}
      <Line
        points={[parentPos.x - buttonPosition.x, parentPos.y - buttonPosition.y, 0, 0]}
        stroke="#9CA3AF"
        strokeWidth={2}
        dash={[5, 5]}
        opacity={0.6}
      />
      
      {/* ボタン背景 */}
      <Circle
        x={0}
        y={0}
        radius={buttonRadius}
        fill={isHovered ? '#E5E7EB' : '#F3F4F6'}
        stroke="#9CA3AF"
        strokeWidth={2}
        dash={[5, 5]}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        onTap={onClick}
      />
      
      {/* プラスアイコン */}
      <Group 
        x={0} 
        y={0}
        listening={false}
      >
        {/* 横線 */}
        <Line
          points={[-8, 0, 8, 0]}
          stroke="#4B5563"
          strokeWidth={2}
          lineCap="round"
        />
        {/* 縦線 */}
        <Line
          points={[0, -8, 0, 8]}
          stroke="#4B5563"
          strokeWidth={2}
          lineCap="round"
        />
      </Group>
      
      {/* ホバー時のツールチップ */}
      {isHovered && (
        <Group x={0} y={-35}>
          <Text
            text="タグを追加"
            fontSize={12}
            fill="#374151"
            align="center"
            offsetX={24}
          />
        </Group>
      )}
    </Group>
  )
}