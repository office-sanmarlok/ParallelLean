'use client'

import { useEffect, useRef } from 'react'

interface Props {
  isTransitioning: boolean
  pathname: string
  onComplete: () => void
}

interface Quadrant {
  x: number
  y: number
  size: number
  color: string
  children?: Quadrant[]
  targetX?: number
  targetY?: number
  targetSize?: number
}

export function PageTransitionCanvas({ isTransitioning, pathname, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    if (!isTransitioning || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    
    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Load and process logo
    const img = new Image()
    img.src = '/PL-logo.svg'
    
    img.onload = () => {
      // Create initial quadrant tree
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const initialSize = Math.min(canvas.width, canvas.height) * 0.6
      
      // Generate quadrant tree
      const maxDepth = 5
      const quadrants: Quadrant[] = []
      
      function createQuadrants(x: number, y: number, size: number, depth: number): Quadrant[] {
        if (depth >= maxDepth || size < 4) {
          return [{
            x,
            y,
            size,
            color: depth % 2 === 0 ? '#000000' : '#3b82f6',
          }]
        }
        
        const halfSize = size / 2
        const subQuadrants: Quadrant[] = []
        
        // Create 4 sub-quadrants
        const positions = [
          { x: x - halfSize / 2, y: y - halfSize / 2 },
          { x: x + halfSize / 2, y: y - halfSize / 2 },
          { x: x - halfSize / 2, y: y + halfSize / 2 },
          { x: x + halfSize / 2, y: y + halfSize / 2 },
        ]
        
        positions.forEach((pos, i) => {
          if (Math.random() > 0.3) { // Random subdivision
            subQuadrants.push(...createQuadrants(pos.x, pos.y, halfSize, depth + 1))
          } else {
            subQuadrants.push({
              x: pos.x,
              y: pos.y,
              size: halfSize,
              color: i % 2 === 0 ? '#000000' : '#3b82f6',
            })
          }
        })
        
        return subQuadrants
      }
      
      quadrants.push(...createQuadrants(centerX, centerY, initialSize, 0))
      
      // Set random target positions for dispersion
      quadrants.forEach(q => {
        q.targetX = Math.random() * canvas.width
        q.targetY = Math.random() * canvas.height
        q.targetSize = q.size * (Math.random() * 0.5 + 0.5)
      })
      
      // Animation
      let startTime = Date.now()
      const duration = 1500
      
      function animate() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeInOutCubic(progress)
        
        // Clear canvas
        context.fillStyle = 'rgba(255, 255, 255, 1)'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw quadrants
        quadrants.forEach(q => {
          const isReversed = pathname === '/'
          
          let currentX, currentY, currentSize
          
          if (isReversed) {
            // Gather animation
            currentX = q.targetX! + (q.x - q.targetX!) * easeProgress
            currentY = q.targetY! + (q.y - q.targetY!) * easeProgress
            currentSize = q.targetSize! + (q.size - q.targetSize!) * easeProgress
          } else {
            // Disperse animation
            currentX = q.x + (q.targetX! - q.x) * easeProgress
            currentY = q.y + (q.targetY! - q.y) * easeProgress
            currentSize = q.size + (q.targetSize! - q.size) * easeProgress
          }
          
          // Draw as circle
          context.fillStyle = q.color
          context.globalAlpha = isReversed ? easeProgress : 1 - easeProgress * 0.5
          context.beginPath()
          context.arc(currentX, currentY, currentSize / 2, 0, Math.PI * 2)
          context.fill()
        })
        
        context.globalAlpha = 1
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setTimeout(onComplete, 200)
        }
      }
      
      animate()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isTransitioning, pathname, onComplete])
  
  if (!isTransitioning) return null
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none bg-white"
    />
  )
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}