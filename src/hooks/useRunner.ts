import { useCallback } from 'react'
import { useRunStore } from '../app/store/runStore'
import { runnerEngine } from './runnerEngine'

export function useRunner() {
  const status = useRunStore((s) => s.status)
  const entries = useRunStore((s) => s.entries)

  const run = useCallback((source: string) => {
    void runnerEngine.run(source)
  }, [])

  const stop = useCallback(() => runnerEngine.stop(), [])
  const submitInput = useCallback((value: string) => runnerEngine.submitInput(value), [])

  return { status, entries, run, stop, submitInput }
}
