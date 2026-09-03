export type AggFn = 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN'

export type SelectItem = { kind: 'star' } | { kind: 'column'; name: string } | { kind: 'agg'; fn: AggFn; arg: '*' | string }

export type CompOp = '=' | '<>' | '<' | '>' | '<=' | '>='

export type ConditionExpr =
  | { kind: 'compare'; column: string; op: CompOp; value: string | number }
  | { kind: 'and'; left: ConditionExpr; right: ConditionExpr }
  | { kind: 'or'; left: ConditionExpr; right: ConditionExpr }

export interface OrderBy {
  column: string
  direction: 'ASC' | 'DESC'
}

export interface SelectQuery {
  items: SelectItem[]
  table: string
  where: ConditionExpr | null
  orderBy: OrderBy | null
}
