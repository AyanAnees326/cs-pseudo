import { run, VirtualFileSystem, isPseudocodeError, type PseudocodeError } from '../index'

export interface RunOutcome {
  output: string
  error: PseudocodeError | null
  vfs: VirtualFileSystem
}

/** Drives the interpreter's generator synchronously for tests, feeding canned INPUT responses in order. */
export function runSource(source: string, inputs: string[] = [], vfs = new VirtualFileSystem()): RunOutcome {
  const gen = run(source, vfs)
  let output = ''
  let error: PseudocodeError | null = null
  let inputIndex = 0
  let sent: string | undefined

  try {
    for (;;) {
      const { value: effect, done } = gen.next(sent as string)
      if (done) break
      if (effect.type === 'output') output += effect.text
      else if (effect.type === 'input') sent = inputs[inputIndex++] ?? ''
      else sent = undefined
    }
  } catch (e) {
    if (isPseudocodeError(e)) error = e
    else throw e
  }

  return { output, error, vfs }
}
