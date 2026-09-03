import { parseSql } from './parser'
import { executeSql } from './executor'
import type { DatabaseTable, QueryResult } from './types'

export type { DatabaseColumn, DatabaseTable, QueryResult, SqlColumnType } from './types'
export { SqlError } from './types'

/** Parses and runs a single-table SELECT statement against `table`. Throws SqlError on any problem. */
export function runQuery(sql: string, table: DatabaseTable): QueryResult {
  const query = parseSql(sql)
  return executeSql(query, table)
}
