'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { owlsToTheMax } from '@/app/test/owls-original'

export function AnimatedLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 160
    canvas.height = 60

    let img: HTMLImageElement | null = null
    let imageCanvas: HTMLCanvasElement | null = null
    let imageCtx: CanvasRenderingContext2D | null = null

    // Load and prepare logo
    const loadLogo = async () => {
      img = new Image()
      img.src = '/PL-logo.png'
      
      await new Promise((resolve, reject) => {
        img!.onload = resolve
        img!.onerror = reject
      })

      // Create image canvas with logo
      imageCanvas = document.createElement('canvas')
      imageCanvas.width = 160
      imageCanvas.height = 60
      imageCtx = imageCanvas.getContext('2d')!
      
      // White background
      imageCtx.fillStyle = 'white'
      imageCtx.fillRect(0, 0, 160, 60)
      
      // Draw logo with aspect ratio preserved, fitting within bounds
      const scale = Math.min(160 / img!.width, 60 / img!.height)
      const logoWidth = img!.width * scale
      const logoHeight = img!.height * scale
      const x = (160 - logoWidth) / 2
      const y = (60 - logoHeight) / 2
      imageCtx.drawImage(img!, x, y, logoWidth, logoHeight)
    }

    // Draw static logo
    const drawStaticLogo = () => {
      if (!img || !imageCanvas) return
      
      ctx.clearRect(0, 0, 160, 60)
      
      // Draw logo
      ctx.drawImage(imageCanvas, 0, 0)
    }

    // Run animation
    const runAnimation = async () => {
      if (isAnimatingRef.current || !imageCtx) return
      isAnimatingRef.current = true

      const generator = owlsToTheMax(imageCtx, 160, 60, 0.25) // Slower area_power for slower animation
      
      for await (const frame of generator) {
        ctx.clearRect(0, 0, 160, 60)
        
        // Draw animated logo
        ctx.drawImage(frame, 0, 0)
        
        // Slow down animation
        await new Promise(resolve => setTimeout(resolve, 50)) // 20fps instead of 60fps
      }
      
      isAnimatingRef.current = false
    }

    // Initialize
    loadLogo().then(() => {
      drawStaticLogo()
      
      // Start animation cycle
      const startAnimationCycle = () => {
        runAnimation()
        
        // Schedule next animation
        animationRef.current = window.setTimeout(() => {
          startAnimationCycle()
        }, 15000) // Wait 15 seconds between animations
      }
      
      // Start first animation after 3 seconds
      animationRef.current = window.setTimeout(() => {
        startAnimationCycle()
      }, 3000)
    })

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  return (
    <Link href="/" className="block">
      <canvas
        ref={canvasRef}
        width={160}
        height={60}
        className="cursor-pointer h-10"
        style={{ width: 'auto' }}
      />
    </Link>
  )
}