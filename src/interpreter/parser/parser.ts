import type { Token, TokenType, Span } from '../lexer/tokens'
import { PseudocodeError } from '../errors/PseudocodeError'
import err, { nearestMatch } from '../errors/errorCodes'
import type {
  ArrayTypeNode,
  AssignmentNode,
  BinaryOp,
  CallStmtNode,
  CaseNode,
  CloseFileNode,
  ConstDeclNode,
  ExprNode,
  ForNode,
  FunctionDeclNode,
  IfNode,
  InputNode,
  NamedTypeNode,
  OpenFileNode,
  OutputNode,
  ParamNode,
  ProcedureDeclNode,
  ProgramNode,
  ReadFileNode,
  RepeatNode,
  ReturnNode,
  StmtNode,
  TypeDeclNode,
  TypeNode,
  VarDeclNode,
  WhileNode,
  WriteFileNode,
} from './ast'

export interface ParseResult {
  program: ProgramNode
  errors: PseudocodeError[]
}

const STATEMENT_START: TokenType[] = [
  'DECLARE',
  'CONSTANT',
  'TYPE',
  'INPUT',
  'OUTPUT',
  'IF',
  'CASE',
  'FOR',
  'WHILE',
  'REPEAT',
  'PROCEDURE',
  'FUNCTION',
  'CALL',
  'RETURN',
  'OPENFILE',
  'READFILE',
  'WRITEFILE',
  'CLOSEFILE',
  'IDENTIFIER',
]

const BLOCK_TERMINATORS: TokenType[] = [
  'ENDIF',
  'ELSE',
  'ENDCASE',
  'OTHERWISE',
  'NEXT',
  'ENDWHILE',
  'UNTIL',
  'ENDPROCEDURE',
  'ENDFUNCTION',
  'ENDTYPE',
  'EOF_TOKEN',
]

/** Internal control-flow signal used to unwind to the nearest recovery point. */
class ParseSignal extends Error {}

class Parser {
  private tokens: Token[]
  private pos = 0
  errors: PseudocodeError[] = []

  constructor(tokens: Token[]) {
    // Strip blank/duplicate newlines are kept (they're used as separators), but we filter nothing here.
    this.tokens = tokens
  }

  private peek(offset = 0): Token {
    const i = Math.min(this.pos + offset, this.tokens.length - 1)
    return this.tokens[i]
  }

  private at(type: TokenType): boolean {
    return this.peek().type === type
  }

  private advance(): Token {
    const t = this.tokens[this.pos]
    if (this.pos < this.tokens.length - 1) this.pos++
    return t
  }

  private describeToken(t: Token): string {
    if (t.type === 'EOF_TOKEN') return 'end of program'
    if (t.type === 'NEWLINE') return 'end of line'
    return `'${t.value}'`
  }

  private raise(e: PseudocodeError): never {
    this.errors.push(e)
    throw new ParseSignal()
  }

  private expect(type: TokenType, expectedDescription: string): Token {
    if (this.at(type)) return this.advance()
    this.raise(err.expectedToken(expectedDescription, this.describeToken(this.peek()), this.peek().span))
  }

  /**
   * Expects a block-closing keyword (ENDIF, ENDWHILE, NEXT, ...) but — unlike `expect` —
   * records the diagnostic and returns without throwing when it's missing, instead of
   * unwinding the whole enclosing statement. This is what lets a single missing ENDIF
   * surface as one diagnostic while every statement around it (both inside and after the
   * block) still parses normally, which matters for Learning mode's multi-diagnostic view.
   */
  private expectBlockEnd(type: TokenType, opener: string, closer: string): Span {
    if (this.at(type)) return this.advance().span
    this.errors.push(err.expectedBlockEnd(opener, closer, this.peek().span))
    return this.peek().span
  }

  private skipNewlines(): void {
    while (this.at('NEWLINE')) this.advance()
  }

  /** Consumes the statement terminator: one or more NEWLINEs, or stops cleanly at EOF/a block terminator. */
  private endStatement(): void {
    if (this.at('NEWLINE')) {
      this.skipNewlines()
      return
    }
    if (this.at('EOF_TOKEN') || BLOCK_TERMINATORS.includes(this.peek().type)) return
    this.raise(err.expectedToken('end of line', this.describeToken(this.peek()), this.peek().span))
  }

