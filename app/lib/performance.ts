// パフォーマンスモニタリングユーティリティ

interface PerformanceMetrics {
  renderTime: number
  apiCallTime: number
  nodeCount: number
  edgeCount: number
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  // パフォーマンス計測開始
  startMeasure(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }
      
      this.metrics.get(name)!.push(duration)
      
      // 開発環境では警告を表示
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
      }
    }
  }
  
  // 平均実行時間を取得
  getAverageTime(name: string): number {
    const times = this.metrics.get(name) || []
    if (times.length === 0) return 0
    
    const sum = times.reduce((acc, time) => acc + time, 0)
    return sum / times.length
  }
  
  // メトリクスをクリア
  clear(): void {
    this.metrics.clear()
  }
  
  // レポートを生成
  generateReport(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {}
    
    this.metrics.forEach((times, name) => {
      report[name] = {
        average: this.getAverageTime(name),
        count: times.length,
      }
    })
    
    return report
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React用のパフォーマンス計測フック
import { useEffect, useRef } from 'react'

export function usePerformanceMeasure(name: string) {
  const measureRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    measureRef.current = performanceMonitor.startMeasure(name)
    
    return () => {
      if (measureRef.current) {
        measureRef.current()
      }
    }
  }, [name])
}

// メモ化のヘルパー
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 60000 // デフォルト60秒
): T {
  const cache = new Map<string, { value: any; expiry: number }>()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)
    
    if (cached && cached.expiry > Date.now()) {
      return cached.value
    }
    
    const value = fn(...args)
    cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    })
    
    // 古いキャッシュをクリーンアップ
    if (cache.size > 100) {
      const now = Date.now()
      Array.from(cache.entries()).forEach(([k, v]) => {
        if (v.expiry < now) {
          cache.delete(k)
        }
      })
    }
    
    return value
  }) as T
}

// デバウンスヘルパー
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// スロットルヘルパー
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}