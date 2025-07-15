'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useGraphStore } from '@/app/stores/graphStore'
import { getAreaBounds } from '@/app/lib/graph/layout'

interface MeasurementPeriodModalProps {
  isOpen: boolean
  mvpNodeId: string | null
  onClose: () => void
}

export function MeasurementPeriodModal({
  isOpen,
  mvpNodeId,
  onClose,
}: MeasurementPeriodModalProps) {
  const [period, setPeriod] = useState(30) // デフォルト30日
  const [isCreating, setIsCreating] = useState(false)
  const { nodes, addNode, addEdge } = useGraphStore()
  const supabase = createClient()

  if (!isOpen || !mvpNodeId) {
    return null
  }

  const mvpNode = nodes.find((n) => n.id === mvpNodeId)
  if (!mvpNode) {
    return null
  }

  const handleSubmit = async () => {
    if (period < 1 || period > 365) {
      alert('計測期間は1〜365日の間で設定してください')
      return
    }

    setIsCreating(true)

    try {
      const mvpPos =
        typeof mvpNode.position === 'object' && mvpNode.position !== null
          ? (mvpNode.position as any)
          : { x: 0, y: 0 }

      // Dashboardノードを作成
      const { data: dashboardNode, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          type: 'dashboard',
          area: 'measure',
          title: `${mvpNode.title} - Dashboard`,
          content: `# ${mvpNode.title} ダッシュボード\n\n## 計測期間: ${period}日\n\n## KPI\n\n## データ分析\n`,
          position: {
            x: mvpPos.x + 200, // MVPノードの右側に配置
            y: mvpPos.y,
          },
          metadata: {
            measurementPeriodDays: period,
            measurementStartDate: new Date().toISOString(),
            measurementEndDate: new Date(Date.now() + period * 24 * 60 * 60 * 1000).toISOString(),
          },
        })
        .select()
        .single()

      if (nodeError) throw nodeError

      // エッジを作成（MVPからDashboardへ）
      const { data: edge, error: edgeError } = await supabase
        .from('edges')
        .insert({
          source_id: mvpNodeId,
          target_id: dashboardNode.id,
          type: 'reference',
        })
        .select()
        .single()

      if (edgeError) throw edgeError

      // ストアに追加
      addNode(dashboardNode)
      if (edge) addEdge(edge)

      console.log(`計測期間${period}日でDashboardノードを作成しました`)

      // モーダルを閉じる
      onClose()
    } catch (error) {
      console.error('Failed to create dashboard:', error)
      alert('Dashboardノードの作成に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  console.log('Modal rendering with MVP node:', mvpNode)

  return (
    <>
      {/* 背景のオーバーレイ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998,
        }}
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          width: '400px',
          zIndex: 99999,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2
          style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1F2937' }}
        >
          計測期間の設定
        </h2>

        <p style={{ color: '#6B7280', marginBottom: '16px' }}>
          MVPの計測期間を設定してください。この期間が経過すると、MVPノードとDashboardノードはLearnエリアに移動します。
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            計測期間（日数）
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={period}
            onChange={(e) => setPeriod(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '16px',
            }}
          />
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
            1〜365日の間で設定可能（デフォルト: 30日）
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isCreating}
            style={{
              padding: '8px 16px',
              color: '#4B5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.5 : 1,
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.5 : 1,
            }}
          >
            {isCreating ? '作成中...' : 'Dashboardを作成'}
          </button>
        </div>
      </div>
    </>
  )
}
