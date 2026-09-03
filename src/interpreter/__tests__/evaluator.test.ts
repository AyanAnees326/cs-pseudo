import { describe, it, expect } from 'vitest'
import { runSource } from './testUtils'
import { VirtualFileSystem } from '../evaluator/vfs'

describe('evaluator — basics', () => {
  it('runs DECLARE/assignment/OUTPUT', () => {
    const { output, error } = runSource('DECLARE x : INTEGER\nx <- 5\nOUTPUT x')
    expect(error).toBeNull()
    expect(output).toBe('5\n')
  })

  it('reads INPUT and coerces to the declared type', () => {
    const { output, error } = runSource('DECLARE x : INTEGER\nINPUT x\nOUTPUT x + 1', ['41'])
    expect(error).toBeNull()
    expect(output).toBe('42\n')
  })

  it('OUTPUT concatenates comma-separated values with no separator', () => {
    const { output } = runSource('OUTPUT "Total: ", 15')
    expect(output).toBe('Total: 15\n')
  })
})

describe('evaluator — arithmetic & types', () => {
  it('DIV and MOD require integer semantics', () => {
    const { output } = runSource('OUTPUT 7 DIV 2\nOUTPUT 7 MOD 2')
    expect(output).toBe('3\n1\n')
  })

  it('/ performs real division', () => {
    const { output } = runSource('OUTPUT 7 / 2')
    expect(output).toBe('3.5\n')
  })

  it('throws DIVISION_BY_ZERO for DIV/MOD/ by zero', () => {
    const { error } = runSource('OUTPUT 1 / 0')
    expect(error?.code).toBe('DIVISION_BY_ZERO')
  })

  it('& concatenates values, stringifying non-strings', () => {
    const { output } = runSource('DECLARE total : INTEGER\ntotal <- 15\nOUTPUT "Total: " & total')
    expect(output).toBe('Total: 15\n')
  })

  it('rejects assigning a STRING to an INTEGER with TYPE_MISMATCH', () => {
    const { error } = runSource('DECLARE x : INTEGER\nx <- "hello"')
    expect(error?.code).toBe('TYPE_MISMATCH')
  })

  it('reports UNDECLARED_VARIABLE with a did-you-mean hint for a near-miss name', () => {
    const { error } = runSource('DECLARE total : INTEGER\ntotal <- 1\nOUTPUT totl')
    expect(error?.code).toBe('UNDECLARED_VARIABLE')
    expect(error?.hint).toContain('total')
  })
})

describe('evaluator — control flow', () => {
  it('IF/ELSE/ENDIF branches correctly', () => {
    const { output } = runSource('IF 1 > 2 THEN\n  OUTPUT "yes"\nELSE\n  OUTPUT "no"\nENDIF')
    expect(output).toBe('no\n')
  })

  it('CASE OF matches the correct branch and falls back to OTHERWISE', () => {
    const src = `DECLARE x : INTEGER\nx <- 2\nCASE OF x\n  1: OUTPUT "one"\n  2: OUTPUT "two"\n  OTHERWISE OUTPUT "other"\nENDCASE`
    const { output } = runSource(src)
    expect(output).toBe('two\n')
  })

  it('FOR loop with default STEP 1 sums correctly', () => {
    const src = `DECLARE i : INTEGER\nDECLARE total : INTEGER\ntotal <- 0\nFOR i <- 1 TO 5\n  total <- total + i\nNEXT i\nOUTPUT total`
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('15\n')
  })

  it('FOR loop honours a negative STEP', () => {
    const src = `DECLARE i : INTEGER\nFOR i <- 3 TO 1 STEP -1\n  OUTPUT i\nNEXT i`
    const { output } = runSource(src)
    expect(output).toBe('3\n2\n1\n')
  })

  it('WHILE loop runs while condition holds', () => {
    const src = `DECLARE i : INTEGER\ni <- 0\nWHILE i < 3 DO\n  OUTPUT i\n  i <- i + 1\nENDWHILE`
    const { output } = runSource(src)
    expect(output).toBe('0\n1\n2\n')
  })

  it('REPEAT...UNTIL runs the body at least once', () => {
    const src = `DECLARE i : INTEGER\ni <- 10\nREPEAT\n  OUTPUT i\nUNTIL i >= 10`
    const { output } = runSource(src)
    expect(output).toBe('10\n')
  })
})

