'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function SimplePageTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // ページ遷移時に白画面を表示
    setIsTransitioning(true)
    
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 300ms ease-in-out',
        }}
      >
        {children}
      </div>
      
      {isTransitioning && (
        <div className="fixed inset-0 bg-white z-[9999]" />
      )}
    </>
  )
}