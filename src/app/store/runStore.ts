import { create } from 'zustand'
import type { ConsoleEntry, ConsoleEntryInput, RunStatus } from '../../types/console'

let nextId = 0
function makeId(): string {
  nextId += 1
  return `entry-${nextId}`
}

interface RunState {
  status: RunStatus
  entries: ConsoleEntry[]
  setStatus: (status: RunStatus) => void
  pushEntry: (entry: ConsoleEntryInput) => void
  clear: () => void
}

export const useRunStore = create<RunState>()((set) => ({
  status: 'idle',
  entries: [],
  setStatus: (status) => set({ status }),
  pushEntry: (entry) => set((s) => ({ entries: [...s.entries, { ...entry, id: makeId() } as ConsoleEntry] })),
  clear: () => set({ entries: [], status: 'idle' }),
}))
