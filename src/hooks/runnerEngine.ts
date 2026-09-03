import { run as runInterpreter, VirtualFileSystem, isPseudocodeError } from '../interpreter'
import type { Effect } from '../interpreter'
import err from '../interpreter/errors/errorCodes'
import { useRunStore } from '../app/store/runStore'
import { useModeStore } from '../app/store/modeStore'

const MAX_RUN_MS = 8000
const YIELD_EVERY = 4000
const ZERO_SPAN = { line: 0, col: 0, endLine: 0, endCol: 0 }

/**
 * The sole place mode-gating of error display occurs. The interpreter always
 * throws full, rich PseudocodeErrors regardless of mode — Learning mode
 * renders them, Test mode's catch block below simply never constructs a
 * terminal entry from them. The one exception is a runaway-loop stop, which
 * is treated as run-state chrome (shown in both modes) rather than a
 * pseudocode diagnostic, so the app never looks frozen.
 */
class RunnerEngine {
  private inputResolver: ((value: string) => void) | null = null
  private aborted = false
  private running = false

  get isRunning(): boolean {
    return this.running
  }

  async run(source: string): Promise<void> {
    if (this.running) return
    const store = useRunStore.getState()
    store.clear()
    store.setStatus('running')
    this.aborted = false
    this.running = true

    const vfs = new VirtualFileSystem()
    const gen = runInterpreter(source, vfs)

    let sent: string | undefined
    let steps = 0
    const startTime = performance.now()

    try {
      for (;;) {
        if (this.aborted) {
          store.pushEntry({ type: 'system', text: 'Stopped.' })
          store.setStatus('stopped')
          return
        }

        const { value: effect, done } = gen.next(sent as string)
        if (done) break
        sent = undefined

        if (!this.handleOutputEffect(effect, store)) {
          // input effect: pause and wait for the terminal to supply a value
          if (effect.type === 'input') {
            store.setStatus('awaiting-input')
            sent = await new Promise<string>((resolve) => {
              this.inputResolver = resolve
            })
            if (this.aborted) {
              store.pushEntry({ type: 'system', text: 'Stopped.' })
              store.setStatus('stopped')
              return
            }
            store.setStatus('running')
          } else {
            steps++
            if (steps % YIELD_EVERY === 0) {
              await new Promise((r) => setTimeout(r, 0))
              if (performance.now() - startTime > MAX_RUN_MS) {
                throw err.stepLimitExceeded(ZERO_SPAN)
              }
            }
          }
        }
      }
      store.pushEntry({ type: 'system', text: 'Program finished.' })
      store.setStatus('finished')
    } catch (e) {
      this.handleFailure(e, store)
    } finally {
      this.running = false
      this.inputResolver = null
    }
  }

  private handleOutputEffect(effect: Effect, store: ReturnType<typeof useRunStore.getState>): boolean {
    if (effect.type === 'output') {
      store.pushEntry({ type: 'output', text: effect.text })
      return true
    }
    return false
  }

  private handleFailure(e: unknown, store: ReturnType<typeof useRunStore.getState>): void {
    if (!isPseudocodeError(e)) throw e

    if (e.code === 'STEP_LIMIT_EXCEEDED') {
      store.pushEntry({ type: 'system', text: 'Stopped: step limit exceeded (possible infinite loop).' })
      store.setStatus('stopped')
      return
    }

    if (useModeStore.getState().mode === 'learning') {
      store.pushEntry({ type: 'error', error: e })
    }
    // Test mode: swallow silently — no terminal output beyond whatever ran before the failure.
    store.setStatus('finished')
  }

  stop(): void {
    this.aborted = true
    if (this.inputResolver) {
      const resolve = this.inputResolver
      this.inputResolver = null
      resolve('')
    }
  }

  submitInput(value: string): void {
    if (!this.inputResolver) return
    const resolve = this.inputResolver
    this.inputResolver = null
    resolve(value)
  }
}

export const runnerEngine = new RunnerEngine()
