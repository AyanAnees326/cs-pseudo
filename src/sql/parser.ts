import { lexSql, type SqlToken, type SqlTokenType } from './lexer'
import { SqlError } from './types'
import type { AggFn, CompOp, ConditionExpr, SelectItem, SelectQuery } from './ast'

const AGG_FNS: SqlTokenType[] = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN']
const COMPARE_TYPES: Partial<Record<SqlTokenType, CompOp>> = {
  EQ: '=',
  NE: '<>',
  LT: '<',
  GT: '>',
  LE: '<=',
  GE: '>=',
}

class SqlParser {
  private tokens: SqlToken[]
  private pos = 0

  constructor(tokens: SqlToken[]) {
    this.tokens = tokens
  }

  private peek(o = 0): SqlToken {
    return this.tokens[Math.min(this.pos + o, this.tokens.length - 1)]
  }

  private at(type: SqlTokenType): boolean {
    return this.peek().type === type
  }

  private advance(): SqlToken {
    const t = this.tokens[this.pos]
    if (this.pos < this.tokens.length - 1) this.pos++
    return t
  }

  private expect(type: SqlTokenType, description: string): SqlToken {
    if (this.at(type)) return this.advance()
    const got = this.peek()
    throw new SqlError(`Expected ${description} but found ${got.type === 'EOF' ? 'end of query' : `'${got.value}'`}.`)
  }

  parseQuery(): SelectQuery {
    this.expect('SELECT', 'SELECT')
    const items = this.parseSelectList()
    this.expect('FROM', 'FROM')
    const table = this.expect('IDENT', 'a table name').value

    let where: ConditionExpr | null = null
    if (this.at('WHERE')) {
      this.advance()
      where = this.parseOr()
    }

    let orderBy: SelectQuery['orderBy'] = null
    if (this.at('ORDER')) {
      this.advance()
      this.expect('BY', 'BY')
      const column = this.expect('IDENT', 'a column name').value
      let direction: 'ASC' | 'DESC' = 'ASC'
      if (this.at('ASC')) {
        this.advance()
      } else if (this.at('DESC')) {
        this.advance()
        direction = 'DESC'
      }
      orderBy = { column, direction }
    }

    this.expect('EOF', 'end of query')
    return { items, table, where, orderBy }
  }

  private parseSelectList(): SelectItem[] {
    if (this.at('STAR')) {
      this.advance()
      return [{ kind: 'star' }]
    }
    const items = [this.parseSelectItem()]
    while (this.at('COMMA')) {
      this.advance()
      items.push(this.parseSelectItem())
    }
    return items
  }

  private parseSelectItem(): SelectItem {
    if (AGG_FNS.includes(this.peek().type)) {
      const fn = this.advance().type as AggFn
      this.expect('LPAREN', "'('")
      const arg = this.at('STAR') ? (this.advance().value as '*') : this.expect('IDENT', 'a column name or *').value
      this.expect('RPAREN', "')'")
      return { kind: 'agg', fn, arg }
    }
    const name = this.expect('IDENT', 'a column name').value
    return { kind: 'column', name }
  }

  private parseOr(): ConditionExpr {
    let left = this.parseAnd()
    while (this.at('OR')) {
      this.advance()
      const right = this.parseAnd()
      left = { kind: 'or', left, right }
    }
    return left
  }

  private parseAnd(): ConditionExpr {
    let left = this.parseComparison()
    while (this.at('AND')) {
      this.advance()
      const right = this.parseComparison()
      left = { kind: 'and', left, right }
    }
    return left
  }

  private parseComparison(): ConditionExpr {
    const column = this.expect('IDENT', 'a column name').value
    const opType = this.peek().type
    const op = COMPARE_TYPES[opType]
    if (!op) throw new SqlError(`Expected a comparison operator (=, <>, <, >, <=, >=) after '${column}'.`)
    this.advance()

    const valueToken = this.peek()
    let value: string | number
    if (valueToken.type === 'STRING') {
      value = this.advance().value
    } else if (valueToken.type === 'NUMBER') {
      value = parseFloat(this.advance().value)
    } else {
      throw new SqlError(`Expected a value after '${column} ${op}'.`)
    }
    return { kind: 'compare', column, op, value }
  }
}

export function parseSql(source: string): SelectQuery {
  const tokens = lexSql(source)
  return new SqlParser(tokens).parseQuery()
}
