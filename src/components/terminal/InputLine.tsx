import { useEffect, useRef, useState } from 'react'
import { useRunStore } from '../../app/store/runStore'
import { useRunner } from '../../hooks/useRunner'

export default function InputLine() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { submitInput } = useRunner()
  const pushEntry = useRunStore((s) => s.pushEntry)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit() {
    pushEntry({ type: 'input-echo', text: value })
    submitInput(value)
    setValue('')
  }

  return (
    <div className="flex items-center gap-2 border-t border-border px-4 py-2 font-mono text-sm">
      <span className="text-accent">{'>'}</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
        }}
        aria-label="Program input"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 bg-transparent text-text outline-none placeholder:text-text-faint"
        placeholder="Type your input and press Enter…"
      />
    </div>
  )
}
