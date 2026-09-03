import type { Span } from '../lexer/tokens'

export type ErrorStage = 'lex' | 'parse' | 'runtime'
export type ErrorSeverity = 'error' | 'warning'

export interface PseudocodeErrorInit {
  stage: ErrorStage
  code: string
  message: string
  span: Span
  severity?: ErrorSeverity
  hint?: string
}

/**
 * The single error type produced by every stage of the interpreter.
 * Learning mode renders these fully (message/hint feed the editor's
 * linter/hover); Test mode's Runner catches and discards them without
 * ever constructing UI from them. The interpreter itself never branches
 * on mode.
 */
export class PseudocodeError extends Error {
  readonly stage: ErrorStage
  readonly code: string
  readonly span: Span
  readonly severity: ErrorSeverity
  readonly hint?: string

  constructor(init: PseudocodeErrorInit) {
    super(init.message)
    this.name = 'PseudocodeError'
    this.stage = init.stage
    this.code = init.code
    this.span = init.span
    this.severity = init.severity ?? 'error'
    this.hint = init.hint
  }
}

export function isPseudocodeError(err: unknown): err is PseudocodeError {
  return err instanceof PseudocodeError
}
