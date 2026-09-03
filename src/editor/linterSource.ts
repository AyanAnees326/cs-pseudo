import { linter, type Diagnostic } from '@codemirror/lint'
import type { Text } from '@codemirror/state'
import { compile } from '../interpreter'

function offsetAt(doc: Text, line: number, col: number): number {
  const clampedLine = Math.max(1, Math.min(line, doc.lines))
  const lineInfo = doc.line(clampedLine)
  return lineInfo.from + Math.max(0, Math.min(col - 1, lineInfo.length))
}

/**
 * Learning-mode-only extension: runs the real lexer+parser (debounced by
 * CM6's linter internals) and maps PseudocodeError diagnostics 1:1 to CM6
 * Diagnostics. Test mode never installs this extension at all.
 */
export const pseudocodeLinter = linter(
  (view): Diagnostic[] => {
    const { diagnostics } = compile(view.state.doc.toString())
    return diagnostics.map((d) => {
      const from = offsetAt(view.state.doc, d.span.line, d.span.col)
      const to = Math.max(from, offsetAt(view.state.doc, d.span.endLine, d.span.endCol))
      return {
        from,
        to,
        severity: d.severity === 'warning' ? 'warning' : 'error',
        message: d.hint ? `${d.message} ${d.hint}` : d.message,
        source: d.code,
      }
    })
  },
  { delay: 300 },
)
