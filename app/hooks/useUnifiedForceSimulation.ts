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
    const simulationNodes = allNodes.map((node) => {
      const pos =
        typeof node.position === 'object' && node.position !== null
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

    // ボタンノード用の仮想エッジを作成
    const virtualEdges: any[] = []
    virtualNodes.forEach((vNode) => {
      const metadata = vNode.metadata as any
      if (metadata?.parentId) {
        virtualEdges.push({
          id: `virtual-edge-${vNode.id}`,
          source_id: metadata.parentId,
          target_id: vNode.id,
          type: 'virtual',
          is_branch: false,
          is_merge: false,
          created_at: new Date().toISOString(),
          branch_from: null,
          merge_to: null,
        })
      }
    })

    // エッジをシミュレーション用に変換（通常のエッジ + 仮想エッジ）
    const simulationEdges = [...edges, ...virtualEdges]
      .filter((e) => {
        const source = simulationNodes.find((n) => n.id === e.source_id)
        const target = simulationNodes.find((n) => n.id === e.target_id)
        return source && target
      })
      .map((e) => ({
        ...e,
        source: e.source_id,
        target: e.target_id,
      }))

    // 既存のシミュレーションがあれば停止
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    // ノード数に応じてパラメータを調整（パフォーマンス最適化）
    const nodeCount = simulationNodes.length
    const collisionStrength = nodeCount > 100 ? 0.6 : 0.8
    const alphaDecayRate = nodeCount > 100 ? 0.05 : 0.03
    
    // 新しいシミュレーションを作成
    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      // IdeaStockエリアのノード間に反発力を追加
      .force('charge', d3.forceManyBody()
        .strength((d: SimulationNode) => {
          // IdeaStockエリアのProposal/Researchは強い反発力
          if (d.area === 'idea_stock' && (d.type === 'proposal' || d.type === 'research')) {
            return -500 // 強い反発力でProposal同士を離す
          }
          // その他のノードは通常の反発力
          return -100
        })
      )
      // ノード間の衝突回避（全ノード共通）
      .force(
        'collision',
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => {
            // IdeaStockエリアのProposal/Researchは衝突半径を大きくする
            if (d.area === 'idea_stock' && (d.type === 'proposal' || d.type === 'research')) {
              return getNodeSize(d) / 2 + 30 // より大きな間隔を保つ
            }
            return getNodeSize(d) / 2 + 10
          })
          .strength(collisionStrength)
      )
      // エッジによるリンク力
      .force(
        'link',
        d3
          .forceLink(simulationEdges)
          .id((d: any) => d.id)
          .distance((d) => {
            const source = simulationNodes.find((n) => n.id === (d as any).source.id)
            const target = simulationNodes.find((n) => n.id === (d as any).target.id)

            // 仮想エッジ（ボタンノード）は短めの距離
            if ((d as any).type === 'virtual') {
              return 80
            }
            
            // ISTagとProposal/Research間の距離を大きくする（Proposal同士が離れるように）
            if (
              (source?.type === 'is_tag' && (target?.type === 'proposal' || target?.type === 'research')) ||
              ((source?.type === 'proposal' || source?.type === 'research') && target?.type === 'is_tag')
            ) {
              return 200 // 十分な距離を保つ
            }
            
            // ProposalとTask間は非常に長い距離
            if (
              (source?.type === 'proposal' && target?.type === 'task') ||
              (source?.type === 'task' && target?.type === 'proposal')
            ) {
              return 500
            }

            // エリアが異なる場合は長めの距離
            if (source?.area !== target?.area) {
              return 300
            }
            // Task間の依存関係は短めの距離
            if ((d as any).type === 'dependency' && source?.type === 'task' && target?.type === 'task') {
              return 80  // 100 → 80 に短縮
            }
            
            // 同じエリア内の場合
            return 100
          })
          .strength((d) => {
            const source = simulationNodes.find((n) => n.id === (d as any).source.id)
            const target = simulationNodes.find((n) => n.id === (d as any).target.id)

            // 仮想エッジ（ボタンノード）は強い結合
            if ((d as any).type === 'virtual') {
              return 0.9
            }

            // ProposalとTask間のリンクは非常に弱くする
            if (
              (source?.type === 'proposal' && target?.type === 'task') ||
              (source?.type === 'task' && target?.type === 'proposal')
            ) {
              return 0.05
            }

            // ISTagとProposal/Research間のリンクは非常に弱くする（Proposal同士が離れるように）
            if (
              (source?.type === 'is_tag' && (target?.type === 'proposal' || target?.type === 'research')) ||
              ((source?.type === 'proposal' || source?.type === 'research') && target?.type === 'is_tag')
            ) {
              return 0.05 // 0.3 → 0.05 に弱める
            }

            // エリアをまたぐリンクは弱い結合
            if (source?.area !== target?.area) {
              return 0.1
            }

            // flow タイプのエッジは強い結合
            if ((d as any).type === 'flow') {
              return 0.8
            }
            
            // Task間の依存関係は強い結合
            if ((d as any).type === 'dependency' && source?.type === 'task' && target?.type === 'task') {
              return 0.7  // 0.3 → 0.7 に強化
            }

            // その他のエッジは弱い結合
            return 0.3
          })
      )
      // ノードタイプごとの力を適用
      .force('custom', () => {
        simulationNodes.forEach((node) => {
          if (!node.x || !node.y) return

          const areaBounds = getAreaBounds(node.area)

          // KnowledgeBaseエリアのノード（ボタンノード含む）：自由配置（力なし）
          if (node.area === 'knowledge_base') {
            // 何も力を適用しない
          }

          // IdeaStockエリアのノード
          else if (node.area === 'idea_stock') {
            // Proposalノードは中央に引き寄せる（Y軸のみ）
            if (node.type === 'proposal') {
              const centerY = (areaBounds.minY + areaBounds.maxY) / 2
              const yDiff = centerY - (node.y || 0)
              // Y軸方向にのみ中央に引き寄せる力を適用
              node.vy = (node.vy || 0) + yDiff * 0.05 // 弱い力で中央に
            }
            // Research、ISTagは自由配置
          }

          // BuildエリアのTaskノード：下方向への重力
          else if (node.area === 'build' && node.type === 'task') {
            // 下方向への重力のみ
            node.vy = (node.vy || 0) + 2

            // 親ノードの下に引っ張る
            const parentEdges = simulationEdges.filter((e) => e.target_id === node.id)
            if (parentEdges.length > 0) {
              const parentNode = simulationNodes.find((n) => n.id === parentEdges[0].source_id)
              if (parentNode && parentNode.y !== undefined && node.y !== undefined) {
                const targetY = parentNode.y + 150
                const yDiff = targetY - node.y
                node.vy = (node.vy || 0) + yDiff * 0.1
              }
            }
          }

          // エリア境界内に制限（パディングを小さく）
          node.x = Math.max(areaBounds.minX + 30, Math.min(node.x, areaBounds.maxX - 30))
          node.y = Math.max(areaBounds.minY + 30, Math.min(node.y, areaBounds.maxY - 30))
        })
      })
      // 速度減衰（早く安定するように調整）
      .velocityDecay(0.7)
      .alphaDecay(alphaDecayRate)
      .alphaMin(0.001)

    // シミュレーションのティックごとに位置を更新
    simulation.on('tick', () => {
      simulationNodes.forEach((node) => {
        if (node.x !== undefined && node.y !== undefined) {
          // 位置が大きく変わった場合のみ更新
          const currentPos =
            typeof node.position === 'object' && node.position !== null
              ? (node.position as any)
              : { x: 0, y: 0 }

          if (Math.abs(currentPos.x - node.x) > 3 || Math.abs(currentPos.y - node.y) > 3) {
            // バーチャルノードかどうかで更新方法を分ける
            if (node.id.startsWith('virtual-')) {
              updateVirtualNode(node.id, {
                position: { x: node.x, y: node.y },
              })
            } else {
              updateNode(node.id, {
                position: { x: node.x, y: node.y },
              })
            }
          }
        }
      })
    })

    simulationRef.current = simulation
    
    // グローバルにシミュレーションを保存（アニメーション制御のため）
    ;(window as any).__d3Simulation = simulation

    // ドラッグ中はノードを固定
    const handleNodeDrag = (nodeId: string, x: number, y: number) => {
      const draggedNode = simulationNodes.find((n) => n.id === nodeId)
      if (draggedNode) {
        draggedNode.fx = x
        draggedNode.fy = y
        simulation.alphaTarget(0.3).restart()
      }
    }

    const handleNodeDragEnd = (nodeId: string) => {
      const draggedNode = simulationNodes.find((n) => n.id === nodeId)
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
      delete (window as any).__d3Simulation
    }
  }, [nodes.length, edges.length, virtualNodes.length]) // ノード・エッジ・バーチャルノードの数が変わったときのみ再計算

  // ノードの位置が更新されたときにシミュレーション内のノードも更新
  useEffect(() => {
    if (!simulationRef.current) return

    const simulationNodes = simulationRef.current.nodes()

    // 各ノードの位置を更新
    nodes.forEach((node) => {
      const simNode = simulationNodes.find((n: SimulationNode) => n.id === node.id)
      if (simNode) {
        const pos =
          typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 0, y: 0 }

        // ドラッグ中でない場合のみ位置を更新
        if (simNode.fx === null || simNode.fx === undefined) {
          simNode.x = pos.x
          simNode.y = pos.y
        }
      }
    })

    virtualNodes.forEach((node) => {
      const simNode = simulationNodes.find((n: SimulationNode) => n.id === node.id)
      if (simNode) {
        const pos =
          typeof node.position === 'object' && node.position !== null
            ? (node.position as any)
            : { x: 0, y: 0 }

        simNode.x = pos.x
        simNode.y = pos.y
      }
    })

    // シミュレーションを再開（アルファ値は低めに）
    simulationRef.current.alpha(0.1).restart()
  }, [nodes, virtualNodes])
}
