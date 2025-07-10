'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createKnowledgeBaseSimulation, type SimulationNode, type SimulationLink } from '@/app/lib/d3/forceSimulation'
import { useStableNodeReference } from './useStableNodeReference'

export function useForceSimulation() {
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
    (window as any).__forceSimulationDragStart = handleDragStart;
    (window as any).__forceSimulationDragMove = handleDragMove;
    (window as any).__forceSimulationDragEnd = handleDragEnd;
    
    return () => {
      delete (window as any).__forceSimulationDragStart;
      delete (window as any).__forceSimulationDragMove;
      delete (window as any).__forceSimulationDragEnd;
    }
  }, [])

  useEffect(() => {
    // KnowledgeBaseエリアのノードとエッジのみ抽出（ボタンノードは親ノードのエリアに関係なく含める）
    const kbNodes = [...nodes.filter(n => n.area === 'knowledge_base'), ...virtualNodes.filter(n => n.area === 'knowledge_base')]
    const kbNodeIds = new Set(kbNodes.map(n => n.id))
    const kbEdges = edges.filter(e => 
      kbNodeIds.has(e.source_id) && kbNodeIds.has(e.target_id)
    )
    
    // ボタンノード用のエッジを追加
    if (virtualNodes.length > 0 && useGraphStore.getState().selectedNode) {
      virtualNodes.forEach((buttonNode, index) => {
        kbEdges.push({
          id: `virtual-edge-${index}`,
          source_id: useGraphStore.getState().selectedNode!.id,
          target_id: buttonNode.id,
          type: 'tag',
          is_branch: false,
          is_merge: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
      })
    }

    if (kbNodes.length === 0) return

    // シミュレーション用のノードを準備
    const simulationNodes: SimulationNode[] = kbNodes.map(node => {
      const velocity = nodeVelocitiesRef.current.get(node.id)
      return {
        ...node,
        x: typeof node.position === 'object' && node.position !== null
          ? (node.position as any).x
          : Math.random() * 1000,
        y: typeof node.position === 'object' && node.position !== null  
          ? (node.position as any).y
          : Math.random() * 400,
        vx: velocity?.vx,
        vy: velocity?.vy
      }
    })

    // シミュレーション用のリンクを準備
    const simulationLinks: SimulationLink[] = kbEdges.map(edge => ({
      ...edge,
      source: edge.source_id,
      target: edge.target_id
    }))

    // 既存のシミュレーションを停止
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // 新しいシミュレーションを作成
    const simulation = createKnowledgeBaseSimulation(simulationNodes, simulationLinks)
    
    // 明示的にalphaTargetを0に設定（初期状態で動かないように）
    simulation.alphaTarget(0)
    

    // ノードの位置が更新されたらデータベースに反映
    simulation.on('tick', () => {
      // 毎フレーム更新（最大の滑らかさ）
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
          
          // ストアのノードを更新（丸めずに精密な値を保存）
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

    // シミュレーションが安定したら何もしない（座標は既にストアで管理されている）
    simulation.on('end', () => {
      // 特に処理なし
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