  /** Panic-mode recovery: skip tokens until a safe restart point so later statements still parse. */
  private synchronize(): void {
    while (!this.at('EOF_TOKEN')) {
      if (this.at('NEWLINE')) {
        this.advance()
        if (STATEMENT_START.includes(this.peek().type) || BLOCK_TERMINATORS.includes(this.peek().type)) return
        continue
      }
      if (BLOCK_TERMINATORS.includes(this.peek().type)) return
      this.advance()
    }
  }

  parseProgram(): ProgramNode {
    const startSpan = this.peek().span
    const body = this.parseStatementList(['EOF_TOKEN'])
    this.expect('EOF_TOKEN', 'end of program')
    return { kind: 'Program', body, span: this.span(startSpan, this.peek().span) }
  }

  private span(start: Span, end: Span): Span {
    return { line: start.line, col: start.col, endLine: end.endLine, endCol: end.endCol }
  }

  private parseStatementList(terminators: TokenType[]): StmtNode[] {
    const stmts: StmtNode[] = []
    this.skipNewlines()
    while (!terminators.includes(this.peek().type) && !this.at('EOF_TOKEN')) {
      try {
        const stmt = this.parseStatement()
        if (stmt) stmts.push(stmt)
        this.endStatement()
      } catch (e) {
        if (e instanceof ParseSignal) {
          this.synchronize()
        } else {
          throw e
        }
      }
      this.skipNewlines()
    }
    return stmts
  }

  private parseStatement(): StmtNode | null {
    const t = this.peek()
    switch (t.type) {
      case 'DECLARE':
        return this.parseVarDecl()
      case 'CONSTANT':
        return this.parseConstDecl()
      case 'TYPE':
        return this.parseTypeDecl()
      case 'INPUT':
        return this.parseInput()
      case 'OUTPUT':
        return this.parseOutput()
      case 'IF':
        return this.parseIf()
      case 'CASE':
        return this.parseCase()
      case 'FOR':
        return this.parseFor()
      case 'WHILE':
        return this.parseWhile()
      case 'REPEAT':
        return this.parseRepeat()
      case 'PROCEDURE':
        return this.parseProcedureDecl()
      case 'FUNCTION':
        return this.parseFunctionDecl()
      case 'CALL':
        return this.parseCallStmt()
      case 'RETURN':
        return this.parseReturn()
      case 'OPENFILE':
        return this.parseOpenFile()
      case 'READFILE':
        return this.parseReadFile()
      case 'WRITEFILE':
        return this.parseWriteFile()
      case 'CLOSEFILE':
        return this.parseCloseFile()
      case 'IDENTIFIER':
        return this.parseAssignment()
      default: {
        const suggestion = nearestMatch(t.value, STATEMENT_START.filter((k) => k !== 'IDENTIFIER'))
        this.raise(err.unknownStatement(t.value || this.describeToken(t), t.span, suggestion))
      }
    }
  }

  // ---------- Declarations ----------

  private parseVarDecl(): VarDeclNode {
    const start = this.expect('DECLARE', 'DECLARE').span
    const name = this.expect('IDENTIFIER', 'an identifier')
    this.expect('COLON', "':'")
    const type = this.parseType()
    return { kind: 'VarDecl', name: name.value, type, span: this.span(start, type.span) }
  }

  private parseConstDecl(): ConstDeclNode {
    const start = this.expect('CONSTANT', 'CONSTANT').span
    const name = this.expect('IDENTIFIER', 'an identifier')
    this.expect('EQ', "'='")
    const value = this.parseExpression()
    return { kind: 'ConstDecl', name: name.value, value, span: this.span(start, value.span) }
  }