describe('evaluator — arrays', () => {
  it('supports 1D array read/write', () => {
    const src = `DECLARE nums : ARRAY[1:3] OF INTEGER\nnums[1] <- 10\nnums[2] <- 20\nnums[3] <- 30\nOUTPUT nums[2]`
    const { output } = runSource(src)
    expect(output).toBe('20\n')
  })

  it('supports 2D array read/write', () => {
    const src = `DECLARE grid : ARRAY[1:2,1:2] OF INTEGER\ngrid[1,1] <- 1\ngrid[1,2] <- 2\ngrid[2,1] <- 3\ngrid[2,2] <- 4\nOUTPUT grid[2,1]`
    const { output } = runSource(src)
    expect(output).toBe('3\n')
  })

  it('throws ARRAY_INDEX_OUT_OF_BOUNDS on an out-of-range index', () => {
    const src = `DECLARE nums : ARRAY[1:3] OF INTEGER\nOUTPUT nums[5]`
    const { error } = runSource(src)
    expect(error?.code).toBe('ARRAY_INDEX_OUT_OF_BOUNDS')
  })
})

describe('evaluator — procedures & functions', () => {
  it('PROCEDURE with BYREF mutates the caller variable', () => {
    const src = `PROCEDURE Increment(BYREF n : INTEGER)\n  n <- n + 1\nENDPROCEDURE\nDECLARE x : INTEGER\nx <- 5\nCALL Increment(x)\nOUTPUT x`
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('6\n')
  })

  it('PROCEDURE with BYVAL does not mutate the caller variable', () => {
    const src = `PROCEDURE Increment(BYVAL n : INTEGER)\n  n <- n + 1\nENDPROCEDURE\nDECLARE x : INTEGER\nx <- 5\nCALL Increment(x)\nOUTPUT x`
    const { output } = runSource(src)
    expect(output).toBe('5\n')
  })

  it('recursive FUNCTION computes factorial correctly', () => {
    const src = `FUNCTION Factorial(n : INTEGER) RETURNS INTEGER\n  IF n <= 1 THEN\n    RETURN 1\n  ELSE\n    RETURN n * Factorial(n - 1)\n  ENDIF\nENDFUNCTION\nOUTPUT Factorial(5)`
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('120\n')
  })

  it('a FUNCTION that falls through without RETURN throws MISSING_RETURN', () => {
    const src = `FUNCTION Broken() RETURNS INTEGER\n  DECLARE x : INTEGER\nENDFUNCTION\nOUTPUT Broken()`
    const { error } = runSource(src)
    expect(error?.code).toBe('MISSING_RETURN')
  })

  it('functions can be called before their textual declaration (hoisted)', () => {
    const src = `OUTPUT Double(21)\nFUNCTION Double(n : INTEGER) RETURNS INTEGER\n  RETURN n * 2\nENDFUNCTION`
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('42\n')
  })
})

describe('evaluator — file handling (virtual filesystem)', () => {
  it('round-trips WRITEFILE then READFILE with EOF detection', () => {
    const vfs = new VirtualFileSystem()
    const write = `OPENFILE "scores.txt" FOR WRITE\nWRITEFILE "scores.txt", "Alice"\nWRITEFILE "scores.txt", "Bob"\nCLOSEFILE "scores.txt"`
    const w = runSource(write, [], vfs)
    expect(w.error).toBeNull()

    const read = `DECLARE line : STRING\nOPENFILE "scores.txt" FOR READ\nWHILE NOT EOF("scores.txt") DO\n  READFILE "scores.txt", line\n  OUTPUT line\nENDWHILE\nCLOSEFILE "scores.txt"`
    const r = runSource(read, [], vfs)
    expect(r.error).toBeNull()
    expect(r.output).toBe('Alice\nBob\n')
  })

  it('throws FILE_NOT_OPEN when reading a file that was never opened', () => {
    const { error } = runSource('DECLARE line : STRING\nREADFILE "missing.txt", line')
    expect(error?.code).toBe('FILE_NOT_OPEN')
  })
})

describe('evaluator — the single shared error system', () => {
  it('every failure is a PseudocodeError carrying stage/code/span regardless of what kind of error occurred', () => {
    const cases = [
      'OUTPUT undeclaredVar',
      'DECLARE x : INTEGER\nx <- "oops"',
      'OUTPUT 1 / 0',
      'DECLARE a : ARRAY[1:2] OF INTEGER\nOUTPUT a[9]',
    ]
    for (const src of cases) {
      const { error } = runSource(src)
      expect(error).not.toBeNull()
      expect(error!.stage).toBeTruthy()
      expect(error!.code).toBeTruthy()
      expect(error!.span).toBeTruthy()
    }
  })
})
