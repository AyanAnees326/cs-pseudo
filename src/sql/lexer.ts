import { SqlError } from './types'

export type SqlTokenType =
  | 'SELECT'
  | 'FROM'
  | 'WHERE'
  | 'ORDER'
  | 'BY'
  | 'ASC'
  | 'DESC'
  | 'AND'
  | 'OR'
  | 'COUNT'
  | 'SUM'
  | 'AVG'
  | 'MAX'
  | 'MIN'
  | 'STAR'
  | 'IDENT'
  | 'STRING'
  | 'NUMBER'
  | 'EQ'
  | 'NE'
  | 'LT'
  | 'GT'
  | 'LE'
  | 'GE'
  | 'COMMA'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF'

export interface SqlToken {
  type: SqlTokenType
  value: string
}

const KEYWORDS: Record<string, SqlTokenType> = {
  SELECT: 'SELECT',
  FROM: 'FROM',
  WHERE: 'WHERE',
  ORDER: 'ORDER',
  BY: 'BY',
  ASC: 'ASC',
  DESC: 'DESC',
  AND: 'AND',
  OR: 'OR',
  COUNT: 'COUNT',
  SUM: 'SUM',
  AVG: 'AVG',
  MAX: 'MAX',
  MIN: 'MIN',
}

export function lexSql(source: string): SqlToken[] {
  const tokens: SqlToken[] = []
  let pos = 0

  const peek = (o = 0) => source[pos + o]
  const isDigit = (c: string) => c >= '0' && c <= '9'
  const isIdentStart = (c: string) => /[A-Za-z_]/.test(c)
  const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c)

  while (pos < source.length) {
    const ch = peek()

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      pos++
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      pos++
      let value = ''
      while (pos < source.length && peek() !== quote) value += source[pos++]
      if (peek() !== quote) throw new SqlError(`Unterminated string literal.`)
      pos++
      tokens.push({ type: 'STRING', value })
      continue
    }

    if (isDigit(ch)) {
      let value = ''
      while (pos < source.length && (isDigit(peek()) || peek() === '.')) value += source[pos++]
      tokens.push({ type: 'NUMBER', value })
      continue
    }

    if (isIdentStart(ch)) {
      let value = ''
      while (pos < source.length && isIdentPart(peek())) value += source[pos++]
      const upper = value.toUpperCase()
      tokens.push({ type: KEYWORDS[upper] ?? 'IDENT', value })
      continue
    }

    if (ch === '*') {
      pos++
      tokens.push({ type: 'STAR', value: '*' })
      continue
    }
    if (ch === ',') {
      pos++
      tokens.push({ type: 'COMMA', value: ',' })
      continue
    }
    if (ch === '(') {
      pos++
      tokens.push({ type: 'LPAREN', value: '(' })
      continue
    }
    if (ch === ')') {
      pos++
      tokens.push({ type: 'RPAREN', value: ')' })
      continue
    }
    if (ch === '<') {
      pos++
      if (peek() === '>') {
        pos++
        tokens.push({ type: 'NE', value: '<>' })
      } else if (peek() === '=') {
        pos++
        tokens.push({ type: 'LE', value: '<=' })
      } else {
        tokens.push({ type: 'LT', value: '<' })
      }
      continue
    }
    if (ch === '>') {
      pos++
      if (peek() === '=') {
        pos++
        tokens.push({ type: 'GE', value: '>=' })
      } else {
        tokens.push({ type: 'GT', value: '>' })
      }
      continue
    }
    if (ch === '=') {
      pos++
      tokens.push({ type: 'EQ', value: '=' })
      continue
    }
    if (ch === '!' && peek(1) === '=') {
      pos += 2
      tokens.push({ type: 'NE', value: '!=' })
      continue
    }

    throw new SqlError(`Unexpected character '${ch}' in query.`)
  }

  tokens.push({ type: 'EOF', value: '' })
  return tokens
}