  private parseTypeDecl(): TypeDeclNode {
    const start = this.expect('TYPE', 'TYPE').span
    const name = this.expect('IDENTIFIER', 'a type name')
    this.skipNewlines()

    // Enumerated type: TYPE Name = (A, B, C)
    if (this.at('EQ')) {
      this.advance()
      this.expect('LPAREN', "'('")
      const values: string[] = []
      values.push(this.expect('IDENTIFIER', 'an identifier').value)
      while (this.at('COMMA')) {
        this.advance()
        values.push(this.expect('IDENTIFIER', 'an identifier').value)
      }
      const end = this.expect('RPAREN', "')'").span
      return { kind: 'TypeDecl', form: 'enum', name: name.value, values, span: this.span(start, end) }
    }

    // Record type: TYPE Name \n DECLARE field : type \n ... ENDTYPE
    const fields: Array<{ name: string; type: TypeNode }> = []
    this.skipNewlines()
    while (this.at('DECLARE')) {
      this.advance()
      const fieldName = this.expect('IDENTIFIER', 'a field name')
      this.expect('COLON', "':'")
      const fieldType = this.parseType()
      fields.push({ name: fieldName.value, type: fieldType })
      this.endStatement()
      this.skipNewlines()
    }
    const end = this.expectBlockEnd('ENDTYPE', 'TYPE', 'ENDTYPE')
    return { kind: 'TypeDecl', form: 'record', name: name.value, fields, span: this.span(start, end) }
  }

  private parseType(): TypeNode {
    const t = this.peek()
    if (t.type === 'ARRAY') {
      const start = this.advance().span
      this.expect('LBRACKET', "'['")
      const bounds: Array<{ lower: ExprNode; upper: ExprNode }> = []
      const lower = this.parseExpression()
      this.expect('COLON', "':'")
      const upper = this.parseExpression()
      bounds.push({ lower, upper })
      while (this.at('COMMA')) {
        this.advance()
        const l2 = this.parseExpression()
        this.expect('COLON', "':'")
        const u2 = this.parseExpression()
        bounds.push({ lower: l2, upper: u2 })
      }
      this.expect('RBRACKET', "']'")
      this.expect('OF', 'OF')
      const elementType = this.parseType()
      const node: ArrayTypeNode = { kind: 'ArrayType', elementType, bounds, span: this.span(start, elementType.span) }
      return node
    }

    if (
      t.type === 'INTEGER' ||
      t.type === 'REAL' ||
      t.type === 'CHAR' ||
      t.type === 'STRING' ||
      t.type === 'BOOLEAN' ||
      t.type === 'DATE'
    ) {
      this.advance()
      const node: NamedTypeNode = { kind: 'NamedType', name: t.type, span: t.span }
      return node
    }

    if (t.type === 'IDENTIFIER') {
      this.advance()
      const node: NamedTypeNode = { kind: 'NamedType', name: t.value, span: t.span }
      return node
    }

    this.raise(err.expectedToken('a data type', this.describeToken(t), t.span))
  }

  // ---------- Simple statements ----------

  private parseInput(): InputNode {
    const start = this.expect('INPUT', 'INPUT').span
    const target = this.parsePostfix(this.parsePrimary())
    return { kind: 'Input', target, span: this.span(start, target.span) }
  }

  private parseOutput(): OutputNode {
    const start = this.expect('OUTPUT', 'OUTPUT').span
    const values: ExprNode[] = [this.parseExpression()]
    while (this.at('COMMA')) {
      this.advance()
      values.push(this.parseExpression())
    }
    const end = values[values.length - 1].span
    return { kind: 'Output', values, span: this.span(start, end) }
  }

  private parseAssignment(): AssignmentNode {
    const targetStart = this.peek().span
    const target = this.parsePostfix(this.parsePrimary())
    this.expect('ARROW', "'<-'")
    const value = this.parseExpression()
    return { kind: 'Assignment', target, value, span: this.span(targetStart, value.span) }
  }

  // ---------- Selection ----------

  private parseIf(): IfNode {
    const start = this.expect('IF', 'IF').span
    const condition = this.parseExpression()
    this.skipNewlines()
    this.expect('THEN', 'THEN')
    const thenBranch = this.parseStatementList(['ELSE', 'ENDIF'])
    let elseBranch: StmtNode[] | null = null
    if (this.at('ELSE')) {
      this.advance()
      elseBranch = this.parseStatementList(['ENDIF'])
    }
    const end = this.expectBlockEnd('ENDIF', 'IF', 'ENDIF')
    return { kind: 'If', condition, thenBranch, elseBranch, span: this.span(start, end) }
  }

