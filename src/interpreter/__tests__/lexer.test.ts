import { describe, it, expect } from 'vitest'
import { lex } from '../lexer/lexer'

describe('lexer', () => {
  it('tokenizes multi-char operators greedily', () => {
    const { tokens, errors } = lex('x <- 1\ny <> 2\nz <= 3\nw >= 4')
    expect(errors).toHaveLength(0)
    const types = tokens.filter((t) => t.type !== 'NEWLINE' && t.type !== 'EOF_TOKEN').map((t) => t.type)
    expect(types).toEqual([
      'IDENTIFIER',
      'ARROW',
      'INTEGER_LITERAL',
      'IDENTIFIER',
      'NE',
      'INTEGER_LITERAL',
      'IDENTIFIER',
      'LE',
      'INTEGER_LITERAL',
      'IDENTIFIER',
      'GE',
      'INTEGER_LITERAL',
    ])
  })

  it('distinguishes < from <- <= <>', () => {
    const { tokens } = lex('a < b')
    expect(tokens[1].type).toBe('LT')
  })

  it('strips // comments to end of line', () => {
    const { tokens } = lex('x <- 1 // this is a comment\ny <- 2')
    const values = tokens.map((t) => t.value)
    expect(values.join(' ')).not.toContain('comment')
  })

  it('tracks line and column numbers', () => {
    const { tokens } = lex('a\nbb')
    const bb = tokens.find((t) => t.value === 'bb')!
    expect(bb.span.line).toBe(2)
    expect(bb.span.col).toBe(1)
  })

  it('rejects lowercase keywords with a LOWERCASE_KEYWORD error but still tokenizes them', () => {
    const { tokens, errors } = lex('declare x : INTEGER')
    expect(errors.some((e) => e.code === 'LOWERCASE_KEYWORD')).toBe(true)
    expect(tokens[0].type).toBe('DECLARE')
  })

  it('reads string and char literals', () => {
    const { tokens, errors } = lex(`OUTPUT "hello", 'A'`)
    expect(errors).toHaveLength(0)
    expect(tokens.find((t) => t.type === 'STRING_LITERAL')?.value).toBe('hello')
    expect(tokens.find((t) => t.type === 'CHAR_LITERAL')?.value).toBe('A')
  })

  it('flags unterminated strings', () => {
    const { errors } = lex('OUTPUT "unterminated')
    expect(errors.some((e) => e.code === 'UNTERMINATED_STRING')).toBe(true)
  })

  it('parses integer vs real literals', () => {
    const { tokens } = lex('1 2.5')
    expect(tokens[0].type).toBe('INTEGER_LITERAL')
    expect(tokens[1].type).toBe('REAL_LITERAL')
  })
})
