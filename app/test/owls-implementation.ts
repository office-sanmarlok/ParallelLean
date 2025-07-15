// TinyQueue - A minimal priority queue implementation
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

  peek(): T | undefined {
    return this.data[0]
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

// Quad class for image subdivision
export class Quad {
  x: number
  y: number
  w: number
  h: number
  color: string
  score: number

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    imageContext: CanvasRenderingContext2D,
    area_power = 0.25
  ) {
    const [r, g, b, error] = colorFromHistogram(computeHistogram(imageContext, x, y, w, h))
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1)}`
    this.score = error * Math.pow(w * h, area_power)
  }

  split(imageContext: CanvasRenderingContext2D, area_power = 0.25): Quad[] {
    const dx = this.w / 2
    const x1 = this.x
    const x2 = this.x + dx
    const dy = this.h / 2
    const y1 = this.y
    const y2 = this.y + dy
    
    return [
      new Quad(x1, y1, dx, dy, imageContext, area_power),
      new Quad(x2, y1, dx, dy, imageContext, area_power),
      new Quad(x1, y2, dx, dy, imageContext, area_power),
      new Quad(x2, y2, dx, dy, imageContext, area_power)
    ]
  }
}

// Compute histogram for a region
function computeHistogram(
  imageContext: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): Uint32Array {
  const {data} = imageContext.getImageData(x, y, w, h)
  const histogram = new Uint32Array(1024)
  
  for (let i = 0, n = data.length; i < n; i += 4) {
    ++histogram[0 * 256 + data[i + 0]]
    ++histogram[1 * 256 + data[i + 1]]
    ++histogram[2 * 256 + data[i + 2]]
    ++histogram[3 * 256 + data[i + 3]]
  }
  
  return histogram
}

// Calculate weighted average and standard deviation
function weightedAverage(histogram: Uint32Array): [number, number] {
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

// Get color and error from histogram
function colorFromHistogram(histogram: Uint32Array): [number, number, number, number] {
  const [r, re] = weightedAverage(histogram.subarray(0, 256))
  const [g, ge] = weightedAverage(histogram.subarray(256, 512))
  const [b, be] = weightedAverage(histogram.subarray(512, 768))
  
  return [
    Math.round(r),
    Math.round(g),
    Math.round(b),
    re * 0.2989 + ge * 0.5870 + be * 0.1140
  ]
}

// Main animation function
export function owlsToTheMax(
  canvas: HTMLCanvasElement,
  imageContext: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number
) {
  const context = canvas.getContext('2d')!
  const queue = new TinyQueue<Quad>([], (a, b) => b.score - a.score)
  
  // Start with the whole image
  queue.push(new Quad(0, 0, imageWidth, imageHeight, imageContext))
  
  let batch: Quad[] = []
  
  function split() {
    for (let i = 0; i < 2 && queue.length > 0; ++i) {
      const quad = queue.pop()!
      
      if (quad.score > 10 ** 2.5) {
        for (const child of quad.split(imageContext)) {
          queue.push(child)
        }
      } else {
        batch.push(quad)
      }
    }
  }
  
  function render() {
    for (const quad of batch) {
      context.fillStyle = quad.color
      const cx = quad.x + quad.w / 2
      const cy = quad.y + quad.h / 2
      const r = Math.max(1, Math.min(quad.w, quad.h) / 2)
      
      context.beginPath()
      context.arc(cx, cy, r, 0, 2 * Math.PI)
      context.fill()
    }
    
    batch = []
  }
  
  const interval = setInterval(() => {
    split()
    render()
    
    if (queue.length === 0) {
      clearInterval(interval)
    }
  }, 10)
  
  return () => clearInterval(interval)
}