  private parseCase(): CaseNode {
    const start = this.expect('CASE', 'CASE').span
    this.expect('OF', 'OF')
    const subject = this.parseExpression()
    this.skipNewlines()
    const cases: Array<{ value: ExprNode; body: StmtNode[] }> = []
    let otherwise: StmtNode[] | null = null
    while (!this.at('ENDCASE') && !this.at('EOF_TOKEN')) {
      if (this.at('OTHERWISE')) {
        this.advance()
        otherwise = this.parseCaseBranchBody()
        this.skipNewlines()
        break
      }
      const value = this.parseExpression()
      this.expect('COLON', "':'")
      const body = this.parseCaseBranchBody()
      cases.push({ value, body })
      this.skipNewlines()
    }
    const end = this.expectBlockEnd('ENDCASE', 'CASE', 'ENDCASE')
    return { kind: 'Case', subject, cases, otherwise, span: this.span(start, end) }
  }

  /** A CASE branch is a single statement on the same line (CAIE convention). */
  private parseCaseBranchBody(): StmtNode[] {
    if (this.at('NEWLINE') || this.at('ENDCASE')) return []
    const stmt = this.parseStatement()
    return stmt ? [stmt] : []
  }

  // ---------- Iteration ----------

  private parseFor(): ForNode {
    const start = this.expect('FOR', 'FOR').span
    const variable = this.expect('IDENTIFIER', 'a loop variable').value
    this.expect('ARROW', "'<-'")
    const from = this.parseExpression()
    this.expect('TO', 'TO')
    const to = this.parseExpression()
    let step: ExprNode | null = null
    if (this.at('STEP')) {
      this.advance()
      step = this.parseExpression()
    }
    const body = this.parseStatementList(['NEXT'])
    let end = this.expectBlockEnd('NEXT', 'FOR', 'NEXT')
    if (this.at('IDENTIFIER')) end = this.advance().span
    return { kind: 'For', variable, from, to, step, body, span: this.span(start, end) }
  }

  private parseWhile(): WhileNode {
    const start = this.expect('WHILE', 'WHILE').span
    const condition = this.parseExpression()
    this.skipNewlines()
    this.expect('DO', 'DO')
    const body = this.parseStatementList(['ENDWHILE'])
    const end = this.expectBlockEnd('ENDWHILE', 'WHILE', 'ENDWHILE')
    return { kind: 'While', condition, body, span: this.span(start, end) }
  }

  private parseRepeat(): RepeatNode {
    const start = this.expect('REPEAT', 'REPEAT').span
    const body = this.parseStatementList(['UNTIL'])
    this.expect('UNTIL', 'UNTIL')
    const condition = this.parseExpression()
    return { kind: 'Repeat', body, condition, span: this.span(start, condition.span) }
  }

  // ---------- Procedures & Functions ----------

  private parseParamList(): ParamNode[] {
    const params: ParamNode[] = []
    this.expect('LPAREN', "'('")
    if (!this.at('RPAREN')) {
      params.push(this.parseParam())
      while (this.at('COMMA')) {
        this.advance()
        params.push(this.parseParam())
      }
    }
    this.expect('RPAREN', "')'")
    return params
  }

  private parseParam(): ParamNode {
    let passBy: 'BYVAL' | 'BYREF' = 'BYVAL'
    if (this.at('BYVAL')) {
      this.advance()
    } else if (this.at('BYREF')) {
      this.advance()
      passBy = 'BYREF'
    }
    const name = this.expect('IDENTIFIER', 'a parameter name').value
    this.expect('COLON', "':'")
    const type = this.parseType()
    return { name, type, passBy }
  }

  private parseProcedureDecl(): ProcedureDeclNode {
    const start = this.expect('PROCEDURE', 'PROCEDURE').span
    const name = this.expect('IDENTIFIER', 'a procedure name').value
    const params = this.at('LPAREN') ? this.parseParamList() : []
    const body = this.parseStatementList(['ENDPROCEDURE'])
    const end = this.expectBlockEnd('ENDPROCEDURE', 'PROCEDURE', 'ENDPROCEDURE')
    return { kind: 'ProcedureDecl', name, params, body, span: this.span(start, end) }
  }

