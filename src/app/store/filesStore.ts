import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PracticeFile {
  id: string
  name: string
  content: string
  updatedAt: number
  /** Set when this file was opened from a Library practice question — lets the editor show a QuestionPanel. */
  questionId?: string
}

const DEFAULT_CONTENT = `// Write CAIE pseudocode here and press Run.
DECLARE name : STRING
OUTPUT "What is your name?"
INPUT name
OUTPUT "Hello, " & name & "!"
`

function makeFile(name: string, content = '', questionId?: string): PracticeFile {
  return { id: crypto.randomUUID(), name, content, updatedAt: Date.now(), questionId }
}

interface FilesState {
  files: PracticeFile[]
  activeFileId: string
  createFile: (name?: string, content?: string, questionId?: string) => string
  updateFileContent: (id: string, content: string) => void
  renameFile: (id: string, name: string) => void
  deleteFile: (id: string) => void
  setActiveFile: (id: string) => void
  unlinkQuestion: (id: string) => void
}

const initialFile = makeFile('main', DEFAULT_CONTENT)

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: [initialFile],
      activeFileId: initialFile.id,

      createFile: (name = 'untitled', content = '', questionId) => {
        const file = makeFile(name, content, questionId)
        set((s) => ({ files: [...s.files, file], activeFileId: file.id }))
        return file.id
      },

      updateFileContent: (id, content) => {
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, content, updatedAt: Date.now() } : f)),
        }))
      },

      renameFile: (id, name) => {
        set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, name } : f)) }))
      },

      deleteFile: (id) => {
        const { files, activeFileId } = get()
        if (files.length <= 1) return
        const remaining = files.filter((f) => f.id !== id)
        set({
          files: remaining,
          activeFileId: activeFileId === id ? remaining[0].id : activeFileId,
        })
      },

      setActiveFile: (id) => set({ activeFileId: id }),

      unlinkQuestion: (id) => {
        set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, questionId: undefined } : f)) }))
      },
    }),
    { name: 'cs-pseudo-files' },
  ),
)
