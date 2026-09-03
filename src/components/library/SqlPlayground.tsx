import { useState } from 'react'
import { Play } from 'lucide-react'
import { runQuery, SqlError, type QueryResult } from '../../sql'
import { databaseTables, type DatabaseTableName } from '../../content/databaseTables'

interface SqlPlaygroundProps {
  tableName: DatabaseTableName
}

export default function SqlPlayground({ tableName }: SqlPlaygroundProps) {
  const table = databaseTables[tableName]
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showData, setShowData] = useState(false)

  function run() {
    try {
      setResult(runQuery(query, table))
      setError(null)
    } catch (e) {
      setResult(null)
      setError(e instanceof SqlError ? e.message : 'Something went wrong running that query.')
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-canvas p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
        <span className="font-mono">
          Table: <span className="text-text">{table.name}</span> ({table.columns.map((c) => c.name).join(', ')})
        </span>
        <button type="button" onClick={() => setShowData((s) => !s)} className="text-accent hover:underline">
          {showData ? 'Hide' : 'Show'} table data
        </button>
      </div>

      {showData && (
        <div className="mt-2 scrollbar-thin overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                {table.columns.map((c) => (
                  <th key={c.name} className="border-b border-border px-2 py-1 text-left text-text-muted">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {table.columns.map((c) => (
                    <td key={c.name} className="border-b border-border/50 px-2 py-1 text-text">
                      {row[c.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`SELECT ... FROM ${table.name} ...`}
        spellCheck={false}
        rows={3}
        className="mt-3 w-full resize-y rounded-md border border-border-strong bg-surface px-2 py-1.5 font-mono text-xs text-text outline-none focus:border-accent"
      />

      <button
        type="button"
        onClick={run}
        className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast"
      >
        <Play size={12} fill="currentColor" />
        Run query
      </button>

      {error && <div className="mt-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>}

      {result && (
        <div className="mt-2 scrollbar-thin overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                {result.columns.map((c, i) => (
                  <th key={i} className="border-b border-border px-2 py-1 text-left text-success">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 ? (
                <tr>
                  <td className="px-2 py-1 text-text-faint" colSpan={result.columns.length}>
                    (no rows)
                  </td>
                </tr>
              ) : (
                result.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((v, j) => (
                      <td key={j} className="border-b border-border/50 px-2 py-1 text-text">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
