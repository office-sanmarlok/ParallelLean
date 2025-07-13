'use client'

import dynamic from 'next/dynamic'
import { Loading } from '@/app/components/ui/Loading'

// Konvaコンポーネントを完全にクライアントサイドでのみロード
const GraphCanvas = dynamic(
  () => import('./GraphCanvas').then((mod) => ({ default: mod.GraphCanvas })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
)

export function GraphCanvasWrapper() {
  return <GraphCanvas />
}
