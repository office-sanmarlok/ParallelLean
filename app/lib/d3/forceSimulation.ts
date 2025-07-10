import * as d3 from 'd3'
import type { Node, Edge } from '@/src/types/database'
import { applyAreaConstraint, getNodeSize } from '@/app/lib/graph/layout'

export interface SimulationNode extends Node {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface SimulationLink extends Edge {
  source: string | SimulationNode
  target: string | SimulationNode
}

// Force Simulationの作成
export function createForceSimulation(
  nodes: SimulationNode[],
  links: SimulationLink[]
) {
  const simulation = d3.forceSimulation<SimulationNode>(nodes)
    .force('link', d3.forceLink<SimulationNode, SimulationLink>(links)
      .id(d => d.id)
      .distance(100)
      .strength(0.5)
    )
    .force('charge', d3.forceManyBody<SimulationNode>()
      .strength(d => d.area === 'knowledge_base' ? -300 : -100)
    )
    .force('collision', d3.forceCollide<SimulationNode>()
      .radius(d => getNodeSize(d) / 2 + 10)
    )
    .force('x', d3.forceX<SimulationNode>()
      .x(d => d.x || 0)
      .strength(0.05)
    )
    .force('y', d3.forceY<SimulationNode>()
      .y(d => d.y || 0)
      .strength(0.1)
    )

  // 各ティックで制約を適用
  simulation.on('tick', () => {
    nodes.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        // エリア制約を適用
        const constrained = applyAreaConstraint(node, { x: node.x, y: node.y })
        
        node.x = constrained.x
        node.y = constrained.y
      }
    })
  })

  return simulation
}

// KnowledgeBase/IdeaStock共通のシミュレーションパラメータ
const COMMON_SIMULATION_PARAMS = {
  linkDistance: 80,
  linkStrength: 0.5,
  chargeStrength: -50,
  chargeDistanceMax: 150,
  collisionPadding: 10,
  collisionStrength: 0.7,
  collisionIterations: 2,
  velocityDecay: 0.6,
  alphaDecay: 0.028,    // もう少し早く収束させる
  alphaMin: 0.001,
  alphaTarget: 0
}

// エリア別のシミュレーション作成（共通パラメータ使用）
function createAreaSimulation(
  nodes: SimulationNode[],
  links: SimulationLink[],
  area: 'knowledge_base' | 'idea_stock'
) {
  const areaNodes = nodes.filter(n => n.area === area)
  const areaLinks = links.filter(l => {
    const sourceNode = typeof l.source === 'object' ? l.source : nodes.find(n => n.id === l.source)
    const targetNode = typeof l.target === 'object' ? l.target : nodes.find(n => n.id === l.target)
    return sourceNode?.area === area && targetNode?.area === area
  })

  return d3.forceSimulation<SimulationNode>(areaNodes)
    .force('link', d3.forceLink<SimulationNode, SimulationLink>(areaLinks)
      .id(d => d.id)
      .distance(COMMON_SIMULATION_PARAMS.linkDistance)
      .strength(COMMON_SIMULATION_PARAMS.linkStrength)
    )
    .force('charge', d3.forceManyBody<SimulationNode>()
      .strength(COMMON_SIMULATION_PARAMS.chargeStrength)
      .distanceMax(COMMON_SIMULATION_PARAMS.chargeDistanceMax)
    )
    .force('collision', d3.forceCollide<SimulationNode>()
      .radius(d => getNodeSize(d) / 2 + COMMON_SIMULATION_PARAMS.collisionPadding)
      .strength(COMMON_SIMULATION_PARAMS.collisionStrength)
      .iterations(COMMON_SIMULATION_PARAMS.collisionIterations)
    )
    .velocityDecay(COMMON_SIMULATION_PARAMS.velocityDecay)
    .alphaDecay(COMMON_SIMULATION_PARAMS.alphaDecay)
    .alphaMin(COMMON_SIMULATION_PARAMS.alphaMin)
    .alphaTarget(COMMON_SIMULATION_PARAMS.alphaTarget)
}

// KnowledgeBaseエリア専用のシミュレーション
export function createKnowledgeBaseSimulation(
  nodes: SimulationNode[],
  links: SimulationLink[]
) {
  return createAreaSimulation(nodes, links, 'knowledge_base')
}

// IdeaStockエリア専用のシミュレーション
export function createIdeaStockSimulation(
  nodes: SimulationNode[],
  links: SimulationLink[]
) {
  return createAreaSimulation(nodes, links, 'idea_stock')
}