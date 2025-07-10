'use client'

import { useState, useRef, useEffect } from 'react'
import { Circle, Rect, Text, Group, Line } from 'react-konva'
import type { Node } from '@/src/types/database'
import { getNodeSize, AREA_ORDER } from '@/app/lib/graph/layout'
import { createClient } from '@/app/lib/supabase/client'
import { applyAreaConstraint, applyVerticalConstraint } from '@/app/lib/graph/layout'
import { useGraphStore } from '@/app/stores/graphStore'
import Konva from 'konva'
import { getButtonNodeStyle } from '@/app/lib/graph/buttonNodes'
import { calculateNodePosition } from '@/app/lib/graph/nodePosition'

interface GraphNodeProps {
  node: Node
  onClick: () => void
  onDblClick?: () => void
  selected: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function GraphNode({ node, onClick, onDblClick, selected, onDragStart, onDragEnd }: GraphNodeProps) {
  const size = getNodeSize(node)
  const { linkingMode, linkingSource } = useGraphStore()
  const updateNode = useGraphStore(state => state.updateNode)
  
  // エリアインデックスを取得
  const areaIndex = AREA_ORDER.indexOf(node.area)
  
  // 座標を計算
  const position = calculateNodePosition(node, undefined, areaIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const groupRef = useRef<Konva.Group>(null)
  const lastPositionRef = useRef({ x: position.x, y: position.y })
  const velocityRef = useRef({ x: 0, y: 0 })
  
  // リンク作成モード中のハイライト
  const isLinkSource = linkingMode && linkingSource?.id === node.id
  const canBeLinked = linkingMode && linkingSource?.id !== node.id
  

  // ノードのスタイルを取得
  const getNodeStyle = () => {
    switch (node.type) {
      case 'memo':
        return {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
        }
      case 'kb_tag':
      case 'is_tag':
        return {
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 2,
        }
      case 'tag_button':
      case 'delete_button':
      case 'project_button':
      case 'new_memo_button':
      case 'research_button':
      case 'memo_link_button':
      case 'build_button':
      case 'task_link_button':
      case 'add_task_button':
      case 'status_button':
      case 'mvp_button':
      case 'debug_button':
        return getButtonNodeStyle(node, isHovered)
      case 'proposal':
      case 'research':
        return {
          fill: '#f0f0f0',
          stroke: '#000000',
          strokeWidth: 2,
        }
      case 'task':
        return {
          fill: node.task_status === 'completed' ? '#10B981' :    // 完了: 緑
                node.task_status === 'incomplete' ? '#EF4444' :  // 未完了: 赤
                '#F59E0B',  // 保留: 黄色
          stroke: '#000000',
          strokeWidth: 2,
        }
      case 'mvp':
        return {
          fill: '#FFD700',
          stroke: '#000000',
          strokeWidth: 3,
          shadowBlur: 20,
          shadowColor: '#FFD700',
          shadowOpacity: 0.5,
        }
      case 'dashboard':
        return {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
        }
      case 'improvement':
        return {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
        }
      default:
        return {
          fill: '#cccccc',
          stroke: '#000000',
          strokeWidth: 2,
        }
    }
  }

  const style = getNodeStyle()
  const isTag = node.type === 'kb_tag' || node.type === 'is_tag'
  const isSquare = node.type === 'dashboard'
  const supabase = createClient()

  // ドラッグ中の処理
  const handleDragMove = (e: any) => {
    if (node.area === 'knowledge_base' || node.area === 'idea_stock' || node.area === 'build' || node.area === 'measure' || node.area === 'learn') {
      const newPosition = {
        x: e.target.x(),
        y: e.target.y(),
      }
      
      // 速度を計算
      velocityRef.current = {
        x: newPosition.x - lastPositionRef.current.x,
        y: newPosition.y - lastPositionRef.current.y
      }
      lastPositionRef.current = newPosition
      
      // エリア制約を適用
      let constrainedPosition = applyAreaConstraint(node, newPosition)
      
      // 統合Force Simulationに位置を通知
      if ((window as any).__unifiedSimulationHandleDrag) {
        (window as any).__unifiedSimulationHandleDrag(node.id, constrainedPosition.x, constrainedPosition.y)
      }
      
      // 即座にストアを更新
      updateNode(node.id, { position: constrainedPosition })
      
    }
  }

  // ドラッグ終了時の処理
  const handleDragEnd = async (e: any) => {
    setIsDragging(false)
    
    if (onDragEnd) {
      onDragEnd()
    }
    
    // ステージのドラッグを再有効化
    const stage = (window as any).__graphStage
    if (stage) {
      stage.draggable(true)
    }
    
    // ボタンノードはドラッグ不可
    if (node.id.startsWith('virtual-')) {
      return
    }
    
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    }
    
    // エリア制約を適用
    let constrainedPosition = applyAreaConstraint(node, newPosition)
    
    // 統合Force Simulationにドラッグ終了を通知
    if ((window as any).__unifiedSimulationHandleDragEnd) {
      (window as any).__unifiedSimulationHandleDragEnd(node.id)
    }
    
    // 慣性を適用（全てのドラッグ可能なエリア）
    if ((node.area === 'knowledge_base' || node.area === 'idea_stock' || node.area === 'build' || node.area === 'measure' || node.area === 'learn') && groupRef.current) {
      // 速度に基づいて慣性移動
      let inertiaFactor = 0.92  // 初期は高い値（滑らかな動き）
      const minInertiaFactor = 0.7  // 最終的な減衰率
      const inertiaDecay = 0.98  // 減衰率の変化速度
      
      let vx = velocityRef.current.x * 1.2  // 初速を少し抑える
      let vy = velocityRef.current.y * 1.2
      
      
      let currentX = constrainedPosition.x
      let currentY = constrainedPosition.y
      
      const animate = () => {
        // 慣性係数を徐々に下げる（より強い減衰へ）
        inertiaFactor = Math.max(minInertiaFactor, inertiaFactor * inertiaDecay)
        
        vx *= inertiaFactor
        vy *= inertiaFactor
        
        if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
          currentX += vx
          currentY += vy
          
          let inertiaPosition = applyAreaConstraint(node, { x: currentX, y: currentY })
          
          updateNode(node.id, { position: inertiaPosition })
          
          requestAnimationFrame(animate)
        } else {
          // 完全に停止
          vx = 0
          vy = 0
          
          // 最終位置
          const finalPosition = { x: currentX, y: currentY }
        }
      }
      
      requestAnimationFrame(animate)
    } else {
      // 他のエリアの場合（慣性なし）
      // ストアを更新
      updateNode(node.id, { position: constrainedPosition })
    }
  }

