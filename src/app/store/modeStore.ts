import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'learning' | 'test'

interface ModeState {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

export const useModeStore = create<ModeState>()(
  persist(
    (set, get) => ({
      mode: 'learning',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'learning' ? 'test' : 'learning' }),
    }),
    { name: 'cs-pseudo-mode' },
  ),
)
