import { StreamLanguage, type StreamParser } from '@codemirror/language'
import { KEYWORDS } from '../interpreter/lexer/tokens'

const TYPE_NAMES = new Set(['INTEGER', 'REAL', 'CHAR', 'STRING', 'BOOLEAN', 'DATE'])

/**
 * A resilient, decoupled-from-the-real-lexer tokenizer purely for syntax
 * highlighting while typing (invalid/partial syntax should never break
 * highlighting). The real lexer+parser (via linterSource.ts) is what
 * actually validates the program.
 */
const parser: StreamParser<null> = {
  token(stream) {
    if (stream.eatSpace()) return null

    if (stream.match('//')) {
      stream.skipToEnd()
      return 'comment'
    }

    if (stream.match(/^"[^"\n]*"?/)) return 'string'
    if (stream.match(/^'[^'\n]?'?/)) return 'string'
    if (stream.match(/^\d+(\.\d+)?/)) return 'number'

    if (stream.match('<-') || stream.match('<=') || stream.match('>=') || stream.match('<>')) return 'operator'
    if (stream.match(/^[+\-*/&=<>()[\],:.^]/)) return 'operator'

    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current()
      const upper = word.toUpperCase()
      if (word === upper && (Object.prototype.hasOwnProperty.call(KEYWORDS, word) || word === 'TRUE' || word === 'FALSE')) {
        return TYPE_NAMES.has(upper) ? 'typeName' : 'keyword'
      }
      return 'variableName'
    }

    stream.next()
    return null
  },
}

export const pseudocodeLanguage = StreamLanguage.define(parser)
