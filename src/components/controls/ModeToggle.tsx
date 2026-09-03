import { GraduationCap, Timer } from 'lucide-react'
import { useModeStore } from '../../app/store/modeStore'

export default function ModeToggle() {
  const mode = useModeStore((s) => s.mode)
  const setMode = useModeStore((s) => s.setMode)

  return (
    <div
      role="radiogroup"
      aria-label="Learning or Test mode"
      className="flex items-center rounded-lg border border-border bg-surface p-0.5 text-sm"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'learning'}
        onClick={() => setMode('learning')}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
          mode === 'learning' ? 'bg-accent text-accent-contrast shadow-glow' : 'text-text-muted hover:text-text'
        }`}
      >
        <GraduationCap size={15} />
        Learning
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'test'}
        onClick={() => setMode('test')}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
          mode === 'test' ? 'bg-accent text-accent-contrast shadow-glow' : 'text-text-muted hover:text-text'
        }`}
      >
        <Timer size={15} />
        Test
      </button>
    </div>
  )
}
