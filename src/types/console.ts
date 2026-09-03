import type { PseudocodeError } from '../interpreter'

export type ConsoleEntry =
  | { id: string; type: 'output'; text: string }
  | { id: string; type: 'input-echo'; text: string }
  | { id: string; type: 'system'; text: string }
  | { id: string; type: 'error'; error: PseudocodeError }

export type RunStatus = 'idle' | 'running' | 'awaiting-input' | 'finished' | 'stopped'

/** A distributive Omit — plain `Omit` over a discriminated union collapses the variant-specific fields. */
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

export type ConsoleEntryInput = DistributiveOmit<ConsoleEntry, 'id'>
