import { Group, Panel, Separator } from 'react-resizable-panels'
import type { ReactNode } from 'react'

interface SplitPaneProps {
  editor: ReactNode
  terminal: ReactNode
}

export default function SplitPane({ editor, terminal }: SplitPaneProps) {
  return (
    <Group orientation="horizontal" className="flex flex-1">
      <Panel id="editor" defaultSize={58} minSize={30} className="flex min-w-0 flex-col border-r border-border">
        {editor}
      </Panel>
      <Separator className="w-1 cursor-col-resize bg-border transition-colors hover:bg-accent data-[state=dragging]:bg-accent" />
      <Panel id="terminal" defaultSize={42} minSize={25} className="flex min-w-0 flex-col">
        {terminal}
      </Panel>
    </Group>
  )
}
