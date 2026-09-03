import { useEffect, useRef } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap } from '@codemirror/search'
import { syntaxHighlighting, indentUnit } from '@codemirror/language'
import { pseudocodeLanguage } from './pseudocodeLanguage'
import { pseudocodeHighlightStyle, editorTheme } from './theme'
import { pseudocodeLinter } from './linterSource'
import { pseudocodeHover } from './hoverSource'
import { pseudocodeAutocomplete } from './autocompleteSource'
import type { Mode } from '../app/store/modeStore'

const learningExtensions = [pseudocodeLinter, pseudocodeHover, pseudocodeAutocomplete]

interface UseCodeMirrorOptions {
  value: string
  mode: Mode
  onChange: (value: string) => void
}

export function useCodeMirror({ value, mode, onChange }: UseCodeMirrorOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const learningCompartment = useRef(new Compartment()).current
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        closeBrackets(),
        indentUnit.of('    '),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, ...searchKeymap, indentWithTab]),
        pseudocodeLanguage,
        syntaxHighlighting(pseudocodeHighlightStyle),
        editorTheme,
        EditorView.lineWrapping,
        // Learning-mode-only extensions live in this compartment so Test mode can drop them
        // entirely (not merely disable them) — see App-level mode toggle handling below.
        learningCompartment.of(mode === 'learning' ? learningExtensions : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString())
        }),
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Intentionally only re-run on mount: `value` changes are synced via the effect below,
    // and `mode` changes are handled by reconfiguring the compartment, so the editor
    // instance itself never needs to be torn down and rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: learningCompartment.reconfigure(mode === 'learning' ? learningExtensions : []) })
  }, [mode, learningCompartment])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  return containerRef
}
