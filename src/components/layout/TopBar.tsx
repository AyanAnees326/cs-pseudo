import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Moon, SunMedium, TerminalSquare } from 'lucide-react'
import FileTabs from '../controls/FileTabs'
import ModeToggle from '../controls/ModeToggle'
import RunControls from '../controls/RunControls'
import { useThemeStore } from '../../app/store/themeStore'

export default function TopBar() {
  const location = useLocation()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const isLight = theme === 'light'

  return (
    <header className="flex flex-col gap-2 border-b border-border bg-canvas-raised px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-bold text-text">
          <TerminalSquare size={18} className="text-accent" />
          PseudoIDE
        </Link>
        {location.pathname === '/' && <FileTabs />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/library"
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
        >
          <BookOpen size={15} />
          Library
        </Link>
        <ModeToggle />
        {location.pathname === '/' && <RunControls />}
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          className="rounded-lg border border-border p-1.5 text-text-muted transition-colors hover:text-text"
        >
          {isLight ? <Moon size={15} /> : <SunMedium size={15} />}
        </button>
      </div>
    </header>
  )
}
