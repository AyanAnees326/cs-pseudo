import type {
  BinaryOp,
  ExprNode,
  FunctionDeclNode,
  ParamNode,
  ProcedureDeclNode,
  ProgramNode,
  StmtNode,
  TypeNode,
} from '../parser/ast'
import type { Span } from '../lexer/tokens'
import err, { nearestMatch } from '../errors/errorCodes'
import { Environment } from './environment'
import { callBuiltin, isBuiltin } from './builtins'
import type { VirtualFileSystem } from './vfs'
import {
  cloneValue,
  defaultValueFor,
  getSlotValue,
  setSlotValue,
  runtimeTypeName,
  type PseudoType,
  type RuntimeArray,
  type RuntimeRecord,
  type RuntimeValue,
  type Slot,
  type TypeDefinition,
  type ValueRef,
} from './values'

export type Effect = { type: 'output'; text: string } | { type: 'input' } | { type: 'yield' }

export type EvalGen<T> = Generator<Effect, T, string>

class ReturnSignal {
  value: RuntimeValue
  constructor(value: RuntimeValue) {
    this.value = value
  }
}

interface EvalContext {
  globalEnv: Environment
  typeTable: Map<string, TypeDefinition>
  procedures: Map<string, ProcedureDeclNode>
  functions: Map<string, FunctionDeclNode>
  vfs: VirtualFileSystem
}

interface LValue {
  ref: ValueRef
  type: PseudoType
}

export function createContext(vfs: VirtualFileSystem): EvalContext {
  return {
    globalEnv: new Environment(),
    typeTable: new Map(),
    procedures: new Map(),
    functions: new Map(),
    vfs,
  }
}

/** Entry point: runs a full program, yielding I/O effects along the way. */
export function* runProgram(program: ProgramNode, ctx: EvalContext): EvalGen<void> {
  hoistDeclarations(program.body, ctx)
  yield* execStatementList(program.body, ctx.globalEnv, ctx)
}

function hoistDeclarations(body: StmtNode[], ctx: EvalContext): void {
  for (const stmt of body) {
    if (stmt.kind === 'TypeDecl') {
      if (stmt.form === 'record') {
        ctx.typeTable.set(stmt.name.toUpperCase(), {
          form: 'record',
          name: stmt.name,
          fields: [], // filled in a second pass below, once all type names are known
        })
      } else {
        ctx.typeTable.set(stmt.name.toUpperCase(), { form: 'enum', name: stmt.name, values: stmt.values })
      }
    } else if (stmt.kind === 'ProcedureDecl') {
      ctx.procedures.set(stmt.name.toUpperCase(), stmt)
    } else if (stmt.kind === 'FunctionDecl') {
      ctx.functions.set(stmt.name.toUpperCase(), stmt)
    }
  }
  // second pass: resolve record field types now that every TYPE name is registered
  for (const stmt of body) {
    if (stmt.kind === 'TypeDecl' && stmt.form === 'record') {
      const fields = stmt.fields.map((f) => ({ name: f.name, type: resolveSimpleType(f.type, ctx) }))
      ctx.typeTable.set(stmt.name.toUpperCase(), { form: 'record', name: stmt.name, fields })
    }
  }
}

/** Resolves a type with no array-bound expressions to evaluate (used for record fields). */
function resolveSimpleType(node: TypeNode, ctx: EvalContext): PseudoType {
  if (node.kind === 'ArrayType') {
    return { kind: 'ARRAY', elementType: resolveSimpleType(node.elementType, ctx), bounds: [] }
  }
  return resolveNamedType(node.name.toString(), ctx)
}

function resolveNamedType(name: string, ctx: EvalContext): PseudoType {
  const upper = name.toUpperCase()
  if (upper === 'INTEGER' || upper === 'REAL' || upper === 'CHAR' || upper === 'STRING' || upper === 'BOOLEAN' || upper === 'DATE') {
    return { kind: upper }
  }
  const def = ctx.typeTable.get(upper)
  if (def?.form === 'enum') return { kind: 'ENUM', name: def.name }
  return { kind: 'RECORD', name }
}

