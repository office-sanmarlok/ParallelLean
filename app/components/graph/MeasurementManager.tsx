'use client'

import { useState } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'
import type { Node } from '@/src/types/database'

export function MeasurementManager() {
  const { selectedNode, addNode, addEdge } = useGraphStore()
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false)
  const [measurementPeriod, setMeasurementPeriod] = useState(7) // デフォルト7日間
  const [dashboardTitle, setDashboardTitle] = useState('')
  const supabase = createClient()

  // MVPノードが選択されている場合のみ表示
  if (!selectedNode || selectedNode.type !== 'mvp' || selectedNode.area !== 'measure') {
    return null
  }

  const createDashboard = async () => {
    if (!dashboardTitle.trim()) return

    try {
      // MVPの位置を取得
      const mvpPosition =
        typeof selectedNode.position === 'object' && selectedNode.position !== null
          ? (selectedNode.position as any)
          : { x: 500, y: 1200 }

      // Dashboardノードを作成（MVPの右側に配置）
      const { data: dashboardNode, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          type: 'dashboard',
          area: 'measure',
          title: dashboardTitle.trim(),
          position: {
            x: mvpPosition.x + 150,
            y: mvpPosition.y,
          },
          size: 80,
          metadata: {
            measurement_period_days: measurementPeriod,
            measurement_start_date: new Date().toISOString(),
            measurement_end_date: new Date(
              Date.now() + measurementPeriod * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        })
        .select()
        .single()

      if (nodeError) throw nodeError

      if (dashboardNode) {
        // ストアに追加
        addNode(dashboardNode)

        // MVPからDashboardへのエッジを作成
        const { data: edge, error: edgeError } = await supabase
          .from('edges')
          .insert({
            source_id: selectedNode.id,
            target_id: dashboardNode.id,
            type: 'measurement',
            is_branch: false,
            is_merge: false,
          })
          .select()
          .single()

        if (edgeError) throw edgeError

        if (edge) {
          addEdge(edge)
        }

        // 計測期間終了時の自動遷移をスケジュール
        scheduleMeasurementTransition(dashboardNode, measurementPeriod)
      }

      // フォームをリセット
      setDashboardTitle('')
      setIsCreatingDashboard(false)
    } catch (error) {
      console.error('Failed to create dashboard:', error)
    }
  }

  const scheduleMeasurementTransition = async (dashboardNode: Node, periodDays: number) => {
    // 実際のアプリケーションでは、サーバーサイドでスケジューリングを行う
    // ここではデモとして、ローカルでタイマーを設定
    setTimeout(
      async () => {
        // Improvementノードを自動生成
        await generateImprovement(dashboardNode)
      },
      periodDays * 24 * 60 * 60 * 1000
    )
  }

  const generateImprovement = async (dashboardNode: Node) => {
    const dashboardPosition =
      typeof dashboardNode.position === 'object' && dashboardNode.position !== null
        ? (dashboardNode.position as any)
        : { x: 650, y: 1200 }

    // Improvementノードを作成
    const { data: improvementNode, error } = await supabase
      .from('nodes')
      .insert({
        type: 'improvement',
        area: 'learn',
        title: `改善提案 - ${dashboardNode.title}`,
        position: {
          x: dashboardPosition.x,
          y: 1600, // Learnエリアの位置
        },
        size: 80,
        metadata: {
          dashboard_id: dashboardNode.id,
          created_from_measurement: true,
        },
      })
      .select()
      .single()

    if (!error && improvementNode) {
      addNode(improvementNode)

      // DashboardからImprovementへのエッジを作成
      const { data: edge } = await supabase
        .from('edges')
        .insert({
          source_id: dashboardNode.id,
          target_id: improvementNode.id,
          type: 'learning',
          is_branch: false,
          is_merge: false,
        })
        .select()
        .single()

      if (edge) {
        addEdge(edge)
      }
    }
  }

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        計測管理: {selectedNode.title}
      </h3>

      {!isCreatingDashboard ? (
        <button
          onClick={() => setIsCreatingDashboard(true)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          ダッシュボードを作成
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ダッシュボード名
            </label>
            <input
              type="text"
              value={dashboardTitle}
              onChange={(e) => setDashboardTitle(e.target.value)}
              placeholder="例: ユーザー獲得メトリクス"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              計測期間（日数）
            </label>
            <select
              value={measurementPeriod}
              onChange={(e) => setMeasurementPeriod(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={1}>1日（デモ用）</option>
              <option value={7}>7日間</option>
              <option value={14}>14日間</option>
              <option value={30}>30日間</option>
              <option value={90}>90日間</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            計測期間終了後、自動的にLearnエリアに改善提案が生成されます。
          </div>

          <div className="flex space-x-2">
            <button
              onClick={createDashboard}
              disabled={!dashboardTitle.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              作成
            </button>
            <button
              onClick={() => {
                setIsCreatingDashboard(false)
                setDashboardTitle('')
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
