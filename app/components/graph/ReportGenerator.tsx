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
      // Generate report for each proposal
      const reports: string[] = []
      const proposals = nodes.filter((n) => n.type === 'proposal')

      for (const proposal of proposals) {
        const report = await generateProjectReport(proposal)
        reports.push(report)
      }

      // Add overall summary
      const summary = generateSummary()
      const fullReport = `# ParallelLean Project Report
      
Generated: ${new Date().toLocaleString('en-US')}

## Overall Summary
${summary}

## Project Reports
${reports.join('\n\n---\n\n')}

## Knowledge and Tags
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
    // Collect nodes related to the project

    const projectNodes: Node[] = [proposal]
    const visitedNodes = new Set<string>([proposal.id])
    const queue = [proposal.id]

    // Collect related nodes using BFS
    while (queue.length > 0) {
      const currentId = queue.shift()!

      const connectedEdges = edges.filter(
        (e) => e.source_id === currentId || e.target_id === currentId
      )

      for (const edge of connectedEdges) {
        const otherId = edge.source_id === currentId ? edge.target_id : edge.source_id
        if (!visitedNodes.has(otherId)) {
          visitedNodes.add(otherId)
          const node = nodes.find((n) => n.id === otherId)
          if (node) {
            projectNodes.push(node)
            queue.push(otherId)
          }
        }
      }
    }

    // Classify nodes by type
    const nodesByType = projectNodes.reduce(
      (acc, node) => {
        if (!acc[node.type]) acc[node.type] = []
        acc[node.type].push(node)
        return acc
      },
      {} as Record<string, Node[]>
    )

    // Calculate task completion rate
    const tasks = nodesByType.task || []
    const completedTasks = tasks.filter((t) => t.task_status === 'completed').length
    const taskCompletionRate =
      tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0

    // MVP and dashboard information
    const mvp = nodesByType.mvp?.[0]
    const dashboard = nodesByType.dashboard?.[0]
    const improvement = nodesByType.improvement?.[0]

    // Decision information
    let decisionInfo = ''
    if (improvement?.metadata) {
      const metadata = improvement.metadata as any
      if (metadata.decision) {
        decisionInfo = `
### Decision
- **Decision**: ${metadata.decision === 'rebuild' ? 'Rebuild' : 'Pivot'}
- **Reason**: ${metadata.decision_reason || 'Not specified'}
- **Date**: ${metadata.decision_date ? new Date(metadata.decision_date).toLocaleString('en-US') : 'Not set'}`
      }
    }

    return `### Project: ${proposal.title}

**Proposal**: ${proposal.title}
**Status**: Active

#### Progress
- **Tasks**: ${tasks.length}
- **Completed**: ${completedTasks}
- **Completion Rate**: ${taskCompletionRate}%

${
  mvp
    ? `#### MVP
- **Name**: ${mvp.title}
- **Created**: ${mvp.created_at ? new Date(mvp.created_at).toLocaleDateString('en-US') : 'Unknown'}`
    : ''
}

${
  dashboard
    ? `#### Measurement Results
- **Dashboard**: ${dashboard.title}
- **Measurement Period**: ${(dashboard.metadata as any)?.measurement_period_days || 'Unknown'} days`
    : ''
}

${
  improvement
    ? `#### Improvement Proposal
- **Content**: ${improvement.title}
${decisionInfo}`
    : ''
}`
  }

  const generateSummary = (): string => {
    const proposals = nodes.filter((n) => n.type === 'proposal')
    const totalProjects = proposals.length
    const activeProjects = proposals.length
    const totalNodes = nodes.length
    const nodesByArea = nodes.reduce(
      (acc, node) => {
        acc[node.area] = (acc[node.area] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return `- **Total Projects**: ${totalProjects}
- **Active Projects**: ${activeProjects}
- **Total Nodes**: ${totalNodes}
- **Nodes by Area**:
  - KnowledgeBase: ${nodesByArea.knowledge_base || 0}
  - IdeaStock: ${nodesByArea.idea_stock || 0}
  - Build: ${nodesByArea.build || 0}
  - Measure: ${nodesByArea.measure || 0}
  - Learn: ${nodesByArea.learn || 0}`
  }

  const generateKnowledgeBaseReport = (): string => {
    const kbNodes = nodes.filter((n) => n.area === 'knowledge_base')
    const memos = kbNodes.filter((n) => n.type === 'memo')
    const tags = kbNodes.filter((n) => n.type === 'kb_tag')

    const tagConnections = tags.map((tag) => {
      const connectedMemos = edges
        .filter((e) => e.target_id === tag.id && e.type === 'tag')
        .map((e) => nodes.find((n) => n.id === e.source_id))
        .filter((n) => n && n.type === 'memo')
        .map((n) => n!.title)

      return `- **${tag.title}**: ${connectedMemos.join(', ') || 'No connections'}`
    })

    return `### Memos: ${memos.length}
### Tags: ${tags.length}

### Tag Connections
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
        {isGenerating ? 'Generating Report...' : 'Generate Report'}
      </button>

      {showReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setShowReport(false)}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Project Report
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadReport}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setShowReport(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
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