/** Full type resolver used at DECLARE time, evaluating ARRAY bound expressions. */
function* resolveDeclaredType(node: TypeNode, env: Environment, ctx: EvalContext): EvalGen<PseudoType> {
  if (node.kind === 'ArrayType') {
    const bounds: Array<{ lower: number; upper: number }> = []
    for (const b of node.bounds) {
      const lower = requireInt(yield* evalExpr(b.lower, env, ctx), b.lower.span)
      const upper = requireInt(yield* evalExpr(b.upper, env, ctx), b.upper.span)
      bounds.push({ lower, upper })
    }
    const elementType = yield* resolveDeclaredType(node.elementType, env, ctx)
    return { kind: 'ARRAY', elementType, bounds }
  }
  return resolveNamedType(node.name.toString(), ctx)
}

function requireInt(v: RuntimeValue, span: Span): number {
  if (typeof v === 'number' && Number.isInteger(v)) return v
  throw err.typeMismatch('INTEGER', runtimeTypeName(v), span)
}

// ---------------------------------------------------------------------------
// Statements
// ---------------------------------------------------------------------------

function* execStatementList(body: StmtNode[], env: Environment, ctx: EvalContext): EvalGen<void> {
  for (const stmt of body) {
    yield* execStatement(stmt, env, ctx)
  }
}

