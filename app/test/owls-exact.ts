import * as d3 from 'd3'

// TinyQueue implementation
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

class Quad {
  x: number
  y: number
  w: number
  h: number
  color: string
  score: number
  imageContext: CanvasRenderingContext2D

  constructor(x: number, y: number, w: number, h: number, imageContext: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.imageContext = imageContext

    const histogram = this.computeHistogram()
    const [r, g, b, error] = this.colorFromHistogram(histogram)
    this.color = `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1)}`
    this.score = error * Math.sqrt(w * h) // area_power = 0.5 in original
  }

  computeHistogram() {
    const {data} = this.imageContext.getImageData(this.x, this.y, this.w, this.h)
    const histogram = new Uint32Array(1024)
    for (let i = 0, n = data.length; i < n; i += 4) {
      ++histogram[0 * 256 + data[i + 0]]
      ++histogram[1 * 256 + data[i + 1]]
      ++histogram[2 * 256 + data[i + 2]]
      ++histogram[3 * 256 + data[i + 3]]
    }
    return histogram
  }

  weightedAverage(histogram: Uint32Array): [number, number] {
    let total = 0
    let value = 0
    for (let i = 0; i < 256; ++i) {
      total += histogram[i]
      value += histogram[i] * i
    }
    value /= total
    let error = 0
    for (let i = 0; i < 256; ++i) {
      error += (value - i) ** 2 * histogram[i]
    }
    return [value, Math.sqrt(error / total)]
  }

  colorFromHistogram(histogram: Uint32Array): [number, number, number, number] {
    const [r, re] = this.weightedAverage(histogram.subarray(0, 256))
    const [g, ge] = this.weightedAverage(histogram.subarray(256, 512))
    const [b, be] = this.weightedAverage(histogram.subarray(512, 768))
    return [
      Math.round(r),
      Math.round(g),
      Math.round(b),
      re * 0.2989 + ge * 0.5870 + be * 0.1140
    ]
  }

  split(): Quad[] {
    const dx = this.w / 2, x1 = this.x, x2 = this.x + dx
    const dy = this.h / 2, y1 = this.y, y2 = this.y + dy
    return [
      new Quad(x1, y1, dx, dy, this.imageContext),
      new Quad(x2, y1, dx, dy, this.imageContext),
      new Quad(x1, y2, dx, dy, this.imageContext),
      new Quad(x2, y2, dx, dy, this.imageContext)
    ]
  }
}

export function owlsToTheMaxExact(
  canvas: HTMLCanvasElement,
  imageContext: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const context = canvas.getContext('2d')!
  const quads = new TinyQueue<Quad>([], (a, b) => b.score - a.score)
  
  // Start with whole image
  quads.push(new Quad(0, 0, width, height, imageContext))
  
  let animationId: number

  // Keep track of all rendered quads
  const renderedQuads: Quad[] = []
  
  function animate() {
    const q = quads.pop()
    
    if (!q || q.score < 50) {
      // Animation complete - draw final state
      if (!q && renderedQuads.length === 0) {
        // Draw all remaining quads
        const remaining = []
        while (quads.length > 0) {
          const quad = quads.pop()
          if (quad) remaining.push(quad)
        }
        remaining.forEach(quad => {
          context.fillStyle = quad.color
          context.beginPath()
          context.arc(quad.x + quad.w / 2, quad.y + quad.h / 2, quad.w / 2, 0, 2 * Math.PI)
          context.fill()
        })
      }
      return
    }
    
    const qs = q.split()
    const steps = Math.max(1, Math.floor(q.w / 10))
    
    // Interpolate between parent and children
    let step = 0
    
    function interpolateStep() {
      const t = d3.easeCubicInOut(step / steps)
      
      // Redraw entire canvas
      context.clearRect(0, 0, width, height)
      
      // Redraw all previously rendered quads
      renderedQuads.forEach(quad => {
        context.fillStyle = quad.color
        context.beginPath()
        context.arc(quad.x + quad.w / 2, quad.y + quad.h / 2, quad.w / 2, 0, 2 * Math.PI)
        context.fill()
      })
      
      // Draw interpolated quads
      if (t === 0) {
        // Draw parent
        context.fillStyle = q.color
        context.beginPath()
        context.arc(q.x + q.w / 2, q.y + q.h / 2, q.w / 2, 0, 2 * Math.PI)
        context.fill()
      } else {
        // Draw children with interpolation
        qs.forEach((child, i) => {
          const parentCx = q.x + q.w / 2
          const parentCy = q.y + q.h / 2
          const childCx = child.x + child.w / 2
          const childCy = child.y + child.h / 2
          
          const cx = parentCx + (childCx - parentCx) * t
          const cy = parentCy + (childCy - parentCy) * t
          const r = (q.w / 2) + (child.w / 2 - q.w / 2) * t
          
          context.fillStyle = child.color
          context.beginPath()
          context.arc(cx, cy, r, 0, 2 * Math.PI)
          context.fill()
        })
      }
      
      step++
      
      if (step <= steps) {
        requestAnimationFrame(interpolateStep)
      } else {
        // Add children to rendered list and queue
        qs.forEach(child => {
          if (child.score < 50 || Math.min(child.w, child.h) < 4) {
            renderedQuads.push(child)
          } else {
            quads.push(child)
          }
        })
        // Continue with next quad
        requestAnimationFrame(animate)
      }
    }
    
    interpolateStep()
  }
  
  animate()
}