  return (
    <Group
      ref={groupRef}
      x={position.x}
      y={position.y}
      onClick={(e) => {
        // ドラッグ中はクリックイベントを無視
        if (isDragging) return
        onClick()
      }}
      onDblClick={(e) => {
        if (onDblClick) {
          onDblClick()
        }
      }}
      onTap={(e) => {
        onClick()
      }}
      onDblTap={(e) => {
        if (onDblClick) {
          onDblClick()
        }
      }}
      draggable={(node.area === 'knowledge_base' || node.area === 'idea_stock' || node.area === 'build' || node.area === 'measure' || node.area === 'learn')}
      onMouseDown={(e) => {
        // 全てのノードでマウスダウン時にステージのドラッグを無効化
        const stage = e.target.getStage()
        if (stage) {
          stage.draggable(false)
        }
        // 親要素へのイベント伝播を止める
        e.cancelBubble = true
        e.evt.stopPropagation()
        e.evt.preventDefault()
      }}
      onMouseUp={(e) => {
        // 全てのノードでマウスアップ時にステージドラッグを復元
        const stage = e.target.getStage()
        if (stage) {
          stage.draggable(true)
        }
      }}
      onDragStart={(e) => {
        setIsDragging(true)
        onDragStart?.()
        // 統合Force Simulationにドラッグ開始を通知
        if ((window as any).__unifiedSimulationHandleDrag) {
          const currentPos = typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 0, y: 0 }
          ;(window as any).__unifiedSimulationHandleDrag(node.id, currentPos.x, currentPos.y)
        }
        // ステージのドラッグが確実に無効になっているか再確認
        const stage = e.target.getStage()
        if (stage && stage.draggable()) {
          stage.draggable(false)
        }
        e.cancelBubble = true
      }}
      onDragMove={handleDragMove}
      onDragEnd={(e) => {
        handleDragEnd(e)
        onDragEnd?.()
        // 統合Force Simulationにドラッグ終了を通知
        if ((window as any).__unifiedSimulationHandleDragEnd) {
          (window as any).__unifiedSimulationHandleDragEnd(node.id)
        }
        // ステージのドラッグを再度有効化
        const stage = e.target.getStage()
        if (stage) {
          stage.draggable(true)
        }
        e.cancelBubble = true
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ノードの形状 */}
      {isSquare ? (
        <Rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          {...style}
          cornerRadius={8}
        />
      ) : (
        <Circle
          x={0}
          y={0}
          radius={size / 2}
          {...style}
        />
      )}
      
      {/* ボタンノードのアイコンを描画 */}
      {(node.type === 'tag_button' || node.type === 'new_memo_button') && (
        <Group listening={false}>
          <Line
            points={[-8, 0, 8, 0]}
            stroke="#4B5563"
            strokeWidth={2}
            lineCap="round"
          />
          <Line
            points={[0, -8, 0, 8]}
            stroke="#4B5563"
            strokeWidth={2}
            lineCap="round"
          />
        </Group>
      )}
      
      {node.type === 'delete_button' && (
        <Group listening={false}>
          <Line
            points={[-6, -6, 6, 6]}
            stroke="#DC2626"
            strokeWidth={3}
            lineCap="round"
          />
          <Line
            points={[-6, 6, 6, -6]}
            stroke="#DC2626"
            strokeWidth={3}
            lineCap="round"
          />
        </Group>
      )}
      
      {node.type === 'project_button' && (
        <Group listening={false}>
          <Line
            points={[-6, -6, 4, 0, -6, 6]}
            stroke="#2563EB"
            strokeWidth={3}
            lineCap="round"
            lineJoin="round"
            fill="transparent"
          />
        </Group>
      )}
      
      {/* Researchボタンのアイコン（虫眼鏡） */}
      {node.type === 'research_button' && (
        <Group listening={false}>
          <Circle
            x={-3}
            y={-3}
            radius={6}
            stroke="#F59E0B"
            strokeWidth={2}
            fill="transparent"
          />
          <Line
            points={[2, 2, 8, 8]}
            stroke="#F59E0B"
            strokeWidth={2}
            lineCap="round"
          />
        </Group>
      )}
      
      {/* メモリンクボタンのアイコン（チェーン） */}
      {node.type === 'memo_link_button' && (
        <Group listening={false}>
          <Rect
            x={-7}
            y={-3}
            width={6}
            height={6}
            stroke="#6366F1"
            strokeWidth={2}
            fill="transparent"
            rotation={45}
          />
          <Rect
            x={1}
            y={-3}
            width={6}
            height={6}
            stroke="#6366F1"
            strokeWidth={2}
            fill="transparent"
            rotation={45}
          />
        </Group>
      )}

      {/* ビルドボタンのアイコン（下矢印） */}
      {node.type === 'build_button' && (
        <Group listening={false}>
          <Line
            points={[0, -8, 0, 6]}
            stroke="#10B981"
            strokeWidth={3}
            lineCap="round"
          />
          <Line
            points={[-6, 0, 0, 6, 6, 0]}
            stroke="#10B981"
            strokeWidth={3}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}

      {/* タスクリンクボタンのアイコン（チェーン） */}
      {node.type === 'task_link_button' && (
        <Group listening={false}>
          <Text
            x={-8}
            y={-8}
            text="🔗"
            fontSize={16}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* タスク追加ボタンのアイコン（プラス） */}
      {node.type === 'add_task_button' && (
        <Group listening={false}>
          <Line
            points={[-6, 0, 6, 0]}
            stroke="#3B82F6"
            strokeWidth={3}
            lineCap="round"
          />
          <Line
            points={[0, -6, 0, 6]}
            stroke="#3B82F6"
            strokeWidth={3}
            lineCap="round"
          />
        </Group>
      )}

      {/* ステータスボタンのアイコン（半円） */}
      {node.type === 'status_button' && (
        <Group listening={false}>
          <Text
            x={-8}
            y={-8}
            text="◐"
            fontSize={16}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* MVPボタンのアイコン（星） */}
      {node.type === 'mvp_button' && (
        <Group listening={false}>
          <Text
            x={-8}
            y={-8}
            text="⭐"
            fontSize={16}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* デバッグボタンのアイコン（早送り） */}
      {node.type === 'debug_button' && (
        <Group listening={false}>
          <Text
            x={-8}
            y={-8}
            text="⏩"
            fontSize={16}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}
      
      
      {/* 選択時のハイライト */}
      {selected && (
        <Circle
          x={0}
          y={0}
          radius={size / 2 + 5}
          stroke="#3B82F6"
          strokeWidth={3}
          fill="transparent"
        />
      )}
      
      {/* リンク作成モードのハイライト */}
      {isLinkSource && (
        <Circle
          x={0}
          y={0}
          radius={size / 2 + 8}
          stroke="#10B981"
          strokeWidth={3}
          fill="transparent"
          dash={[5, 5]}
        />
      )}
      
      {/* リンク可能ノードのハイライト */}
      {canBeLinked && (
        <Circle
          x={0}
          y={0}
          radius={size / 2 + 5}
          stroke="#F59E0B"
          strokeWidth={2}
          fill="transparent"
          opacity={0.5}
        />
      )}
      
      {/* ノードのラベル（新規作成ボタンには表示しない） */}
      {node.type !== 'new_memo_button' && (
        <Text
          x={-size / 2}
          y={isTag ? -6 : size / 2 + 5}
          width={size}
          text={node.title}
          fontSize={isTag ? 10 : 12}
          align="center"
          verticalAlign={isTag ? 'middle' : 'top'}
          fill={isTag ? '#ffffff' : '#000000'}
        />
      )}
      
    </Group>
  )
}