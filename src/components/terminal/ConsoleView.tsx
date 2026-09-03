import { useEffect, useRef } from 'react'
import { useRunner } from '../../hooks/useRunner'
import { useModeStore } from '../../app/store/modeStore'
import InputLine from './InputLine'

export default function ConsoleView() {
  const { entries, status } = useRunner()
  const mode = useModeStore((s) => s.mode)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [entries, status])

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div
        ref={scrollRef}
        aria-live="polite"
        className="cs-console scrollbar-thin flex-1 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed"
      >
        {entries.length === 0 && status === 'idle' && (
          <p className="text-text-faint">Press Run to execute your program. Output appears here.</p>
        )}
        {entries.map((entry) => {
          if (entry.type === 'output') {
            return (
              <pre key={entry.id} className="whitespace-pre-wrap break-words text-text">
                {entry.text}
              </pre>
            )
          }
          if (entry.type === 'input-echo') {
            return (
              <div key={entry.id} className="whitespace-pre-wrap break-words text-accent-strong">
                <span className="text-text-faint">{'> '}</span>
                {entry.text}
              </div>
            )
          }
          if (entry.type === 'system') {
            return (
              <div key={entry.id} className="mt-1 text-text-faint italic">
                {entry.text}
              </div>
            )
          }
          // 'error' — Learning mode only. Defensive second filter: never render one in Test mode
          // even though the runner never constructs this entry type there in the first place.
          if (mode !== 'learning') return null
          return (
            <div key={entry.id} className="mt-1 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger">
              <div className="font-semibold">
                {entry.error.code} · line {entry.error.span.line}
              </div>
              <div>{entry.error.message}</div>
              {entry.error.hint && <div className="mt-1 text-danger/80">Hint: {entry.error.hint}</div>}
            </div>
          )
        })}
      </div>
      {status === 'awaiting-input' && <InputLine />}
    </div>
  )
}
