import { Header } from '@/app/components/ui/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
