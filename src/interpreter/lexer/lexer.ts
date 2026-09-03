import { KEYWORDS, type Token, type TokenType, type Span } from './tokens'
import err from '../errors/errorCodes'
import type { PseudocodeError } from '../errors/PseudocodeError'

export interface LexResult {
  tokens: Token[]
  errors: PseudocodeError[]
}

const SINGLE_CHAR: Record<string, TokenType> = {
  '+': 'PLUS',
  '-': 'MINUS',
  '*': 'STAR',
  '/': 'SLASH',
  '&': 'AMP',
  '(': 'LPAREN',
  ')': 'RPAREN',
  '[': 'LBRACKET',
  ']': 'RBRACKET',
  ',': 'COMMA',
  ':': 'COLON',
  '.': 'DOT',
  '^': 'CARET',
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch)
}

function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch)
}

/**
 * Tokenizes CAIE pseudocode. Keywords must be exact uppercase, per the
 * official convention — a lowercase/mixed-case spelling of a keyword is
 * reported as a LOWERCASE_KEYWORD error rather than silently accepted,
 * so students build exam-accurate habits.
 */
export function lex(source: string): LexResult {
  const tokens: Token[] = []
  const errors: PseudocodeError[] = []

  let pos = 0
  let line = 1
  let col = 1

  const peek = (offset = 0) => source[pos + offset]
  const atEnd = () => pos >= source.length

  function advance(): string {
    const ch = source[pos]
    pos++
    if (ch === '\n') {
      line++
      col = 1
    } else {
      col++
    }
    return ch
  }

  function makeSpan(startLine: number, startCol: number): Span {
    return { line: startLine, col: startCol, endLine: line, endCol: col }
  }

  function push(type: TokenType, value: string, startLine: number, startCol: number) {
    tokens.push({ type, value, span: makeSpan(startLine, startCol) })
  }

  while (!atEnd()) {
    const ch = peek()
    const startLine = line
    const startCol = col

    // whitespace (not newline)
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance()
      continue
    }

    // newline is a meaningful statement separator
    if (ch === '\n') {
      advance()
      push('NEWLINE', '\n', startLine, startCol)
      continue
    }

    // comments
    if (ch === '/' && peek(1) === '/') {
      while (!atEnd() && peek() !== '\n') advance()
      continue
    }

    // strings
    if (ch === '"') {
      advance()
      let value = ''
      while (!atEnd() && peek() !== '"' && peek() !== '\n') {
        value += advance()
      }
      if (peek() !== '"') {
        errors.push(err.unterminatedString(makeSpan(startLine, startCol)))
      } else {
        advance()
      }
      push('STRING_LITERAL', value, startLine, startCol)
      continue
    }

    // char literals
    if (ch === "'") {
      advance()
      let value = ''
      while (!atEnd() && peek() !== "'" && peek() !== '\n') {
        value += advance()
      }
      if (peek() !== "'") {
        errors.push(err.unterminatedChar(makeSpan(startLine, startCol)))
      } else {
        advance()
      }
      if (value.length !== 1) {
        errors.push(err.invalidCharLiteral(makeSpan(startLine, startCol)))
      }
      push('CHAR_LITERAL', value, startLine, startCol)
      continue
    }

    // numbers
    if (isDigit(ch)) {
      let value = ''
      while (!atEnd() && isDigit(peek())) value += advance()
      let isReal = false
      if (peek() === '.' && isDigit(peek(1))) {
        isReal = true
        value += advance() // '.'
        while (!atEnd() && isDigit(peek())) value += advance()
      }
      push(isReal ? 'REAL_LITERAL' : 'INTEGER_LITERAL', value, startLine, startCol)
      continue
    }

    // identifiers / keywords
    if (isIdentStart(ch)) {
      let value = ''
      while (!atEnd() && isIdentPart(peek())) value += advance()

      const upper = value.toUpperCase()
      if (upper === 'TRUE') {
        push('TRUE', value, startLine, startCol)
        continue
      }
      if (upper === 'FALSE') {
        push('FALSE', value, startLine, startCol)
        continue
      }

      if (Object.prototype.hasOwnProperty.call(KEYWORDS, value)) {
        push(KEYWORDS[value], value, startLine, startCol)
        continue
      }

      // exact match failed — is this a lowercase/mixed-case spelling of a keyword?
      if (Object.prototype.hasOwnProperty.call(KEYWORDS, upper)) {
        errors.push(err.lowercaseKeyword(value, upper, makeSpan(startLine, startCol)))
        push(KEYWORDS[upper], value, startLine, startCol)
        continue
      }

      push('IDENTIFIER', value, startLine, startCol)
      continue
    }

    // multi-char operators (must be checked before single-char forms)
    if (ch === '<') {
      advance()
      if (peek() === ('-' as string)) {
        advance()
        push('ARROW', '<-', startLine, startCol)
        continue
      }
      if (peek() === ('>' as string)) {
        advance()
        push('NE', '<>', startLine, startCol)
        continue
      }
      if (peek() === ('=' as string)) {
        advance()
        push('LE', '<=', startLine, startCol)
        continue
      }
      push('LT', '<', startLine, startCol)
      continue
    }

    if (ch === '>') {
      advance()
      if (peek() === ('=' as string)) {
        advance()
        push('GE', '>=', startLine, startCol)
        continue
      }
      push('GT', '>', startLine, startCol)
      continue
    }

    if (ch === '=') {
      advance()
      push('EQ', '=', startLine, startCol)
      continue
    }

    if (Object.prototype.hasOwnProperty.call(SINGLE_CHAR, ch)) {
      advance()
      push(SINGLE_CHAR[ch], ch, startLine, startCol)
      continue
    }

    // unrecognised character
    advance()
    errors.push(err.unexpectedChar(ch, makeSpan(startLine, startCol)))
  }

  push('EOF_TOKEN', '', line, col)
  return { tokens, errors }
}
