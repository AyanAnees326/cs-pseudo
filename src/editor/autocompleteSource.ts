import { autocompletion, snippetCompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { KEYWORDS } from '../interpreter/lexer/tokens'

const SNIPPETS = [
  snippetCompletion('DECLARE ${name} : ${INTEGER}', { label: 'DECLARE', type: 'keyword', detail: 'declare a variable' }),
  snippetCompletion('IF ${condition} THEN\n\t${}\nENDIF', { label: 'IF', type: 'keyword', detail: 'IF...THEN...ENDIF' }),
  snippetCompletion('IF ${condition} THEN\n\t${}\nELSE\n\t${}\nENDIF', {
    label: 'IF-ELSE',
    type: 'keyword',
    detail: 'IF...THEN...ELSE...ENDIF',
  }),
  snippetCompletion('CASE OF ${identifier}\n\t${1}: ${}\n\tOTHERWISE ${}\nENDCASE', { label: 'CASE', type: 'keyword' }),
  snippetCompletion('FOR ${i} <- ${1} TO ${10}\n\t${}\nNEXT ${i}', { label: 'FOR', type: 'keyword' }),
  snippetCompletion('WHILE ${condition} DO\n\t${}\nENDWHILE', { label: 'WHILE', type: 'keyword' }),
  snippetCompletion('REPEAT\n\t${}\nUNTIL ${condition}', { label: 'REPEAT', type: 'keyword' }),
  snippetCompletion('PROCEDURE ${name}(${params})\n\t${}\nENDPROCEDURE', { label: 'PROCEDURE', type: 'keyword' }),
  snippetCompletion('FUNCTION ${name}(${params}) RETURNS ${INTEGER}\n\t${}\nENDFUNCTION', { label: 'FUNCTION', type: 'keyword' }),
  snippetCompletion('TYPE ${Name}\n\tDECLARE ${field} : ${INTEGER}\nENDTYPE', { label: 'TYPE', type: 'keyword', detail: 'record type' }),
]

const SNIPPET_LABELS = new Set(SNIPPETS.map((s) => s.label))
const KEYWORD_COMPLETIONS = Object.keys(KEYWORDS)
  .filter((k) => !SNIPPET_LABELS.has(k))
  .map((label) => ({ label, type: 'keyword' }))

function pseudocodeCompletions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/)
  if (!word || (word.from === word.to && !context.explicit)) return null
  return {
    from: word.from,
    options: [...SNIPPETS, ...KEYWORD_COMPLETIONS],
    validFor: /^[A-Za-z_][A-Za-z0-9_]*$/,
  }
}

/** Learning-mode-only extension. */
export const pseudocodeAutocomplete = autocompletion({ override: [pseudocodeCompletions] })
