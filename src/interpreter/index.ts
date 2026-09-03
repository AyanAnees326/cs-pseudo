import { lex } from './lexer/lexer'
import { parse } from './parser/parser'
import { runProgram, createContext, type Effect } from './evaluator/evaluator'
import { VirtualFileSystem } from './evaluator/vfs'
import type { PseudocodeError } from './errors/PseudocodeError'
import type { ProgramNode } from './parser/ast'

export type { Effect } from './evaluator/evaluator'
export { PseudocodeError, isPseudocodeError } from './errors/PseudocodeError'
export { VirtualFileSystem } from './evaluator/vfs'

export interface CompileResult {
  program: ProgramNode | null
  diagnostics: PseudocodeError[]
}

/** Lex + parse only — used by the editor's live linter (both modes run this internally; only Learning mode displays it). */
export function compile(source: string): CompileResult {
  const { tokens, errors: lexErrors } = lex(source)
  const { program, errors: parseErrors } = parse(tokens)
  return { program, diagnostics: [...lexErrors, ...parseErrors] }
}

/**
 * Runs a full program, starting from source. Yields I/O effects and throws
 * PseudocodeError on failure — callers (the Runner) decide how to present
 * that, never the interpreter itself.
 */
export function* run(source: string, vfs: VirtualFileSystem = new VirtualFileSystem()): Generator<Effect, void, string> {
  const { program, diagnostics } = compile(source)
  const fatalDiagnostic = diagnostics.find((d) => d.severity === 'error')
  if (fatalDiagnostic) throw fatalDiagnostic
  const ctx = createContext(vfs)
  yield* runProgram(program!, ctx)
}
