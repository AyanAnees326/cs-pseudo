import type { Slot, PseudoType, RuntimeValue } from './values'

export class Environment {
  private vars = new Map<string, Slot>()
  readonly parent: Environment | null

  constructor(parent: Environment | null = null) {
    this.parent = parent
  }

  declare(name: string, type: PseudoType, value: RuntimeValue, isConstant = false): Slot {
    const slot: Slot = { name, type, value, isConstant }
    this.vars.set(name, slot)
    return slot
  }

  hasOwn(name: string): boolean {
    return this.vars.has(name)
  }

  lookup(name: string): Slot | undefined {
    const slot = this.vars.get(name)
    if (slot) return slot
    return this.parent?.lookup(name)
  }

  allNames(): string[] {
    const names = new Set<string>()
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let env: Environment | null = this
    while (env) {
      for (const key of env.vars.keys()) names.add(key)
      env = env.parent
    }
    return [...names]
  }
}
