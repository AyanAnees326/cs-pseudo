import type { Span } from '../lexer/tokens'
import err, { nearestMatch } from '../errors/errorCodes'
import type { RuntimeValue } from './values'
import { runtimeTypeName } from './values'

type BuiltinFn = (args: RuntimeValue[], span: Span) => RuntimeValue

function asString(v: RuntimeValue, span: Span): string {
  if (typeof v === 'string') return v
  throw err.typeMismatch('STRING', runtimeTypeName(v), span)
}

function asInt(v: RuntimeValue, span: Span): number {
  if (typeof v === 'number') return Math.trunc(v)
  throw err.typeMismatch('INTEGER', runtimeTypeName(v), span)
}

function asNumber(v: RuntimeValue, span: Span): number {
  if (typeof v === 'number') return v
  throw err.typeMismatch('INTEGER or REAL', runtimeTypeName(v), span)
}

export const BUILTIN_NAMES = ['LENGTH', 'LEFT', 'RIGHT', 'MID', 'UCASE', 'LCASE', 'ROUND', 'RANDOM', 'INT'] as const

export const builtins: Record<string, BuiltinFn> = {
  LENGTH: (args, span) => asString(args[0], span).length,
  LEFT: (args, span) => asString(args[0], span).slice(0, asInt(args[1], span)),
  RIGHT: (args, span) => {
    const s = asString(args[0], span)
    const n = asInt(args[1], span)
    return n <= 0 ? '' : s.slice(Math.max(0, s.length - n))
  },
  MID: (args, span) => {
    const s = asString(args[0], span)
    const start = asInt(args[1], span)
    const length = asInt(args[2], span)
    // CAIE MID is 1-indexed
    return s.slice(start - 1, start - 1 + length)
  },
  UCASE: (args, span) => asString(args[0], span).toUpperCase(),
  LCASE: (args, span) => asString(args[0], span).toLowerCase(),
  ROUND: (args, span) => {
    const n = asNumber(args[0], span)
    const places = args.length > 1 ? asInt(args[1], span) : 0
    const factor = 10 ** places
    return Math.round(n * factor) / factor
  },
  RANDOM: () => Math.random(),
  INT: (args, span) => Math.trunc(asNumber(args[0], span)),
}

export function callBuiltin(name: string, args: RuntimeValue[], span: Span): RuntimeValue {
  const fn = builtins[name.toUpperCase()]
  if (!fn) {
    const suggestion = nearestMatch(name, [...BUILTIN_NAMES])
    throw err.unknownBuiltin(name, span, suggestion)
  }
  return fn(args, span)
}

export function isBuiltin(name: string): boolean {
  return name.toUpperCase() in builtins
}
