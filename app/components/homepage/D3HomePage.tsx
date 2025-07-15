'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/stores/authStore'

interface Node {
  id: string
  label: string
  type: 'main' | 'action' | 'info'
  action?: () => void
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string
  target: string
}

export default function D3HomePage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!svgRef.current) return

    const width = window.innerWidth
    const height = window.innerHeight - 64 // Header height

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    svg.selectAll('*').remove()

    // Define nodes
    const nodes: Node[] = [
      {
        id: 'center',
        label: 'ParallelLean',
        type: 'main',
        fx: width / 2,
        fy: height / 2
      },
      {
        id: 'login',
        label: user ? 'Sign Out' : 'Sign In',
        type: 'action',
        action: async () => {
          if (user) {
            const { createClient } = await import('@/app/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
          } else {
            router.push('/login')
          }
        }
      },
      {
        id: 'graph',
        label: 'Graph View',
        type: 'action',
        action: () => router.push('/graph')
      },
      {
        id: 'docs',
        label: 'Documentation',
        type: 'info',
        action: () => window.open('/docs', '_blank')
      },
      {
        id: 'contact',
        label: 'Contact',
        type: 'info',
        action: () => window.open('mailto:contact@parallellean.com', '_blank')
      },
      {
        id: 'github',
        label: 'GitHub',
        type: 'info',
        action: () => window.open('https://github.com/parallellean', '_blank')
      }
    ]

    // Define links
    const links: Link[] = [
      { source: 'center', target: 'login' },
      { source: 'center', target: 'graph' },
      { source: 'center', target: 'docs' },
      { source: 'center', target: 'contact' },
      { source: 'center', target: 'github' }
    ]

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(80))

    // Create gradient definitions
    const defs = svg.append('defs')

    const gradient = defs.append('radialGradient')
      .attr('id', 'nodeGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffffff')

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f3f4f6')

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    // Create node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Add circles to nodes
    node.append('circle')
      .attr('r', (d) => d.type === 'main' ? 60 : 40)
      .attr('fill', (d) => {
        if (d.type === 'main') return '#000000'
        if (d.type === 'action') return '#3b82f6'
        return 'url(#nodeGradient)'
      })
      .attr('stroke', (d) => d.type === 'info' ? '#e5e7eb' : 'none')
      .attr('stroke-width', 2)
      .on('mouseenter', function(event, d) {
        if (d.type !== 'main') {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d.type === 'main' ? 65 : 45)
        }
      })
      .on('mouseleave', function(event, d) {
        if (d.type !== 'main') {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d.type === 'main' ? 60 : 40)
        }
      })
      .on('click', (event, d) => {
        if (d.action) {
          d.action()
        }
      })

    // Add text to nodes
    node.append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', (d) => {
        if (d.type === 'main' || d.type === 'action') return '#ffffff'
        return '#374151'
      })
      .attr('font-size', (d) => d.type === 'main' ? '16px' : '14px')
      .attr('font-weight', (d) => d.type === 'main' ? 'bold' : 'normal')
      .style('pointer-events', 'none')
      .style('user-select', 'none')

    // Add floating animation to main node
    const mainNode = node.filter(d => d.type === 'main')
    mainNode.select('circle')
      .transition()
      .duration(2000)
      .ease(d3.easeSinInOut)
      .attr('r', 65)
      .transition()
      .duration(2000)
      .ease(d3.easeSinInOut)
      .attr('r', 60)
      .on('end', function repeat() {
        d3.select(this)
          .transition()
          .duration(2000)
          .ease(d3.easeSinInOut)
          .attr('r', 65)
          .transition()
          .duration(2000)
          .ease(d3.easeSinInOut)
          .attr('r', 60)
          .on('end', repeat)
      })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0)
      if (d.type !== 'main') {
        d.fx = null
        d.fy = null
      }
    }

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight - 64

      svg.attr('width', newWidth).attr('height', newHeight)
      
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      simulation.stop()
    }
  }, [router, user])

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
      
      {/* Floating hints */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm animate-pulse">
          Click nodes to interact • Drag to move
        </p>
      </div>
    </div>
  )
}