import type { ReactNode } from 'react'
import { Code2, SquareTerminal } from 'lucide-react'

export type MobilePane = 'code' | 'console'

interface MobilePaneSwitcherProps {
  editor: ReactNode
  terminal: ReactNode
  active: MobilePane
  hasUnread: boolean
  onChange: (pane: MobilePane) => void
}

export default function MobilePaneSwitcher({ editor, terminal, active, hasUnread, onChange }: MobilePaneSwitcherProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex min-w-0 flex-1 flex-col ${active === 'code' ? 'flex' : 'hidden'}`}>{editor}</div>
        <div className={`flex min-w-0 flex-1 flex-col ${active === 'console' ? 'flex' : 'hidden'}`}>{terminal}</div>
      </div>
      <div role="tablist" aria-label="Code or Console" className="flex border-t border-border bg-canvas-raised">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'code'}
          onClick={() => onChange('code')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${
            active === 'code' ? 'text-accent' : 'text-text-muted'
          }`}
        >
          <Code2 size={16} />
          Code
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'console'}
          onClick={() => onChange('console')}
          className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${
            active === 'console' ? 'text-accent' : 'text-text-muted'
          }`}
        >
          <SquareTerminal size={16} />
          Console
          {hasUnread && active !== 'console' && <span className="absolute right-[30%] top-1.5 h-1.5 w-1.5 rounded-full bg-success" />}
        </button>
      </div>
    </div>
  )
}
