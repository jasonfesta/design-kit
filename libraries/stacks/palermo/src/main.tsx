import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Tabs, Switch, Tooltip } from 'radix-ui'
import { Command } from 'cmdk'
import NumberFlow from '@number-flow/react'
import './index.css'

function App() {
  const [visits, setVisits] = useState(12480)
  const [on, setOn] = useState(true)
  return (
    <Tooltip.Provider>
      <main className="mx-auto max-w-3xl p-10 space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Palermo stack playground</h1>
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-neutral-500">AI visibility (NumberFlow)</p>
          <div className="text-4xl font-semibold tabular-nums"><NumberFlow value={visits} /></div>
          <button className="rounded-lg bg-[var(--pal-fill-fill-primary)] px-4 py-2 text-sm text-white active:scale-[.98]" onClick={() => setVisits(v => v + Math.round(Math.random() * 900))}>Refresh</button>
        </section>
        <Tabs.Root defaultValue="answers" className="rounded-2xl bg-white p-6 shadow-sm">
          <Tabs.List className="flex gap-2 border-b border-neutral-200 pb-2">
            {['answers', 'citations', 'prompts'].map(v => <Tabs.Trigger key={v} value={v} className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-neutral-100">{v}</Tabs.Trigger>)}
          </Tabs.List>
          <Tabs.Content value="answers" className="pt-4 text-sm">Radix Tabs (Palermo uses Radix primitives).</Tabs.Content>
          <Tabs.Content value="citations" className="pt-4 text-sm">Citations panel.</Tabs.Content>
          <Tabs.Content value="prompts" className="pt-4 text-sm">Prompts panel.</Tabs.Content>
        </Tabs.Root>
        <section className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <Switch.Root checked={on} onCheckedChange={setOn} className="relative h-5 w-9 rounded-full bg-neutral-300 data-[state=checked]:bg-[var(--pal-fill-fill-blue)]">
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          <Tooltip.Root><Tooltip.Trigger className="text-sm">Track brand mentions</Tooltip.Trigger>
            <Tooltip.Portal><Tooltip.Content className="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white" sideOffset={6}>Radix Tooltip</Tooltip.Content></Tooltip.Portal></Tooltip.Root>
        </section>
        <Command className="rounded-2xl bg-white p-2 shadow-sm" label="Command bar">
          <Command.Input placeholder="Search prompts, brands, agents…" className="w-full rounded-lg px-3 py-2 text-sm outline-none" />
          <Command.List className="p-1 text-sm">
            <Command.Empty>No results.</Command.Empty>
            {['Answer engine insights', 'Agent analytics', 'Prompt volumes'].map(i => <Command.Item key={i} className="rounded-md px-3 py-2 data-[selected=true]:bg-neutral-100">{i}</Command.Item>)}
          </Command.List>
        </Command>
      </main>
    </Tooltip.Provider>
  )
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
