import { describe, it, expect } from 'vitest'
import { curriculum } from '../curriculum'
import { runSource } from '../../interpreter/__tests__/testUtils'

// A generous canned INPUT queue. Every value is a numeric-looking string so it
// satisfies both INTEGER/REAL targets (parses fine) and STRING/CHAR targets
// (any string is valid) — this integrity test only checks "runs without
// error", not exact output, so semantic meaning of the values doesn't matter.
const CANNED_INPUTS = ['5', '10', '3', '42', '7', '12', '1234', '9', '8', '6']

describe('curriculum content integrity', () => {
  for (const entry of curriculum) {
    it(`"${entry.title}" (${entry.id}): solution runs without error`, () => {
      const { error } = runSource(entry.solutionCode, CANNED_INPUTS)
      expect(error, `${entry.id} solutionCode failed: ${error?.message}`).toBeNull()
    })

    it(`"${entry.title}" (${entry.id}): starter code has no syntax errors`, () => {
      // Starter code is intentionally incomplete (TODOs), but it must still be
      // syntactically valid pseudocode so Learning-mode linting doesn't greet
      // students with an error before they've typed anything.
      const { error } = runSource(entry.starterCode, CANNED_INPUTS)
      if (error) {
        expect(error.stage, `${entry.id} starterCode has a ${error.stage} error: ${error.message}`).not.toBe('parse')
        expect(error.stage, `${entry.id} starterCode has a ${error.stage} error: ${error.message}`).not.toBe('lex')
      }
    })
  }
})
