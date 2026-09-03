import { useState } from 'react'
import { FolderOpen, Trash2, X } from 'lucide-react'
import { VirtualFileSystem } from '../../interpreter'

export default function VfsDrawer() {
  const [open, setOpen] = useState(false)
  const [, forceRerender] = useState(0)
  const vfs = new VirtualFileSystem()
  const files = vfs.listFiles()

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-text"
      >
        <FolderOpen size={14} />
        Virtual files {files.length > 0 && `(${files.length})`}
      </button>
      {open && (
        <div className="max-h-40 overflow-y-auto scrollbar-thin px-4 pb-3 font-mono text-xs">
          {files.length === 0 && <p className="text-text-faint">No files yet — OPENFILE/WRITEFILE will create them here.</p>}
          {files.map((name) => (
            <div key={name} className="flex items-center justify-between gap-2 border-b border-border/50 py-1.5">
              <span className="text-text">{name}</span>
              <div className="flex items-center gap-2 text-text-faint">
                <span>{vfs.readAll(name).length} lines</span>
                <button
                  type="button"
                  aria-label={`Reset ${name}`}
                  onClick={() => {
                    vfs.reset(name)
                    forceRerender((n) => n + 1)
                  }}
                  className="text-danger/70 hover:text-danger"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {files.length > 0 && (
            <button
              type="button"
              onClick={() => {
                for (const f of files) vfs.reset(f)
                forceRerender((n) => n + 1)
              }}
              className="mt-2 flex items-center gap-1 text-text-faint hover:text-danger"
            >
              <X size={12} /> Reset all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
