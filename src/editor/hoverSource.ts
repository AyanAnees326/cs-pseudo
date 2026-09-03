import { hoverTooltip } from '@codemirror/view'
import { compile } from '../interpreter'

/** Learning-mode-only extension: shows the diagnostic (if any) covering the hovered position. */
export const pseudocodeHover = hoverTooltip((view, pos) => {
  const { diagnostics } = compile(view.state.doc.toString())
  const line = view.state.doc.lineAt(pos)
  const col = pos - line.from + 1

  const match = diagnostics.find((d) => {
    if (line.number < d.span.line || line.number > d.span.endLine) return false
    if (line.number === d.span.line && col < d.span.col) return false
    if (line.number === d.span.endLine && col > d.span.endCol) return false
    return true
  })
  if (!match) return null

  return {
    pos,
    end: pos,
    above: true,
    create() {
      const dom = document.createElement('div')
      dom.className = 'max-w-xs px-3 py-2 text-sm'
      dom.textContent = match.hint ? `${match.message} ${match.hint}` : match.message
      return { dom }
    },
  }
})
