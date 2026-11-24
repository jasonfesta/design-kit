import { Layers } from 'lucide-react'
import { MuiPanel } from './components/MuiPanel'
import { RadixPanel } from './components/RadixPanel'
import { KonstaPhone } from './components/KonstaPhone'

export default function App() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex items-end justify-between gap-6 border-b border-[#E6E1D8] pb-6">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone-500">
            <Layers className="size-3.5" /> design-kit / libraries / stacks / apps
          </p>
          <h1 className="font-display text-5xl leading-none">App Stack</h1>
        </div>
        <p className="max-w-sm text-sm text-stone-600">
          UI design libraries for application builds: MUI, Radix Themes + Primitives, and Konsta UI for iOS-styled screens.
        </p>
      </header>
      <section className="grid items-start gap-6 lg:grid-cols-3">
        <MuiPanel />
        <RadixPanel />
        <KonstaPhone />
      </section>
    </main>
  )
}
