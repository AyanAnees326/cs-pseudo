import { Play, Square } from 'lucide-react'
import { useRunner } from '../../hooks/useRunner'
import { useFilesStore } from '../../app/store/filesStore'

export default function RunControls() {
  const { status, run, stop } = useRunner()
  const activeFile = useFilesStore((s) => s.files.find((f) => f.id === s.activeFileId))
  const isBusy = status === 'running' || status === 'awaiting-input'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isBusy || !activeFile}
        onClick={() => activeFile && run(activeFile.content)}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-contrast shadow-glow transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        <Play size={15} fill="currentColor" />
        Run
      </button>
      <button
        type="button"
        disabled={!isBusy}
        onClick={stop}
        aria-label="Stop"
        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Square size={13} fill="currentColor" />
      </button>
    </div>
  )
}
