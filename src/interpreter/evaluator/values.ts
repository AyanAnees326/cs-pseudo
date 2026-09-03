export type PseudoType =
  | { kind: 'INTEGER' | 'REAL' | 'CHAR' | 'STRING' | 'BOOLEAN' | 'DATE' }
  | { kind: 'ARRAY'; elementType: PseudoType; bounds: Array<{ lower: number; upper: number }> }
  | { kind: 'RECORD'; name: string }
  | { kind: 'ENUM'; name: string }

export type RuntimeArray = { kind: 'array'; type: PseudoType; bounds: Array<{ lower: number; upper: number }>; data: unknown[] }
export type RuntimeRecord = { kind: 'record'; typeName: string; fields: Map<string, unknown> }

export type RuntimeValue = number | string | boolean | Date | RuntimeArray | RuntimeRecord | null

export interface ValueRef {
  get(): RuntimeValue
  set(v: RuntimeValue): void
}

export interface Slot {
  name: string
  type: PseudoType
  /** Direct storage, used unless `ref` is set (BYREF parameters forward through `ref` instead). */
  value: RuntimeValue
  ref?: ValueRef
  isConstant: boolean
}

export function getSlotValue(slot: Slot): RuntimeValue {
  return slot.ref ? slot.ref.get() : slot.value
}

export function setSlotValue(slot: Slot, v: RuntimeValue): void {
  if (slot.ref) slot.ref.set(v)
  else slot.value = v
}

export function defaultValueFor(type: PseudoType, typeTable: Map<string, TypeDefinition>): RuntimeValue {
  switch (type.kind) {
    case 'INTEGER':
      return 0
    case 'REAL':
      return 0.0
    case 'CHAR':
      return ''
    case 'STRING':
      return ''
    case 'BOOLEAN':
      return false
    case 'DATE':
      return null
    case 'ARRAY': {
      const size = type.bounds.reduce((acc, b) => acc * (b.upper - b.lower + 1), 0) || 0
      const total = type.bounds.reduce((acc, b) => acc * (b.upper - b.lower + 1), 1)
      const data = new Array(total).fill(0).map(() => defaultValueFor(type.elementType, typeTable))
      void size
      return { kind: 'array', type: type.elementType, bounds: type.bounds, data }
    }
    case 'RECORD': {
      const def = typeTable.get(type.name.toUpperCase())
      const fields = new Map<string, unknown>()
      if (def && def.form === 'record') {
        for (const f of def.fields) fields.set(f.name, defaultValueFor(f.type, typeTable))
      }
      return { kind: 'record', typeName: type.name, fields }
    }
    case 'ENUM':
      return null
  }
}

export interface RecordTypeDefinition {
  form: 'record'
  name: string
  fields: Array<{ name: string; type: PseudoType }>
}

export interface EnumTypeDefinition {
  form: 'enum'
  name: string
  values: string[]
}

export type TypeDefinition = RecordTypeDefinition | EnumTypeDefinition

/** Deep-clones arrays/records so BYVAL parameters truly get an independent copy. */
export function cloneValue(v: RuntimeValue): RuntimeValue {
  if (v instanceof Date) return new Date(v.getTime())
  if (v !== null && typeof v === 'object' && 'kind' in v && v.kind === 'array') {
    return { kind: 'array', type: v.type, bounds: v.bounds, data: v.data.map((el) => cloneValue(el as RuntimeValue)) }
  }
  if (v !== null && typeof v === 'object' && 'kind' in v && v.kind === 'record') {
    const fields = new Map<string, unknown>()
    for (const [k, val] of v.fields) fields.set(k, cloneValue(val as RuntimeValue))
    return { kind: 'record', typeName: v.typeName, fields }
  }
  return v
}

export function typeName(type: PseudoType): string {
  switch (type.kind) {
    case 'ARRAY':
      return `ARRAY OF ${typeName(type.elementType)}`
    case 'RECORD':
      return type.name
    case 'ENUM':
      return type.name
    default:
      return type.kind
  }
}

export function runtimeTypeName(value: RuntimeValue): string {
  if (value === null) return 'DATE'
  if (typeof value === 'number') return Number.isInteger(value) ? 'INTEGER' : 'REAL'
  if (typeof value === 'string') return value.length === 1 ? 'CHAR/STRING' : 'STRING'
  if (typeof value === 'boolean') return 'BOOLEAN'
  if (value instanceof Date) return 'DATE'
  if (typeof value === 'object' && 'kind' in value && value.kind === 'array') return 'ARRAY'
  if (typeof value === 'object' && 'kind' in value && value.kind === 'record') return (value as RuntimeRecord).typeName
  return 'UNKNOWN'
}
