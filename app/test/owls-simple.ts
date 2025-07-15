import * as d3 from 'd3'

// Priority queue implementation
class TinyQueue<T> {
  data: T[]
  length: number
  compare: (a: T, b: T) => number

  constructor(data: T[] = [], compare = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.data = data
    this.length = this.data.length
    this.compare = compare

    if (this.length > 0) {
      for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i)
    }
  }

  push(item: T) {
    this.data.push(item)
    this.length++
    this._up(this.length - 1)
  }

  pop(): T | undefined {
    if (this.length === 0) return undefined
    const top = this.data[0]
    const bottom = this.data.pop()!
    if (--this.length > 0) {
      this.data[0] = bottom
      this._down(0)
    }
    return top
  }

  _up(pos: number) {
    const {data, compare} = this
    const item = data[pos]
    while (pos > 0) {
      const parent = (pos - 1) >> 1
      const current = data[parent]
      if (compare(item, current) >= 0) break
      data[pos] = current
      pos = parent
    }
    data[pos] = item
  }

  _down(pos: number) {
    const {data, compare} = this
    const halfLength = this.length >> 1
    const item = data[pos]
    while (pos < halfLength) {
      let left = (pos << 1) + 1
      let best = data[left]
      const right = left + 1
      if (right < this.length && compare(data[right], best) < 0) {
        left = right
        best = data[right]
      }
      if (compare(best, item) >= 0) break
      data[pos] = best
      pos = left
    }
    data[pos] = item
  }
}

// Quad class
class Quad {
  x: number
  y: number
  w: number
  h: number
  color: string
  score: number

  constructor(x: number, y: number, w: number, h: number, imageContext: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h

    // Get image data and calculate color
    const imageData = imageContext.getImageData(x, y, w, h)
    const data = imageData.data
    
    // Calculate average color
    let r = 0, g = 0, b = 0, count = 0
    let minR = 255, maxR = 0
    let minG = 255, maxG = 0
    let minB = 255, maxB = 0
    
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]
      if (alpha > 0) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
        
        minR = Math.min(minR, data[i])
        maxR = Math.max(maxR, data[i])
        minG = Math.min(minG, data[i + 1])
        maxG = Math.max(maxG, data[i + 1])
        minB = Math.min(minB, data[i + 2])
        maxB = Math.max(maxB, data[i + 2])
      }
    }
    
    if (count > 0) {
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
    }
    
    this.color = `rgb(${r}, ${g}, ${b})`
    
    // Calculate score based on color variance
    const variance = (maxR - minR) + (maxG - minG) + (maxB - minB)
    this.score = variance * Math.sqrt(w * h)
  }

  split(imageContext: CanvasRenderingContext2D): Quad[] {
    const hw = this.w / 2
    const hh = this.h / 2
    return [
      new Quad(this.x, this.y, hw, hh, imageContext),
      new Quad(this.x + hw, this.y, hw, hh, imageContext),
      new Quad(this.x, this.y + hh, hw, hh, imageContext),
      new Quad(this.x + hw, this.y + hh, hw, hh, imageContext)
    ]
  }
}

export function owlsSimple(
  canvas: HTMLCanvasElement,
  imageContext: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const context = canvas.getContext('2d')!
  const quads = new TinyQueue<Quad>([], (a, b) => b.score - a.score)
  
  // Clear canvas
  context.clearRect(0, 0, width, height)
  
  // Start with whole image
  const initial = new Quad(0, 0, width, height, imageContext)
  quads.push(initial)
  
  // Process quads in batches
  let iteration = 0
  
  function processNext() {
    // Process a few quads per frame
    for (let i = 0; i < 5 && quads.length > 0; i++) {
      const quad = quads.pop()
      if (!quad) break
      
      // Check if should split
      if (quad.score > 100 && quad.w > 4 && quad.h > 4) {
        // Split and add children to queue
        const children = quad.split(imageContext)
        children.forEach(child => quads.push(child))
      } else {
        // Draw final quad as circle
        const cx = quad.x + quad.w / 2
        const cy = quad.y + quad.h / 2
        const r = Math.min(quad.w, quad.h) / 2 * 0.9
        
        context.fillStyle = quad.color
        context.beginPath()
        context.arc(cx, cy, r, 0, 2 * Math.PI)
        context.fill()
      }
    }
    
    iteration++
    
    // Continue if there are more quads
    if (quads.length > 0 && iteration < 1000) {
      requestAnimationFrame(processNext)
    }
  }
  
  processNext()
}