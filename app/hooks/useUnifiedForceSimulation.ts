'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useGraphStore } from '@/app/stores/graphStore'
import type { SimulationNode } from '@/app/lib/d3/forceSimulation'
import { getAreaBounds, getNodeSize } from '@/app/lib/graph/layout'

export function useUnifiedForceSimulation() {
  const { nodes, edges, updateNode, virtualNodes, updateVirtualNode } = useGraphStore()
  const simulationRef = useRef<d3.Simulation<SimulationNode, never> | null>(null)

  useEffect(() => {
    // シミュレーション対象のノード（通常ノード + バーチャルノード）
    const allNodes = [...nodes, ...virtualNodes]
    const simulationNodes = allNodes
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

    if (simulationNodes.length === 0) {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
      return
    }

    // エッジをシミュレーション用に変換
    const simulationEdges = edges
      .filter(e => {
        const source = simulationNodes.find(n => n.id === e.source_id)
        const target = simulationNodes.find(n => n.id === e.target_id)
        return source && target
      })
      .map(e => ({
        ...e,
        source: e.source_id,
        target: e.target_id
      }))

    // 既存のシミュレーションがあれば停止
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // 新しいシミュレーションを作成
    const simulation = d3.forceSimulation<SimulationNode>(simulationNodes)
      // ノード間の衝突回避（全ノード共通）
      .force('collision', d3.forceCollide<SimulationNode>()
        .radius(d => getNodeSize(d) / 2 + 10)
        .strength(0.8)
      )
      // エッジによるリンク力
      .force('link', d3.forceLink(simulationEdges)
        .id((d: any) => d.id)
        .distance(d => {
          const source = simulationNodes.find(n => n.id === (d as any).source.id)
          const target = simulationNodes.find(n => n.id === (d as any).target.id)
          
          // エリアが異なる場合は長めの距離
          if (source?.area !== target?.area) {
            return 200
          }
          // 同じエリア内の場合
          return 100
        })
        .strength(d => {
          const source = simulationNodes.find(n => n.id === (d as any).source.id)
          const target = simulationNodes.find(n => n.id === (d as any).target.id)
          
          // flow タイプのエッジは強い結合
          if ((d as any).type === 'flow') {
            return 0.8
          }
          // その他のエッジは弱い結合
          return 0.3
        })
      )
      // ノードタイプごとの力を適用
      .force('custom', () => {
        simulationNodes.forEach(node => {
          if (!node.x || !node.y) return
          
          const areaBounds = getAreaBounds(node.area)
          
          // ボタンノード：親ノードに追従（固定位置）
          if (node.id.startsWith('virtual-') || node.type.includes('button')) {
            // 親ノードを探す
            const parentEdges = simulationEdges.filter(e => e.target_id === node.id)
            if (parentEdges.length > 0) {
              const parentNode = simulationNodes.find(n => n.id === parentEdges[0].source_id)
              if (parentNode && parentNode.x !== undefined && parentNode.y !== undefined) {
                // ボタンの種類に応じて相対位置を設定
                let offsetX = 100, offsetY = 0
                
                if (node.id.includes('delete')) {
                  offsetY = node.area === 'build' ? -60 : 0
                } else if (node.id.includes('tag')) {
                  offsetY = node.area === 'build' ? -60 : -50
                } else if (node.id.includes('add')) {
                  offsetY = node.area === 'build' ? -20 : 0
                } else if (node.id.includes('link')) {
                  offsetY = 20
                } else if (node.id.includes('status')) {
                  offsetY = 60
                } else if (node.id.includes('project')) {
                  offsetY = 50
                } else if (node.id.includes('research')) {
                  offsetY = 0
                } else if (node.id.includes('memo')) {
                  offsetY = 40
                } else if (node.id.includes('build')) {
                  offsetY = 80
                } else if (node.id.includes('mvp')) {
                  offsetY = 100
                }
                
                // Taskノードのボタンは右側に配置
                if (parentNode.type === 'task') {
                  offsetX = 80
                }
                
                // 親ノードの位置に基づいて配置
                node.x = parentNode.x + offsetX
                node.y = parentNode.y + offsetY
                
                // 速度をリセット
                node.vx = 0
                node.vy = 0
              }
            }
          }
          
          // KnowledgeBaseエリアのノード：自由配置（力なし）
          else if (node.area === 'knowledge_base') {
            // 何も力を適用しない
          }
          
          // IdeaStockエリアのノード：自由配置（力なし）
          else if (node.area === 'idea_stock') {
            // 何も力を適用しない
          }
          
          // BuildエリアのTaskノード：下方向への重力
          else if (node.area === 'build' && node.type === 'task') {
            // 下方向への重力のみ
            node.vy = (node.vy || 0) + 2
            
            // 親ノードの下に引っ張る
            const parentEdges = simulationEdges.filter(e => e.target_id === node.id)
            if (parentEdges.length > 0) {
              const parentNode = simulationNodes.find(n => n.id === parentEdges[0].source_id)
              if (parentNode && parentNode.y !== undefined && node.y !== undefined) {
                const targetY = parentNode.y + 150
                const yDiff = targetY - node.y
                node.vy = (node.vy || 0) + yDiff * 0.1
              }
            }
          }
          
          // エリア境界内に制限（パディングに合わせて調整）
          node.x = Math.max(areaBounds.minX + 100, Math.min(node.x, areaBounds.maxX - 100))
          node.y = Math.max(areaBounds.minY + 100, Math.min(node.y, areaBounds.maxY - 100))
        })
      })
      // 速度減衰
      .velocityDecay(0.6)
      .alphaDecay(0.02)
      .alphaMin(0.001)

    // シミュレーションのティックごとに位置を更新
    simulation.on('tick', () => {
      simulationNodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          // 位置が大きく変わった場合のみ更新
          const currentPos = typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 0, y: 0 }
          
          if (Math.abs(currentPos.x - node.x) > 1 || Math.abs(currentPos.y - node.y) > 1) {
            // バーチャルノードかどうかで更新方法を分ける
            if (node.id.startsWith('virtual-')) {
              updateVirtualNode(node.id, {
                position: { x: node.x, y: node.y }
              })
            } else {
              updateNode(node.id, {
                position: { x: node.x, y: node.y }
              })
            }
          }
        }
      })
    })

    simulationRef.current = simulation

    // ドラッグ中はノードを固定
    const handleNodeDrag = (nodeId: string, x: number, y: number) => {
      const draggedNode = simulationNodes.find(n => n.id === nodeId)
      if (draggedNode) {
        draggedNode.fx = x
        draggedNode.fy = y
        simulation.alphaTarget(0.3).restart()
      }
    }

    const handleNodeDragEnd = (nodeId: string) => {
      const draggedNode = simulationNodes.find(n => n.id === nodeId)
      if (draggedNode) {
        draggedNode.fx = null
        draggedNode.fy = null
        simulation.alphaTarget(0)
      }
    }

    // グローバルイベントリスナー
    ;(window as any).__unifiedSimulationHandleDrag = handleNodeDrag
    ;(window as any).__unifiedSimulationHandleDragEnd = handleNodeDragEnd

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
      delete (window as any).__unifiedSimulationHandleDrag
      delete (window as any).__unifiedSimulationHandleDragEnd
    }
  }, [nodes.length, edges.length, virtualNodes.length]) // ノード・エッジ・バーチャルノードの数が変わったときのみ再計算
}