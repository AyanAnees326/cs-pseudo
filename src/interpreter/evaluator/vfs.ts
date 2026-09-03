const STORAGE_PREFIX = 'csPseudo:vfs:'

type FileMode = 'READ' | 'WRITE' | 'APPEND'

interface OpenHandle {
  name: string
  mode: FileMode
  readCursor: number // index into lines, only used for READ
  lines: string[]
}

/**
 * A localStorage-backed virtual filesystem simulating OPENFILE/READFILE/
 * WRITEFILE/CLOSEFILE/EOF for CAIE pseudocode, since the browser has no
 * real disk. One instance is created per run so open-handle state doesn't
 * leak between runs; the underlying storage persists across runs/reloads.
 */
export class VirtualFileSystem {
  private handles = new Map<string, OpenHandle>()

  private key(name: string): string {
    return STORAGE_PREFIX + name
  }

  private load(name: string): string[] {
    const raw = localStorage.getItem(this.key(name))
    if (raw === null) return []
    return raw.length === 0 ? [] : raw.split('\n')
  }

  private save(name: string, lines: string[]): void {
    localStorage.setItem(this.key(name), lines.join('\n'))
  }

  exists(name: string): boolean {
    return localStorage.getItem(this.key(name)) !== null
  }

  isOpen(name: string): boolean {
    return this.handles.has(name.toUpperCase())
  }

  open(name: string, mode: FileMode): void {
    const key = name.toUpperCase()
    if (mode === 'READ') {
      const lines = this.load(name)
      this.handles.set(key, { name, mode, readCursor: 0, lines })
    } else if (mode === 'WRITE') {
      this.save(name, [])
      this.handles.set(key, { name, mode, readCursor: 0, lines: [] })
    } else {
      const lines = this.load(name)
      this.handles.set(key, { name, mode, readCursor: lines.length, lines })
    }
  }

  close(name: string): void {
    this.handles.delete(name.toUpperCase())
  }

  getHandle(name: string): OpenHandle | undefined {
    return this.handles.get(name.toUpperCase())
  }

  eof(name: string): boolean {
    const h = this.getHandle(name)
    if (!h) return true
    return h.readCursor >= h.lines.length
  }

  readLine(name: string): string | null {
    const h = this.getHandle(name)
    if (!h) return null
    if (h.readCursor >= h.lines.length) return null
    return h.lines[h.readCursor++]
  }

  writeLine(name: string, data: string): void {
    const h = this.getHandle(name)
    if (!h) return
    h.lines.push(data)
    this.save(name, h.lines)
  }

  reset(name: string): void {
    localStorage.removeItem(this.key(name))
  }

  listFiles(): string[] {
    const files: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) files.push(key.slice(STORAGE_PREFIX.length))
    }
    return files
  }

  readAll(name: string): string[] {
    return this.load(name)
  }
}