  private parseFunctionDecl(): FunctionDeclNode {
    const start = this.expect('FUNCTION', 'FUNCTION').span
    const name = this.expect('IDENTIFIER', 'a function name').value
    const params = this.at('LPAREN') ? this.parseParamList() : []
    this.expect('RETURNS', 'RETURNS')
    const returnType = this.parseType()
    const body = this.parseStatementList(['ENDFUNCTION'])
    const end = this.expectBlockEnd('ENDFUNCTION', 'FUNCTION', 'ENDFUNCTION')
    return { kind: 'FunctionDecl', name, params, returnType, body, span: this.span(start, end) }
  }

  private parseCallStmt(): CallStmtNode {
    const start = this.expect('CALL', 'CALL').span
    const name = this.expect('IDENTIFIER', 'a procedure name').value
    const args: ExprNode[] = []
    let end = this.tokens[this.pos - 1].span
    if (this.at('LPAREN')) {
      this.advance()
      if (!this.at('RPAREN')) {
        args.push(this.parseExpression())
        while (this.at('COMMA')) {
          this.advance()
          args.push(this.parseExpression())
        }
      }
      end = this.expect('RPAREN', "')'").span
    }
    return { kind: 'CallStmt', name, args, span: this.span(start, end) }
  }

  private parseReturn(): ReturnNode {
    const start = this.expect('RETURN', 'RETURN').span
    const value = this.parseExpression()
    return { kind: 'Return', value, span: this.span(start, value.span) }
  }

  // ---------- File handling ----------

  private parseOpenFile(): OpenFileNode {
    const start = this.expect('OPENFILE', 'OPENFILE').span
    const file = this.parseExpression()
    this.expect('FOR', 'FOR')
    let mode: 'READ' | 'WRITE' | 'APPEND'
    if (this.at('READ')) mode = 'READ'
    else if (this.at('WRITE')) mode = 'WRITE'
    else if (this.at('APPEND')) mode = 'APPEND'
    else this.raise(err.expectedToken('READ, WRITE or APPEND', this.describeToken(this.peek()), this.peek().span))
    const end = this.advance().span
    return { kind: 'OpenFile', file, mode, span: this.span(start, end) }
  }

  private parseReadFile(): ReadFileNode {
    const start = this.expect('READFILE', 'READFILE').span
    const file = this.parseExpression()
    this.expect('COMMA', "','")
    const target = this.parsePostfix(this.parsePrimary())
    return { kind: 'ReadFile', file, target, span: this.span(start, target.span) }
  }

  private parseWriteFile(): WriteFileNode {
    const start = this.expect('WRITEFILE', 'WRITEFILE').span
    const file = this.parseExpression()
    this.expect('COMMA', "','")
    const value = this.parseExpression()
    return { kind: 'WriteFile', file, value, span: this.span(start, value.span) }
  }

  private parseCloseFile(): CloseFileNode {
    const start = this.expect('CLOSEFILE', 'CLOSEFILE').span
    const file = this.parseExpression()
    return { kind: 'CloseFile', file, span: this.span(start, file.span) }
  }

  // ---------- Expressions (Pratt / precedence climbing) ----------
  // OR -> AND -> NOT(unary) -> relational -> concat(&) -> add/sub -> mul/div/DIV/MOD -> unary(-) -> primary/postfix

