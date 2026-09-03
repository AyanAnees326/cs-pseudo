import type { Span } from '../lexer/tokens'

export type PrimitiveTypeName = 'INTEGER' | 'REAL' | 'CHAR' | 'STRING' | 'BOOLEAN' | 'DATE'

export interface ArrayTypeNode {
  kind: 'ArrayType'
  elementType: TypeNode
  bounds: Array<{ lower: ExprNode; upper: ExprNode }>
  span: Span
}

export interface NamedTypeNode {
  kind: 'NamedType'
  name: PrimitiveTypeName | string
  span: Span
}

export type TypeNode = NamedTypeNode | ArrayTypeNode

// ---------- Expressions ----------

export type ExprNode =
  | { kind: 'IntegerLiteral'; value: number; span: Span }
  | { kind: 'RealLiteral'; value: number; span: Span }
  | { kind: 'StringLiteral'; value: string; span: Span }
  | { kind: 'CharLiteral'; value: string; span: Span }
  | { kind: 'BooleanLiteral'; value: boolean; span: Span }
  | { kind: 'Identifier'; name: string; span: Span }
  | { kind: 'ArrayAccess'; array: ExprNode; indices: ExprNode[]; span: Span }
  | { kind: 'FieldAccess'; object: ExprNode; field: string; span: Span }
  | { kind: 'Call'; callee: string; args: ExprNode[]; span: Span }
  | { kind: 'EofExpr'; file: ExprNode; span: Span }
  | { kind: 'Unary'; op: 'NOT' | 'NEG'; operand: ExprNode; span: Span }
  | { kind: 'Binary'; op: BinaryOp; left: ExprNode; right: ExprNode; span: Span }

export type BinaryOp =
  | 'OR'
  | 'AND'
  | 'EQ'
  | 'NE'
  | 'LT'
  | 'GT'
  | 'LE'
  | 'GE'
  | 'CONCAT'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'IDIV'
  | 'MOD'

// ---------- Statements ----------

export interface VarDeclNode {
  kind: 'VarDecl'
  name: string
  type: TypeNode
  span: Span
}

export interface ConstDeclNode {
  kind: 'ConstDecl'
  name: string
  value: ExprNode
  span: Span
}

export interface TypeDeclFieldsNode {
  kind: 'TypeDecl'
  form: 'record'
  name: string
  fields: Array<{ name: string; type: TypeNode }>
  span: Span
}

export interface TypeDeclEnumNode {
  kind: 'TypeDecl'
  form: 'enum'
  name: string
  values: string[]
  span: Span
}

export type TypeDeclNode = TypeDeclFieldsNode | TypeDeclEnumNode

export interface AssignmentNode {
  kind: 'Assignment'
  target: ExprNode // Identifier | ArrayAccess | FieldAccess
  value: ExprNode
  span: Span
}

export interface InputNode {
  kind: 'Input'
  target: ExprNode
  span: Span
}

export interface OutputNode {
  kind: 'Output'
  values: ExprNode[]
  span: Span
}

export interface IfNode {
  kind: 'If'
  condition: ExprNode
  thenBranch: StmtNode[]
  elseBranch: StmtNode[] | null
  span: Span
}

export interface CaseNode {
  kind: 'Case'
  subject: ExprNode
  cases: Array<{ value: ExprNode; body: StmtNode[] }>
  otherwise: StmtNode[] | null
  span: Span
}

export interface ForNode {
  kind: 'For'
  variable: string
  from: ExprNode
  to: ExprNode
  step: ExprNode | null
  body: StmtNode[]
  span: Span
}

export interface WhileNode {
  kind: 'While'
  condition: ExprNode
  body: StmtNode[]
  span: Span
}

export interface RepeatNode {
  kind: 'Repeat'
  body: StmtNode[]
  condition: ExprNode
  span: Span
}

export interface ParamNode {
  name: string
  type: TypeNode
  passBy: 'BYVAL' | 'BYREF'
}

export interface ProcedureDeclNode {
  kind: 'ProcedureDecl'
  name: string
  params: ParamNode[]
  body: StmtNode[]
  span: Span
}

export interface FunctionDeclNode {
  kind: 'FunctionDecl'
  name: string
  params: ParamNode[]
  returnType: TypeNode
  body: StmtNode[]
  span: Span
}

export interface CallStmtNode {
  kind: 'CallStmt'
  name: string
  args: ExprNode[]
  span: Span
}

export interface ReturnNode {
  kind: 'Return'
  value: ExprNode
  span: Span
}

export interface OpenFileNode {
  kind: 'OpenFile'
  file: ExprNode
  mode: 'READ' | 'WRITE' | 'APPEND'
  span: Span
}

export interface ReadFileNode {
  kind: 'ReadFile'
  file: ExprNode
  target: ExprNode
  span: Span
}

export interface WriteFileNode {
  kind: 'WriteFile'
  file: ExprNode
  value: ExprNode
  span: Span
}

export interface CloseFileNode {
  kind: 'CloseFile'
  file: ExprNode
  span: Span
}

export type StmtNode =
  | VarDeclNode
  | ConstDeclNode
  | TypeDeclNode
  | AssignmentNode
  | InputNode
  | OutputNode
  | IfNode
  | CaseNode
  | ForNode
  | WhileNode
  | RepeatNode
  | ProcedureDeclNode
  | FunctionDeclNode
  | CallStmtNode
  | ReturnNode
  | OpenFileNode
  | ReadFileNode
  | WriteFileNode
  | CloseFileNode

export interface ProgramNode {
  kind: 'Program'
  body: StmtNode[]
  span: Span
}
