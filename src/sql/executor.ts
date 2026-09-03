import type { ConditionExpr, SelectQuery } from './ast'
import { SqlError, type DatabaseTable, type QueryResult } from './types'

function resolveColumnName(table: DatabaseTable, name: string): string {
  const col = table.columns.find((c) => c.name.toUpperCase() === name.toUpperCase())
  if (!col) throw new SqlError(`Unknown column '${name}' in table '${table.name}'.`)
  return col.name
}

function evalCondition(cond: ConditionExpr, row: Record<string, string | number>, table: DatabaseTable): boolean {
  if (cond.kind === 'and') return evalCondition(cond.left, row, table) && evalCondition(cond.right, row, table)
  if (cond.kind === 'or') return evalCondition(cond.left, row, table) || evalCondition(cond.right, row, table)

  const colName = resolveColumnName(table, cond.column)
  const rowVal = row[colName]
  const cmpVal = cond.value

  switch (cond.op) {
    case '=':
      return rowVal === cmpVal
    case '<>':
      return rowVal !== cmpVal
    case '<':
      return rowVal < cmpVal
    case '>':
      return rowVal > cmpVal
    case '<=':
      return rowVal <= cmpVal
    case '>=':
      return rowVal >= cmpVal
  }
}

/**
 * Executes a parsed single-table SELECT query against an in-memory table.
 * Deliberately scoped to what CAIE O Level 2210 syllabus Topic 9 covers:
 * SELECT/FROM/WHERE/ORDER BY/COUNT/SUM/AVG/MAX/MIN/AND/OR, single table,
 * no JOINs, no GROUP BY (so a query mixes plain columns OR aggregates,
 * never both).
 */
export function executeSql(query: SelectQuery, table: DatabaseTable): QueryResult {
  if (query.table.toUpperCase() !== table.name.toUpperCase()) {
    throw new SqlError(`Unknown table '${query.table}'. This exercise uses the '${table.name}' table.`)
  }

  let rows = table.rows
  if (query.where) rows = rows.filter((r) => evalCondition(query.where!, r, table))

  const hasAgg = query.items.some((i) => i.kind === 'agg')
  const hasPlain = query.items.some((i) => i.kind !== 'agg')
  if (hasAgg && hasPlain) {
    throw new SqlError(
      'This exercise supports either plain columns or an aggregate function (COUNT/SUM/AVG/MAX/MIN) in one query, not both — GROUP BY is beyond O Level scope.',
    )
  }

  if (hasAgg) {
    const columns: string[] = []
    const resultRow: (string | number)[] = []
    for (const item of query.items) {
      if (item.kind !== 'agg') continue
      columns.push(`${item.fn}(${item.arg})`)
      if (item.fn === 'COUNT') {
        resultRow.push(rows.length)
        continue
      }
      if (item.arg === '*') throw new SqlError(`${item.fn} requires a column name, not *.`)
      const colName = resolveColumnName(table, item.arg)
      const values = rows.map((r) => r[colName]).filter((v): v is number => typeof v === 'number')
      if (item.fn === 'SUM') resultRow.push(values.reduce((a, b) => a + b, 0))
      else if (item.fn === 'AVG') resultRow.push(values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)
      else if (item.fn === 'MAX') resultRow.push(values.length ? Math.max(...values) : 0)
      else if (item.fn === 'MIN') resultRow.push(values.length ? Math.min(...values) : 0)
    }
    return { columns, rows: [resultRow] }
  }

  const projectedColumns =
    query.items[0].kind === 'star'
      ? table.columns.map((c) => c.name)
      : query.items.map((i) => (i.kind === 'column' ? resolveColumnName(table, i.name) : ''))

  let resultRows = rows.map((r) => projectedColumns.map((c) => r[c]))

  if (query.orderBy) {
    const colName = resolveColumnName(table, query.orderBy.column)
    const dir = query.orderBy.direction === 'DESC' ? -1 : 1
    const paired = rows.map((r, idx) => ({ sortValue: r[colName], projected: resultRows[idx] }))
    paired.sort((a, b) => {
      if (a.sortValue < b.sortValue) return -1 * dir
      if (a.sortValue > b.sortValue) return 1 * dir
      return 0
    })
    resultRows = paired.map((p) => p.projected)
  }

  return { columns: projectedColumns, rows: resultRows }
}
