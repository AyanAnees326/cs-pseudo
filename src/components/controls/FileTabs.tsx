import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useFilesStore } from '../../app/store/filesStore'

export default function FileTabs() {
  const files = useFilesStore((s) => s.files)
  const activeFileId = useFilesStore((s) => s.activeFileId)
  const setActiveFile = useFilesStore((s) => s.setActiveFile)
  const createFile = useFilesStore((s) => s.createFile)
  const deleteFile = useFilesStore((s) => s.deleteFile)
  const renameFile = useFilesStore((s) => s.renameFile)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  function commitRename() {
    if (editingId && draftName.trim()) renameFile(editingId, draftName.trim())
    setEditingId(null)
  }

  return (
    <div role="tablist" aria-label="Open files" className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-thin">
      {files.map((f) => {
        const active = f.id === activeFileId
        return (
          <div
            key={f.id}
            role="tab"
            tabIndex={0}
            aria-selected={active}
            onClick={() => setActiveFile(f.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveFile(f.id)
              }
            }}
            onDoubleClick={() => {
              setEditingId(f.id)
              setDraftName(f.name)
            }}
            className={`group flex shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-1.5 text-sm transition-colors ${
              active ? 'border-accent bg-surface text-text' : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {editingId === f.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-24 rounded border border-border-strong bg-canvas px-1 text-text outline-none"
              />
            ) : (
              <span className="max-w-[10rem] truncate font-mono">{f.name}</span>
            )}
            {files.length > 1 && (
              <button
                type="button"
                aria-label={`Close ${f.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(f.id)
                }}
                className="rounded p-0.5 text-text-faint opacity-0 hover:text-danger group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )
      })}
      <button
        type="button"
        aria-label="New file"
        onClick={() => createFile(`file${files.length + 1}`)}
        className="shrink-0 rounded-md p-1.5 text-text-faint hover:bg-surface hover:text-text"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