  parseExpression(): ExprNode {
    return this.parseOr()
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd()
    while (this.at('OR')) {
      this.advance()
      const right = this.parseAnd()
      left = { kind: 'Binary', op: 'OR', left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseAnd(): ExprNode {
    let left = this.parseNot()
    while (this.at('AND')) {
      this.advance()
      const right = this.parseNot()
      left = { kind: 'Binary', op: 'AND', left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseNot(): ExprNode {
    if (this.at('NOT')) {
      const start = this.advance().span
      const operand = this.parseNot()
      return { kind: 'Unary', op: 'NOT', operand, span: this.span(start, operand.span) }
    }
    return this.parseRelational()
  }

  private parseRelational(): ExprNode {
    let left = this.parseConcat()
    const relOps: Partial<Record<TokenType, BinaryOp>> = {
      EQ: 'EQ',
      NE: 'NE',
      LT: 'LT',
      GT: 'GT',
      LE: 'LE',
      GE: 'GE',
    }
    while (relOps[this.peek().type]) {
      const op = relOps[this.advance().type]!
      const right = this.parseConcat()
      left = { kind: 'Binary', op, left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseConcat(): ExprNode {
    let left = this.parseAdditive()
    while (this.at('AMP')) {
      this.advance()
      const right = this.parseAdditive()
      left = { kind: 'Binary', op: 'CONCAT', left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseAdditive(): ExprNode {
    let left = this.parseMultiplicative()
    while (this.at('PLUS') || this.at('MINUS')) {
      const op = this.advance().type === 'PLUS' ? 'ADD' : 'SUB'
      const right = this.parseMultiplicative()
      left = { kind: 'Binary', op, left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseMultiplicative(): ExprNode {
    let left = this.parseUnary()
    const ops: Partial<Record<TokenType, BinaryOp>> = { STAR: 'MUL', SLASH: 'DIV', DIV: 'IDIV', MOD: 'MOD' }
    while (ops[this.peek().type]) {
      const op = ops[this.advance().type]!
      const right = this.parseUnary()
      left = { kind: 'Binary', op, left, right, span: this.span(left.span, right.span) }
    }
    return left
  }

  private parseUnary(): ExprNode {
    if (this.at('MINUS')) {
      const start = this.advance().span
      const operand = this.parseUnary()
      return { kind: 'Unary', op: 'NEG', operand, span: this.span(start, operand.span) }
    }
    return this.parsePostfix(this.parsePrimary())
  }

  private parsePostfix(base: ExprNode): ExprNode {
    let expr = base
    for (;;) {
      if (this.at('LBRACKET')) {
        this.advance()
        const indices = [this.parseExpression()]
        while (this.at('COMMA')) {
          this.advance()
          indices.push(this.parseExpression())
        }
        const end = this.expect('RBRACKET', "']'").span
        expr = { kind: 'ArrayAccess', array: expr, indices, span: this.span(expr.span, end) }
        continue
      }
      if (this.at('DOT')) {
        this.advance()
        const field = this.expect('IDENTIFIER', 'a field name')
        expr = { kind: 'FieldAccess', object: expr, field: field.value, span: this.span(expr.span, field.span) }
        continue
      }
      break
    }
    return expr
  }

  private parsePrimary(): ExprNode {
    const t = this.peek()
    switch (t.type) {
      case 'INTEGER_LITERAL':
        this.advance()
        return { kind: 'IntegerLiteral', value: parseInt(t.value, 10), span: t.span }
      case 'REAL_LITERAL':
        this.advance()
        return { kind: 'RealLiteral', value: parseFloat(t.value), span: t.span }
      case 'STRING_LITERAL':
        this.advance()
        return { kind: 'StringLiteral', value: t.value, span: t.span }
      case 'CHAR_LITERAL':
        this.advance()
        return { kind: 'CharLiteral', value: t.value, span: t.span }
      case 'TRUE':
        this.advance()
        return { kind: 'BooleanLiteral', value: true, span: t.span }
      case 'FALSE':
        this.advance()
        return { kind: 'BooleanLiteral', value: false, span: t.span }
      case 'EOF':
        return this.parseEofExpr()
      case 'IDENTIFIER': {
        this.advance()
        if (this.at('LPAREN')) {
          this.advance()
          const args: ExprNode[] = []
          if (!this.at('RPAREN')) {
            args.push(this.parseExpression())
            while (this.at('COMMA')) {
              this.advance()
              args.push(this.parseExpression())
            }
          }
          const end = this.expect('RPAREN', "')'").span
          return { kind: 'Call', callee: t.value, args, span: this.span(t.span, end) }
        }
        return { kind: 'Identifier', name: t.value, span: t.span }
      }
      case 'LPAREN': {
        this.advance()
        const inner = this.parseExpression()
        this.expect('RPAREN', "')'")
        return inner
      }
      default:
        this.raise(err.expectedExpression(this.describeToken(t), t.span))
    }
  }

  private parseEofExpr(): ExprNode {
    const start = this.expect('EOF', 'EOF').span
    this.expect('LPAREN', "'('")
    const file = this.parseExpression()
    const end = this.expect('RPAREN', "')'").span
    return { kind: 'EofExpr', file, span: this.span(start, end) }
  }
}

export function parse(tokens: Token[]): ParseResult {
  const parser = new Parser(tokens)
  const program = parser.parseProgram()
  return { program, errors: parser.errors }
}
