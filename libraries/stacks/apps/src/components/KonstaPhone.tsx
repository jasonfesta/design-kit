import { Block, BlockTitle, Button, KonstaProvider, List, ListItem, Navbar, Segmented, SegmentedButton, Toggle } from 'konsta/react'
import { useState } from 'react'

/** Konsta UI in iOS mode, framed like a phone. Konsta is pure UI (Tailwind) — no router, no app runtime. */
export function KonstaPhone() {
  const [wifi, setWifi] = useState(true)
  const [seg, setSeg] = useState(0)
  return (
    <KonstaProvider theme="ios">
      <div className="mx-auto w-[320px] overflow-hidden rounded-[44px] border-[10px] border-stone-900 bg-[#F2F2F7] shadow-[0_24px_60px_-20px_rgba(28,27,25,0.45)]">
        <Navbar title="Settings" subtitle="konsta · iOS" />
        <Block className="!my-3">
          <Segmented strong>
            {['Day', 'Week', 'Month'].map((l, i) => (
              <SegmentedButton key={l} active={seg === i} onClick={() => setSeg(i)}>{l}</SegmentedButton>
            ))}
          </Segmented>
        </Block>
        <BlockTitle>Network</BlockTitle>
        <List strong inset>
          <ListItem title="Wi-Fi" after={<Toggle checked={wifi} onChange={() => setWifi(!wifi)} />} />
          <ListItem title="Bluetooth" after="On" link />
          <ListItem title="Cellular" after="LTE" link />
        </List>
        <Block className="pb-8">
          <Button large rounded>Continue</Button>
        </Block>
      </div>
    </KonstaProvider>
  )
}
