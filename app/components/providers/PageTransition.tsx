'use client'

import { useNavigation } from './NavigationProvider'
import { PageTransitionCanvas } from './PageTransitionCanvas'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isTransitioning } = useNavigation()
  const pathname = usePathname()

  return (
    <>
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        {children}
      </div>
      
      <PageTransitionCanvas
        isTransitioning={isTransitioning}
        pathname={pathname}
        onComplete={() => {}}
      />
    </>
  )
}