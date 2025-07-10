'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createIdeaStockSimulation, type SimulationNode, type SimulationLink } from '@/app/lib/d3/forceSimulation'
import { useStableNodeReference } from './useStableNodeReference'

export function useIdeaStockSimulation() {
  const simulationRef = useRef<any>(null)
  const { nodes, edges, virtualNodes, updateVirtualNode } = useGraphStore()
  const draggedNodesRef = useRef<Set<string>>(new Set())
  const nodeVelocitiesRef = useRef<Map<string, { vx: number, vy: number }>>(new Map())
  
  // 構造的な変更のみを検出
  const structuralTimestamp = useStableNodeReference(nodes, edges, virtualNodes)
  
  // ドラッグ中のノードを追跡
  useEffect(() => {
    const handleDragStart = (nodeId: string) => {
      draggedNodesRef.current.add(nodeId)
      if (simulationRef.current) {
        // ドラッグ中はシミュレーションを活性化（より控えめに）
        simulationRef.current.alphaTarget(0.1).restart()
      }
    }
    
    const handleDragMove = (nodeId: string, position: { x: number; y: number }) => {
      if (simulationRef.current) {
        // ドラッグ中のノードの位置を即座に更新
        const node = simulationRef.current.nodes().find((n: SimulationNode) => n.id === nodeId)
        if (node) {
          node.x = position.x
          node.y = position.y
          node.fx = position.x  // 固定位置として設定
          node.fy = position.y
        }
      }
    }
    
    const handleDragEnd = (nodeId: string) => {
      draggedNodesRef.current.delete(nodeId)
      if (simulationRef.current) {
        // ドラッグ終了時に固定を解除
        const node = simulationRef.current.nodes().find((n: SimulationNode) => n.id === nodeId)
        if (node) {
          node.fx = null
          node.fy = null
          // 速度を保存
          if (node.vx !== undefined && node.vy !== undefined) {
            nodeVelocitiesRef.current.set(nodeId, { vx: node.vx, vy: node.vy })
          }
        }
        
        // シミュレーションをゆっくり減速
        if (draggedNodesRef.current.size === 0) {
          simulationRef.current.alphaTarget(0)
        }
      }
    }
    
    // グローバルにドラッグイベントハンドラーを公開
    (window as any).__ideaStockSimulationDragStart = handleDragStart;
    (window as any).__ideaStockSimulationDragMove = handleDragMove;
    (window as any).__ideaStockSimulationDragEnd = handleDragEnd;
    
    return () => {
      delete (window as any).__ideaStockSimulationDragStart;
      delete (window as any).__ideaStockSimulationDragMove;
      delete (window as any).__ideaStockSimulationDragEnd;
    }
  }, [])
  
  useEffect(() => {
    // IdeaStockエリアのノードとボタンノードを抽出
    const isNodes = [...nodes.filter(n => n.area === 'idea_stock'), ...virtualNodes.filter(n => n.area === 'idea_stock')]
    const isNodeIds = new Set(isNodes.map(n => n.id))
    const isEdges = edges.filter(e => 
      isNodeIds.has(e.source_id) && isNodeIds.has(e.target_id)
    )
    
    // ボタンノード用のエッジを追加
    if (virtualNodes.length > 0 && useGraphStore.getState().selectedNode) {
      const selectedNode = useGraphStore.getState().selectedNode!
      virtualNodes.filter(n => n.area === 'idea_stock').forEach((buttonNode, index) => {
        isEdges.push({
          id: `virtual-edge-is-${index}`,
          source_id: selectedNode.id,
          target_id: buttonNode.id,
          type: 'tag',
          is_branch: false,
          is_merge: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
      })
    }

    if (isNodes.length === 0) return

    // シミュレーション用のノードを準備
    const simulationNodes: SimulationNode[] = isNodes.map(node => {
      const velocity = nodeVelocitiesRef.current.get(node.id)
      return {
        ...node,
        x: typeof node.position === 'object' && node.position !== null
          ? (node.position as any).x
          : Math.random() * 1000,
        y: typeof node.position === 'object' && node.position !== null  
          ? (node.position as any).y
          : Math.random() * 400 + 400, // IdeaStockエリアの位置
        vx: velocity?.vx,
        vy: velocity?.vy
      }
    })

    // シミュレーション用のリンクを準備
    const simulationLinks: SimulationLink[] = isEdges.map(edge => ({
      ...edge,
      source: edge.source_id,
      target: edge.target_id
    }))

    // 既存のシミュレーションを停止
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // 新しいシミュレーションを作成
    const simulation = createIdeaStockSimulation(simulationNodes, simulationLinks)
    
    // 明示的にalphaTargetを0に設定（初期状態で動かないように）
    simulation.alphaTarget(0)
    
    
    // ノードの位置が更新されたらストアに反映
    simulation.on('tick', () => {
      
      simulationNodes.forEach((node) => {
        // ドラッグ中のノードはスキップ
        if (draggedNodesRef.current.has(node.id)) {
          return
        }
        
        if (node.x !== undefined && node.y !== undefined && 
            !isNaN(node.x) && !isNaN(node.y)) {
          // 速度情報を保存
          if (node.vx !== undefined && node.vy !== undefined) {
            nodeVelocitiesRef.current.set(node.id, { vx: node.vx, vy: node.vy })
          }
          
          // ストアのノードを更新
          if (node.id.startsWith('virtual-')) {
            updateVirtualNode(node.id, {
              position: { x: node.x, y: node.y }
            })
          } else {
            useGraphStore.getState().updateNode(node.id, {
              position: { x: node.x, y: node.y }
            })
          }
        }
      })
    })

    simulationRef.current = simulation

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
        simulationRef.current = null
      }
    }
  }, [structuralTimestamp]) // 構造的な変更があった時のみ再作成
}