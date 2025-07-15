'use client'

import { useEffect, useRef, useState } from 'react'
import { owlsToTheMax } from './owls-original'

export default function TestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)

  const startAnimation = async () => {
    if (isRunning) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Load PNG logo
    const img = new Image()
    img.src = '/PL-logo.png'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
    
    // Create an image canvas with the logo
    const imageCanvas = document.createElement('canvas')
    imageCanvas.width = 800
    imageCanvas.height = 600
    const imageCtx = imageCanvas.getContext('2d')!
    
    // Fill with white background
    imageCtx.fillStyle = 'white'
    imageCtx.fillRect(0, 0, 800, 600)
    
    // Create a temporary canvas to process the logo without transparency
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = img.width
    tempCanvas.height = img.height
    const tempCtx = tempCanvas.getContext('2d')!
    
    // Fill temp canvas with white background
    tempCtx.fillStyle = 'white'
    tempCtx.fillRect(0, 0, img.width, img.height)
    
    // Draw logo on white background
    tempCtx.drawImage(img, 0, 0)
    
    // Now draw the processed logo to main canvas
    const scale = Math.min(600 / img.width, 500 / img.height)
    const logoWidth = img.width * scale
    const logoHeight = img.height * scale
    const x = (800 - logoWidth) / 2
    const y = (600 - logoHeight) / 2
    imageCtx.drawImage(tempCanvas, x, y, logoWidth, logoHeight)
    
    setIsRunning(true)
    
    // Run the generator
    const generator = owlsToTheMax(imageCtx, 800, 600)
    
    for await (const frame of generator) {
      ctx.clearRect(0, 0, 800, 600)
      ctx.drawImage(frame, 0, 0)
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
    
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Owls to the Max テスト（オリジナル版）</h1>
      <button
        onClick={startAnimation}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {isRunning ? 'アニメーション中...' : 'アニメーション開始'}
      </button>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300"
      />
    </div>
  )
}