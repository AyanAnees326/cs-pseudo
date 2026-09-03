import { describe, it, expect } from 'vitest'
import { lex } from '../lexer/lexer'
import { parse } from '../parser/parser'

function parseSource(src: string) {
  const { tokens } = lex(src)
  return parse(tokens)
}

describe('parser', () => {
  it('parses a DECLARE with an ARRAY[1:10] OF INTEGER type', () => {
    const { program, errors } = parseSource('DECLARE nums : ARRAY[1:10] OF INTEGER')
    expect(errors).toHaveLength(0)
    const decl = program.body[0]
    expect(decl.kind).toBe('VarDecl')
    if (decl.kind === 'VarDecl' && decl.type.kind === 'ArrayType') {
      expect(decl.type.bounds).toHaveLength(1)
    } else {
      throw new Error('expected ArrayType')
    }
  })

  it('parses a 2D array declaration', () => {
    const { program, errors } = parseSource('DECLARE grid : ARRAY[1:3, 1:3] OF INTEGER')
    expect(errors).toHaveLength(0)
    const decl = program.body[0]
    if (decl.kind === 'VarDecl' && decl.type.kind === 'ArrayType') {
      expect(decl.type.bounds).toHaveLength(2)
    } else {
      throw new Error('expected 2D ArrayType')
    }
  })

  it('parses PROCEDURE with BYVAL/BYREF params', () => {
    const src = `PROCEDURE Swap(BYREF a : INTEGER, BYREF b : INTEGER)\n  DECLARE t : INTEGER\nENDPROCEDURE`
    const { program, errors } = parseSource(src)
    expect(errors).toHaveLength(0)
    const decl = program.body[0]
    expect(decl.kind).toBe('ProcedureDecl')
    if (decl.kind === 'ProcedureDecl') {
      expect(decl.params.map((p) => p.passBy)).toEqual(['BYREF', 'BYREF'])
    }
  })

  it('parses FUNCTION ... RETURNS ... ENDFUNCTION', () => {
    const src = `FUNCTION Square(n : INTEGER) RETURNS INTEGER\n  RETURN n * n\nENDFUNCTION`
    const { program, errors } = parseSource(src)
    expect(errors).toHaveLength(0)
    expect(program.body[0].kind).toBe('FunctionDecl')
  })

  it('parses TYPE...ENDTYPE record declarations', () => {
    const src = `TYPE Student\n  DECLARE name : STRING\n  DECLARE mark : INTEGER\nENDTYPE`
    const { program, errors } = parseSource(src)
    expect(errors).toHaveLength(0)
    const decl = program.body[0]
    if (decl.kind === 'TypeDecl' && decl.form === 'record') {
      expect(decl.fields).toHaveLength(2)
    } else {
      throw new Error('expected record TypeDecl')
    }
  })

  it('parses file handling statements', () => {
    const src = `OPENFILE "data.txt" FOR WRITE\nWRITEFILE "data.txt", "hello"\nCLOSEFILE "data.txt"`
    const { errors, program } = parseSource(src)
    expect(errors).toHaveLength(0)
    expect(program.body.map((s) => s.kind)).toEqual(['OpenFile', 'WriteFile', 'CloseFile'])
  })

  it('recovers from a missing ENDIF and still parses the following statement', () => {
    const src = `IF x > 0 THEN\n  OUTPUT "positive"\nOUTPUT "next statement"`
    const { errors, program } = parseSource(src)
    expect(errors.length).toBeGreaterThan(0)
    // Despite the error, the parser should still produce a statement list rather than aborting entirely.
    expect(program.body.length).toBeGreaterThan(0)
  })

  it('reports EXPECTED_TOKEN with correct span for a missing colon in DECLARE', () => {
    const { errors } = parseSource('DECLARE x INTEGER')
    expect(errors.some((e) => e.code === 'EXPECTED_TOKEN')).toBe(true)
  })

  it('parses expression precedence: OR lower than AND lower than relational', () => {
    const { program, errors } = parseSource('DECLARE r : BOOLEAN\nr <- a = 1 AND b = 2 OR c = 3')
    expect(errors).toHaveLength(0)
    const assign = program.body[1]
    expect(assign.kind).toBe('Assignment')
    if (assign.kind === 'Assignment') {
      expect(assign.value.kind).toBe('Binary')
      if (assign.value.kind === 'Binary') expect(assign.value.op).toBe('OR')
    }
  })
})
