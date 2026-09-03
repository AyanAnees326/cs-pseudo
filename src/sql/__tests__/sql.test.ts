import { describe, it, expect } from 'vitest'
import { runQuery } from '../index'
import { SqlError } from '../types'
import { databaseTables } from '../../content/databaseTables'

const Books = databaseTables.Books
const Students = databaseTables.Students

describe('sql engine', () => {
  it('SELECT * FROM Books returns every column and row', () => {
    const result = runQuery('SELECT * FROM Books', Books)
    expect(result.columns).toEqual(['BookID', 'Title', 'Author', 'Genre', 'Price'])
    expect(result.rows).toHaveLength(Books.rows.length)
  })

  it('projects a subset of columns', () => {
    const result = runQuery('SELECT Title, Author FROM Books', Books)
    expect(result.columns).toEqual(['Title', 'Author'])
    expect(result.rows[0]).toHaveLength(2)
  })

  it('filters with a WHERE string equality', () => {
    const result = runQuery('SELECT Title FROM Books WHERE Genre = "SciFi"', Books)
    expect(result.rows.map((r) => r[0])).toEqual(['Dune', 'Foundation', 'The Martian'])
  })

  it('filters with a numeric comparison', () => {
    const result = runQuery('SELECT Title FROM Books WHERE Price < 10', Books)
    expect(result.rows.map((r) => r[0]).sort()).toEqual(['Emma', 'Persuasion', 'Sense and Sensibility'].sort())
  })

  it('combines conditions with AND', () => {
    const result = runQuery('SELECT Title FROM Books WHERE Genre = "Fiction" AND Price < 8', Books)
    expect(result.rows.map((r) => r[0])).toEqual(['Sense and Sensibility'])
  })

  it('combines conditions with OR', () => {
    const result = runQuery('SELECT Title FROM Books WHERE Genre = "SciFi" OR Genre = "NonFiction"', Books)
    expect(result.rows).toHaveLength(5)
  })

  it('sorts with ORDER BY ascending by default', () => {
    const result = runQuery('SELECT Title FROM Books WHERE Genre = "SciFi" ORDER BY Price', Books)
    expect(result.rows.map((r) => r[0])).toEqual(['The Martian', 'Dune', 'Foundation'])
  })

  it('sorts with ORDER BY DESC', () => {
    const result = runQuery('SELECT Title FROM Books ORDER BY Price DESC', Books)
    expect(result.rows[0][0]).toBe('Algorithms Illustrated')
  })

  it('computes COUNT(*)', () => {
    const result = runQuery('SELECT COUNT(*) FROM Books WHERE Genre = "Fiction"', Books)
    expect(result.rows[0][0]).toBe(3)
  })

  it('computes SUM/AVG/MAX/MIN', () => {
    expect(runQuery('SELECT SUM(Price) FROM Books', Books).rows[0][0]).toBe(108)
    expect(runQuery('SELECT MAX(Price) FROM Books', Books).rows[0][0]).toBe(25)
    expect(runQuery('SELECT MIN(Price) FROM Books', Books).rows[0][0]).toBe(7)
    const avg = runQuery('SELECT AVG(Mark) FROM Students WHERE Form = "4A"', Students).rows[0][0] as number
    expect(avg).toBeCloseTo((78 + 91 + 47 + 72) / 4)
  })

  it('rejects mixing plain columns and aggregates (no GROUP BY support)', () => {
    expect(() => runQuery('SELECT Genre, COUNT(*) FROM Books', Books)).toThrow(SqlError)
  })

  it('throws on an unknown column', () => {
    expect(() => runQuery('SELECT Nope FROM Books', Books)).toThrow(SqlError)
  })

  it('throws on an unknown table', () => {
    expect(() => runQuery('SELECT * FROM Nope', Books)).toThrow(SqlError)
  })

  it('throws a clear parse error on malformed SQL', () => {
    expect(() => runQuery('SELECT FROM Books', Books)).toThrow(SqlError)
    expect(() => runQuery('SELEKT * FROM Books', Books)).toThrow(SqlError)
  })

  it('accepts single or double quoted string literals', () => {
    const a = runQuery(`SELECT Title FROM Books WHERE Author = 'Austen'`, Books)
    const b = runQuery(`SELECT Title FROM Books WHERE Author = "Austen"`, Books)
    expect(a.rows).toEqual(b.rows)
    expect(a.rows).toHaveLength(3)
  })
})
