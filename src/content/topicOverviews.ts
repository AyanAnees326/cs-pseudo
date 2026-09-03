import type { Topic } from './curriculum'
import type { ReferenceTopic } from './referenceQuestions'

/** A brief, original theory summary per syllabus subtopic — not adapted from any textbook or past paper. */
export const topicOverviews: Record<Topic | ReferenceTopic, string> = {
  Basics:
    'Every pseudocode program starts with declaring the variables it needs: DECLARE name : Type reserves a named box of a given data type (INTEGER, REAL, CHAR, STRING, BOOLEAN or DATE). Assignment (<-) puts a value in that box, INPUT reads a value from the user into it, and OUTPUT prints values to the screen. Get comfortable with these four building blocks first — everything else in the syllabus is built on top of them.',
  Selection:
    'Selection lets a program choose between different paths depending on a condition. IF...THEN...ELSE...ENDIF picks between two branches (or just skips a block if there is no ELSE); nested IFs let you check several conditions in sequence. CASE OF is a cleaner alternative when you are checking one variable against several possible fixed values, with OTHERWISE as a catch-all for anything that does not match.',
  Iteration:
    'Iteration repeats a block of statements. Use FOR...NEXT when you know in advance how many times to repeat (a count-controlled loop, optionally with STEP for a different increment). Use WHILE...ENDWHILE when the loop should keep going as long as a condition holds, checked before each pass — including zero times if it is false immediately. Use REPEAT...UNTIL when the loop must always run at least once, since its condition is checked after the body.',
  Arrays:
    'An array stores many values of the same type under one name, accessed by an index: DECLARE nums : ARRAY[1:10] OF INTEGER reserves 10 INTEGER slots, indexed 1 to 10. Two-dimensional arrays add a second index for grid-like data. Most array questions combine a FOR loop with array access to implement a standard algorithm — linear search (scan until found), finding a maximum/minimum (track the best value seen so far), or bubble sort (repeatedly swap adjacent out-of-order pairs).',
  Strings:
    'STRING and CHAR values can be inspected and combined with a small set of built-in functions: LENGTH gives the number of characters, MID/LEFT/RIGHT extract a substring, and UCASE/LCASE change case. The & operator concatenates values into a single string (converting numbers to text automatically). Many string questions loop from 1 to LENGTH(text), pulling out one character at a time with MID to examine or rebuild the string.',
  'Procedures & Functions':
    'PROCEDUREs and FUNCTIONs let you name and reuse a block of logic instead of repeating it. A FUNCTION always RETURNs a single value and is used inside an expression (e.g. OUTPUT Square(5)); a PROCEDURE performs an action and is invoked with CALL. Parameters can be passed BYVAL (the procedure gets its own copy — changes inside do not affect the caller\'s variable) or BYREF (the procedure shares the caller\'s actual variable — changes inside are visible afterwards). This BYVAL/BYREF distinction is a favourite exam topic.',
  'File Handling':
    'Pseudocode simulates reading and writing text files with four statements: OPENFILE name FOR READ/WRITE/APPEND opens a file (WRITE erases any existing content, APPEND adds to the end, READ is for reading only), READFILE/WRITEFILE transfer one line at a time, and CLOSEFILE releases it. EOF(name) checks whether the read position has reached the end of the file — the standard pattern is WHILE NOT EOF(name) DO ... READFILE ... ENDWHILE to read every line without knowing in advance how many there are.',
  'User-Defined Types':
    'TYPE...ENDTYPE lets you define your own data type. A record type groups several related fields together (e.g. a Student with a name and a mark), accessed with dot notation like student.mark — useful together with arrays to model a list of structured records. An enumerated type (TYPE TDay = (Mon, Tue, ...)) defines a fixed, named set of possible values for a variable, which is often clearer than using arbitrary numbers to represent categories.',
  'Databases (SQL)':
    'A database table stores rows of related data under named columns, with a primary key column (or combination of columns) that uniquely identifies each row. SQL is used to query a single table: SELECT lists which columns to return (or * for all of them), FROM names the table, WHERE filters rows using conditions combined with AND/OR, and ORDER BY sorts the results. COUNT, SUM, AVG, MAX and MIN summarise a whole result set into a single value rather than returning individual rows.',
  'Boolean Logic':
    'Boolean logic combines TRUE/FALSE (1/0) inputs using logic gates: AND is true only when both inputs are true, OR is true when at least one input is true, and NOT inverts a single input. NAND, NOR and XOR are common combinations (NOT AND, NOT OR, and "exactly one is true" respectively). A truth table lists every possible combination of inputs alongside the resulting output, and is the standard way to prove two expressions are equivalent or to work out what a circuit does.',
}
