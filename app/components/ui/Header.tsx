'use client'

import { useAuthStore } from '@/app/stores/authStore'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  variant?: 'default' | 'homepage'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isHomepage = variant === 'homepage' || pathname === '/' || pathname === '/homepage'

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image
                src="/PL-logo.svg"
                alt="ParallelLean"
                width={100}
                height={100}
                className="h-14 w-auto"
                priority
              />
            </button>
          </div>

        </div>
      </div>

    </header>
  )
}
