export type SqlColumnType = 'STRING' | 'NUMBER'

export interface DatabaseColumn {
  name: string
  type: SqlColumnType
}

export interface DatabaseTable {
  name: string
  columns: DatabaseColumn[]
  rows: Record<string, string | number>[]
}

export class SqlError extends Error {}

export interface QueryResult {
  columns: string[]
  rows: (string | number)[][]
}
