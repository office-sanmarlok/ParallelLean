import D3HomePage from './components/homepage/D3HomePage'
import { Header } from './components/ui/Header'

export default function HomePage() {
  return (
    <>
      <Header variant="homepage" />
      <main className="min-h-screen bg-white">
        <D3HomePage />
      </main>
    </>
  )
}