function* execStatement(stmt: StmtNode, env: Environment, ctx: EvalContext): EvalGen<void> {
  yield { type: 'yield' }

  switch (stmt.kind) {
    case 'VarDecl': {
      if (env.hasOwn(stmt.name)) throw err.alreadyDeclared(stmt.name, stmt.span)
      const type = yield* resolveDeclaredType(stmt.type, env, ctx)
      env.declare(stmt.name, type, defaultValueFor(type, ctx.typeTable))
      return
    }
    case 'ConstDecl': {
      if (env.hasOwn(stmt.name)) throw err.alreadyDeclared(stmt.name, stmt.span)
      const value = yield* evalExpr(stmt.value, env, ctx)
      env.declare(stmt.name, inferType(value), value, true)
      return
    }
    case 'TypeDecl':
      return // already hoisted

    case 'ProcedureDecl':
    case 'FunctionDecl':
      return // already hoisted

    case 'Assignment': {
      const lv = yield* resolveLValue(stmt.target, env, ctx)
      const value = yield* evalExpr(stmt.value, env, ctx)
      lv.ref.set(coerceAssign(lv.type, value, stmt.span))
      return
    }

    case 'Input': {
      const lv = yield* resolveLValue(stmt.target, env, ctx)
      const raw: string = yield { type: 'input' }
      lv.ref.set(coerceFromInput(raw, lv.type, stmt.span))
      return
    }

    case 'Output': {
      let text = ''
      for (const v of stmt.values) {
        text += stringifyValue(yield* evalExpr(v, env, ctx))
      }
      yield { type: 'output', text: text + '\n' }
      return
    }

    case 'If': {
      const cond = requireBoolean(yield* evalExpr(stmt.condition, env, ctx), stmt.condition.span)
      if (cond) yield* execStatementList(stmt.thenBranch, new Environment(env), ctx)
      else if (stmt.elseBranch) yield* execStatementList(stmt.elseBranch, new Environment(env), ctx)
      return
    }

    case 'Case': {
      const subject = yield* evalExpr(stmt.subject, env, ctx)
      for (const c of stmt.cases) {
        const caseVal = yield* evalExpr(c.value, env, ctx)
        if (valuesEqual(subject, caseVal)) {
          yield* execStatementList(c.body, new Environment(env), ctx)
          return
        }
      }
      if (stmt.otherwise) yield* execStatementList(stmt.otherwise, new Environment(env), ctx)
      return
    }

    case 'For': {
      const from = requireNumber(yield* evalExpr(stmt.from, env, ctx), stmt.from.span)
      const to = requireNumber(yield* evalExpr(stmt.to, env, ctx), stmt.to.span)
      const step = stmt.step ? requireNumber(yield* evalExpr(stmt.step, env, ctx), stmt.step.span) : 1

      const slot = env.lookup(stmt.variable)
      if (!slot) {
        const suggestion = nearestVariable(stmt.variable, env)
        throw err.undeclaredVariable(stmt.variable, stmt.span, suggestion)
      }
      setSlotValue(slot, from)
      while (step >= 0 ? (getSlotValue(slot) as number) <= to : (getSlotValue(slot) as number) >= to) {
        yield { type: 'yield' }
        yield* execStatementList(stmt.body, new Environment(env), ctx)
        setSlotValue(slot, (getSlotValue(slot) as number) + step)
      }
      return
    }

    case 'While': {
      while (requireBoolean(yield* evalExpr(stmt.condition, env, ctx), stmt.condition.span)) {
        yield { type: 'yield' }
        yield* execStatementList(stmt.body, new Environment(env), ctx)
      }
      return
    }

    case 'Repeat': {
      let cond: boolean
      do {
        yield { type: 'yield' }
        yield* execStatementList(stmt.body, new Environment(env), ctx)
        cond = requireBoolean(yield* evalExpr(stmt.condition, env, ctx), stmt.condition.span)
      } while (!cond)
      return
    }

    case 'CallStmt': {
      yield* callNamed(stmt.name, stmt.args, env, ctx, stmt.span)
      return
    }

    case 'Return':
      throw new ReturnSignal(yield* evalExpr(stmt.value, env, ctx))

    case 'OpenFile': {
      const name = requireString(yield* evalExpr(stmt.file, env, ctx), stmt.file.span)
      ctx.vfs.open(name, stmt.mode)
      return
    }

    case 'ReadFile': {
      const name = requireString(yield* evalExpr(stmt.file, env, ctx), stmt.file.span)
      if (!ctx.vfs.isOpen(name)) throw err.fileNotOpen(name, stmt.span)
      if (ctx.vfs.eof(name)) throw err.readPastEof(name, stmt.span)
      const line = ctx.vfs.readLine(name) ?? ''
      const lv = yield* resolveLValue(stmt.target, env, ctx)
      lv.ref.set(coerceFromInput(line, lv.type, stmt.span))
      return
    }

    case 'WriteFile': {
      const name = requireString(yield* evalExpr(stmt.file, env, ctx), stmt.file.span)
      if (!ctx.vfs.isOpen(name)) throw err.fileNotOpen(name, stmt.span)
      const value = yield* evalExpr(stmt.value, env, ctx)
      ctx.vfs.writeLine(name, stringifyValue(value))
      return
    }

    case 'CloseFile': {
      const name = requireString(yield* evalExpr(stmt.file, env, ctx), stmt.file.span)
      ctx.vfs.close(name)
      return
    }
  }
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

function* callNamed(
  name: string,
  argExprs: ExprNode[],
  env: Environment,
  ctx: EvalContext,
  span: Span,
): EvalGen<RuntimeValue> {
  const proc = ctx.procedures.get(name.toUpperCase())
  const func = ctx.functions.get(name.toUpperCase())
  const decl = proc ?? func
  if (!decl) throw err.notCallable(name, span)
  if (argExprs.length !== decl.params.length) {
    throw err.wrongArgCount(name, decl.params.length, argExprs.length, span)
  }

  const callEnv = new Environment(ctx.globalEnv)
  for (let i = 0; i < decl.params.length; i++) {
    yield* bindParam(decl.params[i], argExprs[i], env, callEnv, ctx)
  }

  try {
    yield* execStatementList(decl.body, callEnv, ctx)
  } catch (e) {
    if (e instanceof ReturnSignal) {
      if (func) return e.value
      return null
    }
    throw e
  }

  if (func) throw err.missingReturn(name, span)
  return null
}

function* bindParam(
  param: ParamNode,
  argExpr: ExprNode,
  callerEnv: Environment,
  callEnv: Environment,
  ctx: EvalContext,
): EvalGen<void> {
  const type = yield* resolveDeclaredType(param.type, callerEnv, ctx)
  if (param.passBy === 'BYREF') {
    const lv = yield* resolveLValue(argExpr, callerEnv, ctx)
    const slot = callEnv.declare(param.name, type, null)
    slot.ref = lv.ref
  } else {
    const value = yield* evalExpr(argExpr, callerEnv, ctx)
    callEnv.declare(param.name, type, coerceAssign(type, cloneValue(value), argExpr.span))
  }
}

// ---------------------------------------------------------------------------
// L-values (assignment targets / BYREF binding)
// ---------------------------------------------------------------------------

function* resolveLValue(node: ExprNode, env: Environment, ctx: EvalContext): EvalGen<LValue> {
  if (node.kind === 'Identifier') {
    const slot = env.lookup(node.name)
    if (!slot) {
      const suggestion = nearestVariable(node.name, env)
      throw err.undeclaredVariable(node.name, node.span, suggestion)
    }
    const capturedSlot: Slot = slot
    return {
      type: slot.type,
      ref: {
        get: () => getSlotValue(capturedSlot),
        set: (v) => {
          if (capturedSlot.isConstant) throw err.assignToConstant(node.name, node.span)
          setSlotValue(capturedSlot, v)
        },
      },
    }
  }

  if (node.kind === 'ArrayAccess') {
    const base = yield* evalExpr(node.array, env, ctx)
    const arr = asRuntimeArray(base, node.span)
    const flatIndex = computeFlatIndex(arr, yield* evalIndices(node.indices, env, ctx), node.span)
    return {
      type: arr.type,
      ref: {
        get: (): RuntimeValue => arr.data[flatIndex] as RuntimeValue,
        set: (v) => {
          arr.data[flatIndex] = v
        },
      },
    }
  }

  if (node.kind === 'FieldAccess') {
    const base = yield* evalExpr(node.object, env, ctx)
    const rec = asRuntimeRecord(base, node.span)
    if (!rec.fields.has(node.field)) throw err.unknownField(node.field, rec.typeName, node.span)
    const def = ctx.typeTable.get(rec.typeName.toUpperCase())
    const fallback: PseudoType = { kind: 'STRING' }
    const fieldType: PseudoType =
      def?.form === 'record' ? (def.fields.find((f) => f.name === node.field)?.type ?? fallback) : fallback
    return {
      type: fieldType,
      ref: {
        get: (): RuntimeValue => (rec.fields.get(node.field) as RuntimeValue) ?? null,
        set: (v) => {
          rec.fields.set(node.field, v)
        },
      },
    }
  }

  throw err.expectedExpression('an assignable target', node.span)
}

function* evalIndices(indices: ExprNode[], env: Environment, ctx: EvalContext): EvalGen<number[]> {
  const out: number[] = []
  for (const idx of indices) {
    out.push(requireInt(yield* evalExpr(idx, env, ctx), idx.span))
  }
  return out
}

function computeFlatIndex(arr: RuntimeArray, indices: number[], span: Span): number {
  let flat = 0
  let multiplier = 1
  for (let dim = indices.length - 1; dim >= 0; dim--) {
    const { lower, upper } = arr.bounds[dim]
    const idx = indices[dim]
    if (idx < lower || idx > upper) throw err.arrayIndexOutOfBounds(idx, lower, upper, span)
    flat += (idx - lower) * multiplier
    multiplier *= upper - lower + 1
  }
  return flat
}

function nearestVariable(name: string, env: Environment): string | undefined {
  return nearestMatch(name, env.allNames())
}

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------

function* evalExpr(node: ExprNode, env: Environment, ctx: EvalContext): EvalGen<RuntimeValue> {
  switch (node.kind) {
    case 'IntegerLiteral':
    case 'RealLiteral':
      return node.value
    case 'StringLiteral':
      return node.value
    case 'CharLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value

    case 'Identifier': {
      const slot = env.lookup(node.name)
      if (slot) return getSlotValue(slot)
      const enumOwner = findEnumOwner(node.name, ctx)
      if (enumOwner) return node.name
      const suggestion = nearestVariable(node.name, env)
      throw err.undeclaredVariable(node.name, node.span, suggestion)
    }

    case 'ArrayAccess': {
      const base = yield* evalExpr(node.array, env, ctx)
      const arr = asRuntimeArray(base, node.span)
      const flatIndex = computeFlatIndex(arr, yield* evalIndices(node.indices, env, ctx), node.span)
      return arr.data[flatIndex] as RuntimeValue
    }

    case 'FieldAccess': {
      const base = yield* evalExpr(node.object, env, ctx)
      const rec = asRuntimeRecord(base, node.span)
      if (!rec.fields.has(node.field)) throw err.unknownField(node.field, rec.typeName, node.span)
      return (rec.fields.get(node.field) as RuntimeValue) ?? null
    }

    case 'Call': {
      if (ctx.functions.has(node.callee.toUpperCase()) || ctx.procedures.has(node.callee.toUpperCase())) {
        return yield* callNamed(node.callee, node.args, env, ctx, node.span)
      }
      if (isBuiltin(node.callee)) {
        const args: RuntimeValue[] = []
        for (const a of node.args) args.push(yield* evalExpr(a, env, ctx))
        return callBuiltin(node.callee, args, node.span)
      }
      const suggestion = nearestVariable(node.callee, env)
      throw err.unknownBuiltin(node.callee, node.span, suggestion)
    }

    case 'EofExpr': {
      const name = requireString(yield* evalExpr(node.file, env, ctx), node.file.span)
      return ctx.vfs.eof(name)
    }

    case 'Unary': {
      const v = yield* evalExpr(node.operand, env, ctx)
      if (node.op === 'NOT') return !requireBoolean(v, node.operand.span)
      return -requireNumber(v, node.operand.span)
    }

    case 'Binary':
      return yield* evalBinary(node.op, node.left, node.right, env, ctx, node.span)
  }
}

function* evalBinary(
  op: BinaryOp,
  leftNode: ExprNode,
  rightNode: ExprNode,
  env: Environment,
  ctx: EvalContext,
  span: Span,
): EvalGen<RuntimeValue> {
  if (op === 'AND' || op === 'OR') {
    const left = requireBoolean(yield* evalExpr(leftNode, env, ctx), leftNode.span)
    if (op === 'AND' && !left) return false
    if (op === 'OR' && left) return true
    return requireBoolean(yield* evalExpr(rightNode, env, ctx), rightNode.span)
  }

  const left = yield* evalExpr(leftNode, env, ctx)
  const right = yield* evalExpr(rightNode, env, ctx)

  switch (op) {
    case 'CONCAT':
      return stringifyValue(left) + stringifyValue(right)
    case 'EQ':
      return valuesEqual(left, right)
    case 'NE':
      return !valuesEqual(left, right)
    case 'LT':
      return compareValues(left, right, span) < 0
    case 'GT':
      return compareValues(left, right, span) > 0
    case 'LE':
      return compareValues(left, right, span) <= 0
    case 'GE':
      return compareValues(left, right, span) >= 0
    case 'ADD':
      return requireNumber(left, leftNode.span) + requireNumber(right, rightNode.span)
    case 'SUB':
      return requireNumber(left, leftNode.span) - requireNumber(right, rightNode.span)
    case 'MUL':
      return requireNumber(left, leftNode.span) * requireNumber(right, rightNode.span)
    case 'DIV': {
      const r = requireNumber(right, rightNode.span)
      if (r === 0) throw err.divByZero(span)
      return requireNumber(left, leftNode.span) / r
    }
    case 'IDIV': {
      const l = requireInt(left, leftNode.span)
      const r = requireInt(right, rightNode.span)
      if (r === 0) throw err.divByZero(span)
      return Math.trunc(l / r)
    }
    case 'MOD': {
      const l = requireInt(left, leftNode.span)
      const r = requireInt(right, rightNode.span)
      if (r === 0) throw err.divByZero(span)
      return ((l % r) + r) % r
    }
  }
}

// ---------------------------------------------------------------------------
// Coercion / comparison helpers
// ---------------------------------------------------------------------------

function inferType(v: RuntimeValue): PseudoType {
  if (typeof v === 'number') return { kind: Number.isInteger(v) ? 'INTEGER' : 'REAL' }
  if (typeof v === 'boolean') return { kind: 'BOOLEAN' }
  if (typeof v === 'string') return { kind: v.length === 1 ? 'CHAR' : 'STRING' }
  if (v instanceof Date) return { kind: 'DATE' }
  return { kind: 'STRING' }
}

function coerceAssign(type: PseudoType, value: RuntimeValue, span: Span): RuntimeValue {
  switch (type.kind) {
    case 'INTEGER':
      if (typeof value === 'number') return Math.trunc(value)
      throw err.typeMismatch('INTEGER', runtimeTypeName(value), span)
    case 'REAL':
      if (typeof value === 'number') return value
      throw err.typeMismatch('REAL', runtimeTypeName(value), span)
    case 'CHAR':
      if (typeof value === 'string' && value.length === 1) return value
      throw err.typeMismatch('CHAR', runtimeTypeName(value), span)
    case 'STRING':
      if (typeof value === 'string') return value
      throw err.typeMismatch('STRING', runtimeTypeName(value), span)
    case 'BOOLEAN':
      if (typeof value === 'boolean') return value
      throw err.typeMismatch('BOOLEAN', runtimeTypeName(value), span)
    case 'DATE':
      if (value instanceof Date || value === null) return value
      throw err.typeMismatch('DATE', runtimeTypeName(value), span)
    case 'ARRAY':
      if (isRuntimeArray(value)) return value
      throw err.typeMismatch('ARRAY', runtimeTypeName(value), span)
    case 'RECORD':
      if (isRuntimeRecord(value)) return value
      throw err.typeMismatch(type.name, runtimeTypeName(value), span)
    case 'ENUM':
      if (typeof value === 'string') return value
      throw err.typeMismatch(type.name, runtimeTypeName(value), span)
  }
}

function coerceFromInput(raw: string, type: PseudoType, span: Span): RuntimeValue {
  switch (type.kind) {
    case 'INTEGER': {
      const n = parseInt(raw, 10)
      if (Number.isNaN(n)) throw err.typeMismatch('INTEGER', `input "${raw}"`, span)
      return n
    }
    case 'REAL': {
      const n = parseFloat(raw)
      if (Number.isNaN(n)) throw err.typeMismatch('REAL', `input "${raw}"`, span)
      return n
    }
    case 'BOOLEAN': {
      const upper = raw.trim().toUpperCase()
      if (upper === 'TRUE') return true
      if (upper === 'FALSE') return false
      throw err.typeMismatch('BOOLEAN', `input "${raw}"`, span)
    }
    case 'CHAR':
      return raw.length > 0 ? raw[0] : ''
    default:
      return raw
  }
}

function requireBoolean(v: RuntimeValue, span: Span): boolean {
  if (typeof v === 'boolean') return v
  throw err.typeMismatch('BOOLEAN', runtimeTypeName(v), span)
}

function requireNumber(v: RuntimeValue, span: Span): number {
  if (typeof v === 'number') return v
  throw err.typeMismatch('INTEGER or REAL', runtimeTypeName(v), span)
}

function requireString(v: RuntimeValue, span: Span): string {
  if (typeof v === 'string') return v
  throw err.typeMismatch('STRING', runtimeTypeName(v), span)
}

function asRuntimeArray(v: RuntimeValue, span: Span): RuntimeArray {
  if (isRuntimeArray(v)) return v
  throw err.notAnArray(span)
}

function asRuntimeRecord(v: RuntimeValue, span: Span): RuntimeRecord {
  if (isRuntimeRecord(v)) return v
  throw err.notARecord(span)
}

function isRuntimeArray(v: RuntimeValue): v is RuntimeArray {
  return typeof v === 'object' && v !== null && 'kind' in v && v.kind === 'array'
}

function isRuntimeRecord(v: RuntimeValue): v is RuntimeRecord {
  return typeof v === 'object' && v !== null && 'kind' in v && v.kind === 'record'
}

function findEnumOwner(value: string, ctx: EvalContext): string | undefined {
  for (const def of ctx.typeTable.values()) {
    if (def.form === 'enum' && def.values.includes(value)) return def.name
  }
  return undefined
}

function valuesEqual(a: RuntimeValue, b: RuntimeValue): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  return a === b
}

function compareValues(a: RuntimeValue, b: RuntimeValue, span: Span): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  throw err.typeMismatch(runtimeTypeName(a), runtimeTypeName(b), span)
}

export function stringifyValue(v: RuntimeValue): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v instanceof Date) {
    const d = String(v.getDate()).padStart(2, '0')
    const m = String(v.getMonth() + 1).padStart(2, '0')
    return `${d}/${m}/${v.getFullYear()}`
  }
  if (typeof v === 'object') return isRuntimeArray(v) ? '[ARRAY]' : '[RECORD]'
  return String(v)
}
