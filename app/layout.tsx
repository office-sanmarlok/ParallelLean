import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './components/providers/Providers'
import { SupabaseProvider } from './components/providers/SupabaseProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ParallelLean - リーンスタートアップ並列実行ツール',
  description: 'チームでリーンスタートアップを並列実行するための共有ワークスペース',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </Providers>
      </body>
    </html>
  )
}