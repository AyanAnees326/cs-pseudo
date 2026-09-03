export type TokenType =
  // literals
  | 'INTEGER_LITERAL'
  | 'REAL_LITERAL'
  | 'STRING_LITERAL'
  | 'CHAR_LITERAL'
  | 'IDENTIFIER'
  // keywords
  | 'DECLARE'
  | 'CONSTANT'
  | 'TYPE'
  | 'ENDTYPE'
  | 'ARRAY'
  | 'OF'
  | 'INTEGER'
  | 'REAL'
  | 'CHAR'
  | 'STRING'
  | 'BOOLEAN'
  | 'DATE'
  | 'TRUE'
  | 'FALSE'
  | 'INPUT'
  | 'OUTPUT'
  | 'IF'
  | 'THEN'
  | 'ELSE'
  | 'ENDIF'
  | 'CASE'
  | 'OTHERWISE'
  | 'ENDCASE'
  | 'FOR'
  | 'TO'
  | 'STEP'
  | 'NEXT'
  | 'WHILE'
  | 'DO'
  | 'ENDWHILE'
  | 'REPEAT'
  | 'UNTIL'
  | 'PROCEDURE'
  | 'ENDPROCEDURE'
  | 'CALL'
  | 'FUNCTION'
  | 'ENDFUNCTION'
  | 'RETURNS'
  | 'RETURN'
  | 'BYVAL'
  | 'BYREF'
  | 'OPENFILE'
  | 'READFILE'
  | 'WRITEFILE'
  | 'CLOSEFILE'
  | 'READ'
  | 'WRITE'
  | 'APPEND'
  | 'EOF'
  | 'DIV'
  | 'MOD'
  | 'AND'
  | 'OR'
  | 'NOT'
  // operators & punctuation
  | 'ARROW' // <-
  | 'EQ' // =
  | 'NE' // <>
  | 'LE' // <=
  | 'GE' // >=
  | 'LT' // <
  | 'GT' // >
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'AMP' // &
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'COMMA'
  | 'COLON'
  | 'DOT'
  | 'CARET' // ^ (reserved-but-unused for O Level; lexed for a clear "not supported" error)
  | 'NEWLINE'
  | 'EOF_TOKEN'

export interface Span {
  line: number
  col: number
  endLine: number
  endCol: number
}

export interface Token {
  type: TokenType
  value: string
  span: Span
}

export const KEYWORDS: Record<string, TokenType> = {
  DECLARE: 'DECLARE',
  CONSTANT: 'CONSTANT',
  TYPE: 'TYPE',
  ENDTYPE: 'ENDTYPE',
  ARRAY: 'ARRAY',
  OF: 'OF',
  INTEGER: 'INTEGER',
  REAL: 'REAL',
  CHAR: 'CHAR',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  ENDIF: 'ENDIF',
  CASE: 'CASE',
  OTHERWISE: 'OTHERWISE',
  ENDCASE: 'ENDCASE',
  FOR: 'FOR',
  TO: 'TO',
  STEP: 'STEP',
  NEXT: 'NEXT',
  WHILE: 'WHILE',
  DO: 'DO',
  ENDWHILE: 'ENDWHILE',
  REPEAT: 'REPEAT',
  UNTIL: 'UNTIL',
  PROCEDURE: 'PROCEDURE',
  ENDPROCEDURE: 'ENDPROCEDURE',
  CALL: 'CALL',
  FUNCTION: 'FUNCTION',
  ENDFUNCTION: 'ENDFUNCTION',
  RETURNS: 'RETURNS',
  RETURN: 'RETURN',
  BYVAL: 'BYVAL',
  BYREF: 'BYREF',
  OPENFILE: 'OPENFILE',
  READFILE: 'READFILE',
  WRITEFILE: 'WRITEFILE',
  CLOSEFILE: 'CLOSEFILE',
  READ: 'READ',
  WRITE: 'WRITE',
  APPEND: 'APPEND',
  EOF: 'EOF',
  DIV: 'DIV',
  MOD: 'MOD',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
}
