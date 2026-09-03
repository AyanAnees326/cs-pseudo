import { EditorView } from '@codemirror/view'
import { HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const v = (name: string) => `var(${name})`

export const pseudocodeHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: v('--color-accent'), fontWeight: '600' },
  { tag: t.typeName, color: v('--color-success') },
  { tag: t.string, color: v('--color-warning') },
  { tag: t.number, color: v('--color-success') },
  { tag: t.comment, color: v('--color-text-faint'), fontStyle: 'italic' },
  { tag: t.operator, color: v('--color-accent-strong') },
  { tag: t.variableName, color: v('--color-text') },
])

export const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-canvas)',
    color: 'var(--color-text)',
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
  },
  '.cm-content': {
    caretColor: 'var(--color-accent)',
    padding: '12px 0',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-accent)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-canvas)',
    color: 'var(--color-text-faint)',
    border: 'none',
    borderRight: '1px solid var(--color-border)',
  },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
    color: 'var(--color-text)',
  },
  '.cm-lintRange-error': { textDecoration: 'underline wavy var(--color-danger)' },
  '.cm-lintRange-warning': { textDecoration: 'underline wavy var(--color-warning)' },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--color-danger)' },
  '.cm-diagnostic-warning': { borderLeftColor: 'var(--color-warning)' },
})
