'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationContextType {
  navigateTo: (path: string) => void
  isTransitioning: boolean
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)
  const router = useRouter()

  const navigateTo = useCallback((path: string) => {
    setNextPath(path)
    setIsTransitioning(true)
    
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push(path)
      setTimeout(() => {
        setIsTransitioning(false)
        setNextPath(null)
      }, 500)
    }, 1500)
  }, [router])

  return (
    <NavigationContext.Provider value={{ navigateTo, isTransitioning }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}