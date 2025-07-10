import { create } from 'zustand'
import type { Tables } from '@/src/types/database.generated'

type Node = Tables<'nodes'>
type Edge = Tables<'edges'>

interface GraphState {
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  isLoading: boolean
  linkingMode: boolean
  linkingSource: Node | null
  virtualNodes: Node[]
  
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setSelectedNode: (node: Node | null) => void
  setIsLoading: (isLoading: boolean) => void
  
  addNode: (node: Node) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  deleteNode: (id: string) => void
  
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  removeEdge: (id: string) => void
  
  
  setLinkingMode: (linkingMode: boolean) => void
  setLinkingSource: (node: Node | null) => void
  
  setVirtualNodes: (virtualNodes: Node[]) => void
  updateVirtualNode: (id: string, updates: Partial<Node>) => void
  
  refreshData?: () => Promise<void>
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  isLoading: false,
  linkingMode: false,
  linkingSource: null,
  virtualNodes: [],
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
  })),
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.source_id !== id && edge.target_id !== id),
  })),
  
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),
  
  
  setLinkingMode: (linkingMode) => set({ linkingMode }),
  setLinkingSource: (linkingSource) => set({ linkingSource }),
  
  setVirtualNodes: (virtualNodes) => set({ virtualNodes }),
  updateVirtualNode: (id, updates) => set((state) => ({
    virtualNodes: state.virtualNodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
  })),
}))