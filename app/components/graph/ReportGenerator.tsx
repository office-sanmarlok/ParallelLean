'use client'

import { useState } from 'react'
import { useGraphStore } from '@/app/stores/graphStore'
import { createClient } from '@/app/lib/supabase/client'
import type { Node, Edge } from '@/src/types/database'

export function ReportGenerator() {
  const { nodes, edges } = useGraphStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportContent, setReportContent] = useState('')
  const supabase = createClient()

  const generateReport = async () => {
    setIsGenerating(true)

    try {
      // プロポーザルごとにレポートを生成
      const reports: string[] = []
      const proposals = nodes.filter(n => n.type === 'proposal')

      for (const proposal of proposals) {
        const report = await generateProjectReport(proposal)
        reports.push(report)
      }

      // 全体サマリーを追加
      const summary = generateSummary()
      const fullReport = `# ParallelLean プロジェクトレポート
      
生成日時: ${new Date().toLocaleString('ja-JP')}

## 全体サマリー
${summary}

## プロジェクト別レポート
${reports.join('\n\n---\n\n')}

## 知見とタグ
${generateKnowledgeBaseReport()}
`

      setReportContent(fullReport)
      setShowReport(true)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateProjectReport = async (proposal: Node): Promise<string> => {
    // プロジェクトに関連するノードを収集

    const projectNodes: Node[] = [proposal]
    const visitedNodes = new Set<string>([proposal.id])
    const queue = [proposal.id]

    // BFSで関連ノードを収集
    while (queue.length > 0) {
      const currentId = queue.shift()!
      
      const connectedEdges = edges.filter(e => 
        e.source_id === currentId || e.target_id === currentId
      )

      for (const edge of connectedEdges) {
        const otherId = edge.source_id === currentId ? edge.target_id : edge.source_id
        if (!visitedNodes.has(otherId)) {
          visitedNodes.add(otherId)
          const node = nodes.find(n => n.id === otherId)
          if (node) {
            projectNodes.push(node)
            queue.push(otherId)
          }
        }
      }
    }

    // ノードをタイプ別に分類
    const nodesByType = projectNodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = []
      acc[node.type].push(node)
      return acc
    }, {} as Record<string, Node[]>)

    // タスクの完了率を計算
    const tasks = nodesByType.task || []
    const completedTasks = tasks.filter(t => t.task_status === 'completed').length
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length * 100).toFixed(1) : 0

    // MVPとダッシュボードの情報
    const mvp = nodesByType.mvp?.[0]
    const dashboard = nodesByType.dashboard?.[0]
    const improvement = nodesByType.improvement?.[0]

    // 決定情報
    let decisionInfo = ''
    if (improvement?.metadata) {
      const metadata = improvement.metadata as any
      if (metadata.decision) {
        decisionInfo = `
### 決定事項
- **決定**: ${metadata.decision === 'rebuild' ? '再構築' : '撤退'}
- **理由**: ${metadata.decision_reason || '未記載'}
- **日時**: ${metadata.decision_date ? new Date(metadata.decision_date).toLocaleString('ja-JP') : '未定'}`
      }
    }

    return `### プロジェクト: ${proposal.title}

**提案**: ${proposal.title}
**ステータス**: アクティブ

#### 進捗状況
- **タスク数**: ${tasks.length}
- **完了タスク**: ${completedTasks}
- **完了率**: ${taskCompletionRate}%

${mvp ? `#### MVP
- **名称**: ${mvp.title}
- **作成日**: ${mvp.created_at ? new Date(mvp.created_at).toLocaleDateString('ja-JP') : '不明'}` : ''}

${dashboard ? `#### 計測結果
- **ダッシュボード**: ${dashboard.title}
- **計測期間**: ${(dashboard.metadata as any)?.measurement_period_days || '不明'}日間` : ''}

${improvement ? `#### 改善提案
- **内容**: ${improvement.title}
${decisionInfo}` : ''}`
  }

  const generateSummary = (): string => {
    const proposals = nodes.filter(n => n.type === 'proposal')
    const totalProjects = proposals.length
    const activeProjects = proposals.length
    const totalNodes = nodes.length
    const nodesByArea = nodes.reduce((acc, node) => {
      acc[node.area] = (acc[node.area] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return `- **総プロジェクト数**: ${totalProjects}
- **アクティブプロジェクト**: ${activeProjects}
- **総ノード数**: ${totalNodes}
- **エリア別ノード数**:
  - KnowledgeBase: ${nodesByArea.knowledge_base || 0}
  - IdeaStock: ${nodesByArea.idea_stock || 0}
  - Build: ${nodesByArea.build || 0}
  - Measure: ${nodesByArea.measure || 0}
  - Learn: ${nodesByArea.learn || 0}`
  }

  const generateKnowledgeBaseReport = (): string => {
    const kbNodes = nodes.filter(n => n.area === 'knowledge_base')
    const memos = kbNodes.filter(n => n.type === 'memo')
    const tags = kbNodes.filter(n => n.type === 'kb_tag')

    const tagConnections = tags.map(tag => {
      const connectedMemos = edges
        .filter(e => e.target_id === tag.id && e.type === 'tag')
        .map(e => nodes.find(n => n.id === e.source_id))
        .filter(n => n && n.type === 'memo')
        .map(n => n!.title)

      return `- **${tag.title}**: ${connectedMemos.join(', ') || '接続なし'}`
    })

    return `### メモ数: ${memos.length}
### タグ数: ${tags.length}

### タグ接続
${tagConnections.join('\n')}`
  }

  const downloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ParallelLean_Report_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        onClick={generateReport}
        disabled={isGenerating}
        className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 shadow-lg"
      >
        {isGenerating ? 'レポート生成中...' : 'レポート生成'}
      </button>

      {showReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowReport(false)} />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    プロジェクトレポート
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadReport}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      ダウンロード
                    </button>
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {reportContent}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}