import type { Span } from '../lexer/tokens'
import { PseudocodeError } from './PseudocodeError'

/** Levenshtein distance, used to suggest "did you mean X?" for near-miss keywords/identifiers. */
export function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

export function nearestMatch(word: string, candidates: string[], maxDistance = 2): string | undefined {
  let best: string | undefined
  let bestDist = maxDistance + 1
  for (const c of candidates) {
    const d = levenshtein(word.toUpperCase(), c.toUpperCase())
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  return bestDist <= maxDistance ? best : undefined
}

const err = {
  unexpectedChar: (ch: string, span: Span) =>
    new PseudocodeError({
      stage: 'lex',
      code: 'UNEXPECTED_CHARACTER',
      message: `Unexpected character '${ch}'.`,
      span,
    }),

  unterminatedString: (span: Span) =>
    new PseudocodeError({
      stage: 'lex',
      code: 'UNTERMINATED_STRING',
      message: 'String literal is missing a closing quote.',
      span,
      hint: 'Every " must be paired with a closing ".',
    }),

  unterminatedChar: (span: Span) =>
    new PseudocodeError({
      stage: 'lex',
      code: 'UNTERMINATED_CHAR',
      message: "Character literal is missing a closing quote.",
      span,
      hint: "A CHAR literal is a single character in single quotes, e.g. 'A'.",
    }),

  invalidCharLiteral: (span: Span) =>
    new PseudocodeError({
      stage: 'lex',
      code: 'INVALID_CHAR_LITERAL',
      message: 'A CHAR literal must contain exactly one character.',
      span,
    }),

  lowercaseKeyword: (word: string, upper: string, span: Span) =>
    new PseudocodeError({
      stage: 'lex',
      code: 'LOWERCASE_KEYWORD',
      message: `'${word}' must be written in uppercase.`,
      span,
      hint: `CAIE pseudocode keywords are always uppercase — use ${upper}.`,
    }),

  expectedToken: (expected: string, gotDescription: string, span: Span) =>
    new PseudocodeError({
      stage: 'parse',
      code: 'EXPECTED_TOKEN',
      message: `Expected ${expected} but found ${gotDescription}.`,
      span,
    }),

  expectedBlockEnd: (opener: string, closer: string, span: Span) =>
    new PseudocodeError({
      stage: 'parse',
      code: 'BLOCK_NOT_CLOSED',
      message: `Expected ${closer} to close this ${opener} block.`,
      span,
      hint: `Every ${opener} must be closed with ${closer}.`,
    }),

  unknownStatement: (word: string, span: Span, suggestion?: string) =>
    new PseudocodeError({
      stage: 'parse',
      code: 'UNKNOWN_STATEMENT',
      message: `'${word}' is not a recognised statement.`,
      span,
      hint: suggestion ? `Did you mean ${suggestion}?` : undefined,
    }),

  expectedExpression: (gotDescription: string, span: Span) =>
    new PseudocodeError({
      stage: 'parse',
      code: 'EXPECTED_EXPRESSION',
      message: `Expected an expression but found ${gotDescription}.`,
      span,
    }),

  invalidArrayBounds: (span: Span) =>
    new PseudocodeError({
      stage: 'parse',
      code: 'INVALID_ARRAY_BOUNDS',
      message: 'Array declaration needs bounds in the form [lower:upper].',
      span,
      hint: 'Example: DECLARE numbers : ARRAY[1:10] OF INTEGER',
    }),

  undeclaredVariable: (name: string, span: Span, suggestion?: string) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'UNDECLARED_VARIABLE',
      message: `'${name}' has not been declared.`,
      span,
      hint: suggestion ? `Did you mean '${suggestion}'?` : `Add DECLARE ${name} : <type> before using it.`,
    }),

  alreadyDeclared: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'ALREADY_DECLARED',
      message: `'${name}' has already been declared.`,
      span,
    }),

  assignToConstant: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'ASSIGN_TO_CONSTANT',
      message: `Cannot assign to '${name}' because it is a CONSTANT.`,
      span,
    }),

  typeMismatch: (expected: string, gotType: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'TYPE_MISMATCH',
      message: `Expected a value of type ${expected} but got ${gotType}.`,
      span,
    }),

  divByZero: (span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'DIVISION_BY_ZERO',
      message: 'Division by zero.',
      span,
    }),

  arrayIndexOutOfBounds: (index: number, lower: number, upper: number, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'ARRAY_INDEX_OUT_OF_BOUNDS',
      message: `Array index ${index} is out of bounds (valid range is ${lower} to ${upper}).`,
      span,
    }),

  wrongArgCount: (name: string, expected: number, got: number, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'WRONG_ARGUMENT_COUNT',
      message: `'${name}' expects ${expected} argument(s) but got ${got}.`,
      span,
    }),

  notCallable: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'NOT_CALLABLE',
      message: `'${name}' is not a PROCEDURE or FUNCTION.`,
      span,
    }),

  missingReturn: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'MISSING_RETURN',
      message: `FUNCTION '${name}' did not RETURN a value.`,
      span,
    }),

  fileNotOpen: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'FILE_NOT_OPEN',
      message: `File '${name}' is not open.`,
      span,
      hint: `Use OPENFILE ${name} FOR READ/WRITE/APPEND first.`,
    }),

  fileNotFound: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'FILE_NOT_FOUND',
      message: `File '${name}' does not exist.`,
      span,
    }),

  readPastEof: (name: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'READ_PAST_EOF',
      message: `Attempted to READFILE past the end of '${name}'.`,
      span,
      hint: `Check EOF(${name}) before each READFILE.`,
    }),

  unknownBuiltin: (name: string, span: Span, suggestion?: string) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'UNKNOWN_FUNCTION',
      message: `'${name}' is not a known function.`,
      span,
      hint: suggestion ? `Did you mean ${suggestion}?` : undefined,
    }),

  unknownField: (field: string, typeName: string, span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'UNKNOWN_FIELD',
      message: `'${typeName}' has no field '${field}'.`,
      span,
    }),

  notAnArray: (span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'NOT_AN_ARRAY',
      message: 'This value is not an array and cannot be indexed.',
      span,
    }),

  notARecord: (span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'NOT_A_RECORD',
      message: 'This value is not a record and has no fields.',
      span,
    }),

  invalidCaseValue: (span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'INVALID_CASE_VALUE',
      message: 'CASE OF value must be a literal constant.',
      span,
    }),

  stepLimitExceeded: (span: Span) =>
    new PseudocodeError({
      stage: 'runtime',
      code: 'STEP_LIMIT_EXCEEDED',
      message: 'Execution stopped: step limit exceeded (possible infinite loop).',
      span,
    }),
}

export default err
