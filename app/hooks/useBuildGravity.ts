'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useGraphStore } from '@/app/stores/graphStore'
import type { SimulationNode } from '@/app/lib/d3/forceSimulation'
import { getAreaBounds } from '@/app/lib/graph/layout'

export function useBuildGravity() {
  const { nodes, edges, updateNode } = useGraphStore()
  const simulationRef = useRef<d3.Simulation<SimulationNode, never> | null>(null)

  useEffect(() => {
    // BuildエリアのTaskノードのみを対象にする
    const buildNodes = nodes
      .filter(n => n.area === 'build' && n.type === 'task')
      .map(node => {
        const pos = typeof node.position === 'object' && node.position !== null
          ? (node.position as any)
          : { x: 0, y: 0 }
        
        return {
          ...node,
          x: pos.x,
          y: pos.y,
        } as SimulationNode
      })

    if (buildNodes.length === 0) {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
      return
    }

    // エッジをシミュレーション用に変換
    const buildEdges = edges
      .filter(e => {
        const source = buildNodes.find(n => n.id === e.source_id)
        const target = buildNodes.find(n => n.id === e.target_id)
        return source && target
      })
      .map(e => ({
        ...e,
        source: e.source_id,
        target: e.target_id
      }))

    // Buildエリアの境界
    const buildBounds = getAreaBounds('build')

    // 既存のシミュレーションがあれば停止
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // 新しいシミュレーションを作成
    const simulation = d3.forceSimulation<SimulationNode>(buildNodes)
      // エッジによるリンク力（タスク間の距離を保つ）
      .force('link', d3.forceLink(buildEdges)
        .id((d: any) => d.id)
        .distance(150)
        .strength(0.8)
      )
      // ノード間の衝突回避
      .force('collision', d3.forceCollide()
        .radius(50)
        .strength(0.8)
      )
      // 下方向への重力
      .force('gravity', d3.forceY()
        .y((d: SimulationNode) => {
          // 親ノードがある場合は、親の下に引っ張られる
          const parentEdges = edges.filter(e => e.target_id === d.id)
          if (parentEdges.length > 0) {
            const parentNode = buildNodes.find(n => n.id === parentEdges[0].source_id)
            if (parentNode && parentNode.y !== undefined) {
              return parentNode.y + 150 // 親の150px下
            }
          }
          return d.y || buildBounds.minY + 100
        })
        .strength(0.3)
      )
      // X軸の中心への引力（左右に散らばりすぎないように）
      .force('centerX', d3.forceX()
        .x(1000) // 中央に寄せる
        .strength(0.05)
      )
      // 速度減衰
      .velocityDecay(0.6)
      .alphaDecay(0.02)

    // シミュレーションのティックごとに位置を更新
    simulation.on('tick', () => {
      buildNodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          // エリア境界内に制限
          const constrainedX = Math.max(buildBounds.minX + 50, Math.min(node.x, buildBounds.maxX - 50))
          const constrainedY = Math.max(buildBounds.minY + 50, Math.min(node.y, buildBounds.maxY - 50))
          
          // 位置が大きく変わった場合のみ更新
          const currentPos = typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 0, y: 0 }
          
          if (Math.abs(currentPos.x - constrainedX) > 1 || Math.abs(currentPos.y - constrainedY) > 1) {
            updateNode(node.id, {
              position: { x: constrainedX, y: constrainedY }
            })
          }
        }
      })
    })

    simulationRef.current = simulation

    // ドラッグ中はシミュレーションを一時停止
    const handleNodeDrag = (nodeId: string) => {
      const draggedNode = buildNodes.find(n => n.id === nodeId)
      if (draggedNode) {
        draggedNode.fx = draggedNode.x
        draggedNode.fy = draggedNode.y
        simulation.alphaTarget(0.3).restart()
      }
    }

    const handleNodeDragEnd = (nodeId: string) => {
      const draggedNode = buildNodes.find(n => n.id === nodeId)
      if (draggedNode) {
        draggedNode.fx = null
        draggedNode.fy = null
        simulation.alphaTarget(0)
      }
    }

    // グローバルイベントリスナー（仮実装）
    ;(window as any).__buildGravityHandleDrag = handleNodeDrag
    ;(window as any).__buildGravityHandleDragEnd = handleNodeDragEnd

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
      delete (window as any).__buildGravityHandleDrag
      delete (window as any).__buildGravityHandleDragEnd
    }
  }, [nodes.length, edges.length]) // ノード・エッジの数が変わったときのみ再計算
}