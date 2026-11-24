import { Badge, Button, Card, Flex, Heading, Text, Theme } from '@radix-ui/themes'
import { Tabs, Tooltip } from 'radix-ui'

/** Radix Themes (styled) + Radix Primitives (headless, styled with Tailwind). */
export function RadixPanel() {
  return (
    <Theme accentColor="teal" grayColor="sand" radius="large" appearance="light" hasBackground={false}>
      <Card size="3">
        <Text size="1" color="gray" className="uppercase tracking-widest">@radix-ui/themes + radix-ui</Text>
        <Heading size="7" mb="3" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Radix</Heading>

        <Tabs.Root defaultValue="overview" className="mb-4">
          <Tabs.List className="flex gap-1 rounded-lg bg-stone-100 p-1" aria-label="Sections">
            {['overview', 'activity', 'settings'].map((v) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="flex-1 rounded-md px-3.5 py-1.5 text-sm capitalize text-stone-600 transition active:scale-[0.97] data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                {v}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="overview" className="pt-3 text-sm text-stone-600">Headless primitive, Tailwind-styled.</Tabs.Content>
          <Tabs.Content value="activity" className="pt-3 text-sm text-stone-600"><span className="tabular-nums">12</span> updates this week.</Tabs.Content>
          <Tabs.Content value="settings" className="pt-3 text-sm text-stone-600">Nothing to configure.</Tabs.Content>
        </Tabs.Root>

        <Flex gap="2" align="center" mb="3">
          <Badge color="teal">Live</Badge>
          <Badge color="orange" variant="soft">Beta</Badge>
        </Flex>

        <Flex gap="2">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button>Publish</Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content sideOffset={6} className="rounded-md bg-stone-900 px-2.5 py-1 text-xs text-white">
                  Radix Tooltip primitive
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
          <Button variant="soft" color="gray">Preview</Button>
        </Flex>
      </Card>
    </Theme>
  )
}
