import { useState } from 'react'
import { ChevronDown, ChevronUp, X, Code } from 'lucide-react'
import { curriculum } from '../../content/curriculum'
import SyllabusTag from '../ui/SyllabusTag'

interface QuestionPanelProps {
  questionId: string
  onDismiss: () => void
}

export default function QuestionPanel({ questionId, onDismiss }: QuestionPanelProps) {
  const entry = curriculum.find((e) => e.id === questionId)
  const [collapsed, setCollapsed] = useState(false)
  const [showStructure, setShowStructure] = useState(false)

  if (!entry) return null

  return (
    <div className="shrink-0 border-b border-border bg-canvas-raised px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-text">{entry.title}</h2>
            <SyllabusTag syllabusRef={entry.syllabusRef} />
          </div>
          {!collapsed && <p className="mt-1 text-sm text-text-muted">{entry.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={collapsed ? 'Expand question' : 'Collapse question'}
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-text-faint hover:text-text"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button type="button" aria-label="Dismiss question" onClick={onDismiss} className="rounded p-1 text-text-faint hover:text-text">
            <X size={16} />
          </button>
        </div>
      </div>

      {!collapsed && entry.starterCode.trim().length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowStructure((s) => !s)}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <Code size={12} />
            {showStructure ? 'Hide given structure' : 'Show given structure'}
          </button>
          {showStructure && (
            <pre className="mt-2 scrollbar-thin overflow-x-auto rounded-lg border border-border bg-canvas p-3 font-mono text-xs text-text">
              {entry.starterCode}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
