export type Topic = 'Basics' | 'Selection' | 'Iteration' | 'Arrays' | 'Strings' | 'Procedures & Functions' | 'File Handling' | 'User-Defined Types'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

/**
 * Reference into the CAIE O Level Computer Science 2210 syllabus
 * ("for examination in 2026, 2027 and 2028"), Paper 2 content
 * (Topics 7 and 8 — Algorithm design and Programming).
 */
export interface SyllabusRef {
  section: string // e.g. "8.2"
  title: string // e.g. "Arrays"
}

export interface CurriculumEntry {
  id: string
  title: string
  topic: Topic
  difficulty: Difficulty
  description: string
  starterCode: string
  solutionCode: string
  syllabusRef: SyllabusRef
}

export const curriculum: CurriculumEntry[] = [
  {
    id: 'rectangle-area',
    title: 'Rectangle Area',
    topic: 'Basics',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Read a width and height from the user, then OUTPUT the area of the rectangle.',
    starterCode: `// Read a width and height, then output the rectangle's area.
DECLARE width : REAL
DECLARE height : REAL

// TODO: INPUT width and height, then calculate and OUTPUT the area.
`,
    solutionCode: `DECLARE width : REAL
DECLARE height : REAL
DECLARE area : REAL

OUTPUT "Enter width:"
INPUT width
OUTPUT "Enter height:"
INPUT height

area <- width * height
OUTPUT "Area: " & area
`,
  },
  {
    id: 'temperature-converter',
    title: 'Temperature Converter',
    topic: 'Basics',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Convert a temperature from Celsius to Fahrenheit using F = C * 9 / 5 + 32.',
    starterCode: `DECLARE celsius : REAL
DECLARE fahrenheit : REAL

// TODO: INPUT celsius, compute fahrenheit, OUTPUT the result.
`,
    solutionCode: `DECLARE celsius : REAL
DECLARE fahrenheit : REAL

OUTPUT "Enter temperature in Celsius:"
INPUT celsius
fahrenheit <- celsius * 9 / 5 + 32
OUTPUT celsius & "C is " & fahrenheit & "F"
`,
  },
  {
    id: 'simple-interest',
    title: 'Simple Interest',
    topic: 'Basics',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Calculate simple interest using Interest = Principal * Rate * Time / 100.',
    starterCode: `DECLARE principal : REAL
DECLARE rate : REAL
DECLARE time : REAL

// TODO: INPUT principal, rate, time. Calculate interest and OUTPUT it.
`,
    solutionCode: `DECLARE principal : REAL
DECLARE rate : REAL
DECLARE time : REAL
DECLARE interest : REAL

OUTPUT "Enter principal:"
INPUT principal
OUTPUT "Enter rate (%):"
INPUT rate
OUTPUT "Enter time (years):"
INPUT time

interest <- principal * rate * time / 100
OUTPUT "Interest: " & interest
`,
  },
  {
    id: 'average-of-three',
    title: 'Average of Three Numbers',
    topic: 'Basics',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Read three numbers and OUTPUT their average.',
    starterCode: `DECLARE a : REAL
DECLARE b : REAL
DECLARE c : REAL

// TODO: INPUT three numbers, then OUTPUT their average.
`,
    solutionCode: `DECLARE a : REAL
DECLARE b : REAL
DECLARE c : REAL
DECLARE average : REAL

OUTPUT "Enter three numbers:"
INPUT a
INPUT b
INPUT c

average <- (a + b + c) / 3
OUTPUT "Average: " & average
`,
  },
  {
    id: 'grade-calculator',
    title: 'Grade Calculator',
    topic: 'Selection',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Read a mark out of 100 and OUTPUT a grade: A (>=80), B (>=60), C (>=40), otherwise F.',
    starterCode: `DECLARE mark : INTEGER
OUTPUT "Enter mark:"
INPUT mark

// TODO: use IF/ELSE IF (nested IFs) to output A, B, C or F.
`,
    solutionCode: `DECLARE mark : INTEGER
OUTPUT "Enter mark:"
INPUT mark

IF mark >= 80 THEN
  OUTPUT "A"
ELSE
  IF mark >= 60 THEN
    OUTPUT "B"
  ELSE
    IF mark >= 40 THEN
      OUTPUT "C"
    ELSE
      OUTPUT "F"
    ENDIF
  ENDIF
ENDIF
`,
  },
  {
    id: 'menu-driven-case',
    title: 'Menu-Driven Calculator',
    topic: 'Selection',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'intermediate',
    description: 'Use CASE OF to build a menu: 1 = add, 2 = subtract, 3 = multiply, otherwise show an error.',
    starterCode: `DECLARE choice : INTEGER
DECLARE a : INTEGER
DECLARE b : INTEGER
a <- 10
b <- 4

OUTPUT "1: Add  2: Subtract  3: Multiply"
INPUT choice

// TODO: CASE OF choice ... OTHERWISE ... ENDCASE
`,
    solutionCode: `DECLARE choice : INTEGER
DECLARE a : INTEGER
DECLARE b : INTEGER
a <- 10
b <- 4

OUTPUT "1: Add  2: Subtract  3: Multiply"
INPUT choice

CASE OF choice
  1: OUTPUT a + b
  2: OUTPUT a - b
  3: OUTPUT a * b
  OTHERWISE OUTPUT "Invalid choice"
ENDCASE
`,
  },
  {
    id: 'leap-year-checker',
    title: 'Leap Year Checker',
    topic: 'Selection',
    syllabusRef: { section: '8.1', title: 'Programming concepts (selection)' },
    difficulty: 'intermediate',
    description: 'A year is a leap year if divisible by 4, unless divisible by 100 (then it must also be divisible by 400).',
    starterCode: `DECLARE year : INTEGER
OUTPUT "Enter a year:"
INPUT year

// TODO: IF year MOD 4 = 0 AND (year MOD 100 <> 0 OR year MOD 400 = 0) THEN ... ENDIF
`,
    solutionCode: `DECLARE year : INTEGER
OUTPUT "Enter a year:"
INPUT year

IF year MOD 4 = 0 AND (year MOD 100 <> 0 OR year MOD 400 = 0) THEN
  OUTPUT "Leap year"
ELSE
  OUTPUT "Not a leap year"
ENDIF
`,
  },
  {
    id: 'sum-average-for',
    title: 'Sum and Average of N Numbers',
    topic: 'Iteration',
    syllabusRef: { section: '7', title: 'Algorithm design and problem-solving (totalling)' },
    difficulty: 'beginner',
    description: 'Read 5 numbers using a FOR loop, then OUTPUT their total and average.',
    starterCode: `DECLARE i : INTEGER
DECLARE n : INTEGER
DECLARE total : INTEGER
total <- 0

// TODO: FOR loop reading 5 numbers into n, adding to total, then output total and average.
`,
    solutionCode: `DECLARE i : INTEGER
DECLARE n : INTEGER
DECLARE total : INTEGER
total <- 0

FOR i <- 1 TO 5
  OUTPUT "Enter number " & i & ":"
  INPUT n
  total <- total + n
NEXT i

OUTPUT "Total: " & total
OUTPUT "Average: " & (total / 5)
`,
  },
  {
    id: 'input-validation-while',
    title: 'Input Validation Loop',
    topic: 'Iteration',
    syllabusRef: { section: '7', title: 'Algorithm design and problem-solving (validation)' },
    difficulty: 'intermediate',
    description: 'Keep asking for a number between 1 and 10 using WHILE until a valid one is entered.',
    starterCode: `DECLARE n : INTEGER
n <- 0

// TODO: WHILE n < 1 OR n > 10 DO ... ENDWHILE, prompting each time.
`,
    solutionCode: `DECLARE n : INTEGER
n <- 0

WHILE n < 1 OR n > 10 DO
  OUTPUT "Enter a number between 1 and 10:"
  INPUT n
ENDWHILE

OUTPUT "You entered: " & n
`,
  },
  {
    id: 'pin-retry-repeat',
    title: 'PIN Retry',
    topic: 'Iteration',
    syllabusRef: { section: '8.1', title: 'Programming concepts (iteration)' },
    difficulty: 'intermediate',
    description: 'Use REPEAT...UNTIL to ask for a 4-digit PIN (1234) until it is entered correctly.',
    starterCode: `DECLARE pin : INTEGER

// TODO: REPEAT ... UNTIL pin = 1234
`,
    solutionCode: `DECLARE pin : INTEGER

REPEAT
  OUTPUT "Enter PIN:"
  INPUT pin
UNTIL pin = 1234

OUTPUT "Access granted."
`,
  },
  {
    id: 'multiplication-table',
    title: 'Multiplication Table',
    topic: 'Iteration',
    syllabusRef: { section: '8.1', title: 'Programming concepts (iteration)' },
    difficulty: 'beginner',
    description: 'Read a number and OUTPUT its multiplication table from 1 to 10 using a FOR loop.',
    starterCode: `DECLARE n : INTEGER
DECLARE i : INTEGER
OUTPUT "Enter a number:"
INPUT n

// TODO: FOR i <- 1 TO 10, OUTPUT n & " x " & i & " = " & (n * i)
`,
    solutionCode: `DECLARE n : INTEGER
DECLARE i : INTEGER
OUTPUT "Enter a number:"
INPUT n

FOR i <- 1 TO 10
  OUTPUT n & " x " & i & " = " & (n * i)
NEXT i
`,
  },
  {
    id: 'linear-search',
    title: 'Linear Search',
    topic: 'Arrays',
    syllabusRef: { section: '7', title: 'Algorithm design — standard method: linear search' },
    difficulty: 'intermediate',
    description: 'Search a 5-element array for a target value and OUTPUT its index, or -1 if not found.',
    starterCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE target : INTEGER
DECLARE i : INTEGER
DECLARE found : INTEGER

nums[1] <- 12
nums[2] <- 45
nums[3] <- 7
nums[4] <- 23
nums[5] <- 9
target <- 23
found <- -1

// TODO: loop through nums, set found to i if nums[i] = target.
OUTPUT found
`,
    solutionCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE target : INTEGER
DECLARE i : INTEGER
DECLARE found : INTEGER

nums[1] <- 12
nums[2] <- 45
nums[3] <- 7
nums[4] <- 23
nums[5] <- 9
target <- 23
found <- -1

FOR i <- 1 TO 5
  IF nums[i] = target THEN
    found <- i
  ENDIF
NEXT i

OUTPUT found
`,
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    topic: 'Arrays',
    syllabusRef: { section: '7', title: 'Algorithm design — standard method: bubble sort' },
    difficulty: 'advanced',
    description: 'Sort a 5-element array of integers into ascending order using bubble sort.',
    starterCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER
DECLARE j : INTEGER
DECLARE temp : INTEGER

nums[1] <- 5
nums[2] <- 3
nums[3] <- 4
nums[4] <- 1
nums[5] <- 2

// TODO: nested FOR loops comparing and swapping adjacent elements.

FOR i <- 1 TO 5
  OUTPUT nums[i]
NEXT i
`,
    solutionCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER
DECLARE j : INTEGER
DECLARE temp : INTEGER

nums[1] <- 5
nums[2] <- 3
nums[3] <- 4
nums[4] <- 1
nums[5] <- 2

FOR i <- 1 TO 4
  FOR j <- 1 TO 5 - i
    IF nums[j] > nums[j + 1] THEN
      temp <- nums[j]
      nums[j] <- nums[j + 1]
      nums[j + 1] <- temp
    ENDIF
  NEXT j
NEXT i

FOR i <- 1 TO 5
  OUTPUT nums[i]
NEXT i
`,
  },
  {
    id: 'array-max-min',
    title: 'Array Maximum and Minimum',
    topic: 'Arrays',
    syllabusRef: { section: '7', title: 'Algorithm design — standard method: max/min' },
    difficulty: 'intermediate',
    description: 'Find the largest and smallest values in an array by looping through it once.',
    starterCode: `DECLARE nums : ARRAY[1:6] OF INTEGER
DECLARE i : INTEGER
DECLARE maxVal : INTEGER
DECLARE minVal : INTEGER

nums[1] <- 4
nums[2] <- 17
nums[3] <- 2
nums[4] <- 9
nums[5] <- 23
nums[6] <- 8

maxVal <- nums[1]
minVal <- nums[1]

// TODO: loop from 2 TO 6, updating maxVal/minVal when a bigger/smaller value is found.
OUTPUT "Max: " & maxVal
OUTPUT "Min: " & minVal
`,
    solutionCode: `DECLARE nums : ARRAY[1:6] OF INTEGER
DECLARE i : INTEGER
DECLARE maxVal : INTEGER
DECLARE minVal : INTEGER

nums[1] <- 4
nums[2] <- 17
nums[3] <- 2
nums[4] <- 9
nums[5] <- 23
nums[6] <- 8

maxVal <- nums[1]
minVal <- nums[1]

FOR i <- 2 TO 6
  IF nums[i] > maxVal THEN
    maxVal <- nums[i]
  ENDIF
  IF nums[i] < minVal THEN
    minVal <- nums[i]
  ENDIF
NEXT i

OUTPUT "Max: " & maxVal
OUTPUT "Min: " & minVal
`,
  },
  {
    id: 'reverse-array',
    title: 'Reverse an Array',
    topic: 'Arrays',
    syllabusRef: { section: '8.2', title: 'Arrays' },
    difficulty: 'intermediate',
    description: 'Reverse the order of a 5-element array in place, by swapping pairs of elements.',
    starterCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER
DECLARE temp : INTEGER

nums[1] <- 1
nums[2] <- 2
nums[3] <- 3
nums[4] <- 4
nums[5] <- 5

// TODO: FOR i <- 1 TO 2, swap nums[i] with nums[6 - i] using temp.

FOR i <- 1 TO 5
  OUTPUT nums[i]
NEXT i
`,
    solutionCode: `DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER
DECLARE temp : INTEGER

nums[1] <- 1
nums[2] <- 2
nums[3] <- 3
nums[4] <- 4
nums[5] <- 5

FOR i <- 1 TO 2
  temp <- nums[i]
  nums[i] <- nums[6 - i]
  nums[6 - i] <- temp
NEXT i

FOR i <- 1 TO 5
  OUTPUT nums[i]
NEXT i
`,
  },
  {
    id: 'palindrome-checker',
    title: 'Palindrome Checker',
    topic: 'Strings',
    syllabusRef: { section: '8.1', title: 'Programming concepts (string handling)' },
    difficulty: 'intermediate',
    description: 'Use LENGTH and MID to check whether a word reads the same forwards and backwards.',
    starterCode: `FUNCTION IsPalindrome(s : STRING) RETURNS BOOLEAN
  DECLARE i : INTEGER
  DECLARE n : INTEGER
  n <- LENGTH(s)
  // TODO: compare characters from both ends using MID; RETURN FALSE early on mismatch.
  RETURN TRUE
ENDFUNCTION

IF IsPalindrome("racecar") THEN
  OUTPUT "Palindrome"
ELSE
  OUTPUT "Not a palindrome"
ENDIF
`,
    solutionCode: `FUNCTION IsPalindrome(s : STRING) RETURNS BOOLEAN
  DECLARE i : INTEGER
  DECLARE n : INTEGER
  n <- LENGTH(s)
  FOR i <- 1 TO n DIV 2
    IF MID(s, i, 1) <> MID(s, n - i + 1, 1) THEN
      RETURN FALSE
    ENDIF
  NEXT i
  RETURN TRUE
ENDFUNCTION

IF IsPalindrome("racecar") THEN
  OUTPUT "Palindrome"
ELSE
  OUTPUT "Not a palindrome"
ENDIF
`,
  },
  {
    id: 'vowel-counter',
    title: 'Vowel Counter',
    topic: 'Strings',
    syllabusRef: { section: '8.1', title: 'Programming concepts (string handling)' },
    difficulty: 'beginner',
    description: 'Count how many vowels (A, E, I, O, U) appear in a word, using UCASE and MID.',
    starterCode: `DECLARE word : STRING
DECLARE i : INTEGER
DECLARE count : INTEGER
DECLARE letter : STRING
count <- 0

OUTPUT "Enter a word:"
INPUT word

// TODO: loop over each character, UCASE it, and check against A/E/I/O/U.
OUTPUT count
`,
    solutionCode: `DECLARE word : STRING
DECLARE i : INTEGER
DECLARE count : INTEGER
DECLARE letter : STRING
count <- 0

OUTPUT "Enter a word:"
INPUT word

FOR i <- 1 TO LENGTH(word)
  letter <- UCASE(MID(word, i, 1))
  IF letter = "A" OR letter = "E" OR letter = "I" OR letter = "O" OR letter = "U" THEN
    count <- count + 1
  ENDIF
NEXT i

OUTPUT count
`,
  },
  {
    id: 'reverse-string',
    title: 'Reverse a String',
    topic: 'Strings',
    syllabusRef: { section: '8.1', title: 'Programming concepts (string handling)' },
    difficulty: 'intermediate',
    description: 'Build a reversed copy of a word using LENGTH, MID, and string concatenation.',
    starterCode: `DECLARE word : STRING
DECLARE reversed : STRING
DECLARE i : INTEGER
reversed <- ""

OUTPUT "Enter a word:"
INPUT word

// TODO: FOR i <- LENGTH(word) TO 1 STEP -1, append MID(word, i, 1) to reversed.
OUTPUT reversed
`,
    solutionCode: `DECLARE word : STRING
DECLARE reversed : STRING
DECLARE i : INTEGER
reversed <- ""

OUTPUT "Enter a word:"
INPUT word

FOR i <- LENGTH(word) TO 1 STEP -1
  reversed <- reversed & MID(word, i, 1)
NEXT i

OUTPUT reversed
`,
  },
  {
    id: 'byval-byref-demo',
    title: 'BYVAL vs BYREF',
    topic: 'Procedures & Functions',
    syllabusRef: { section: '8.1', title: 'Programming concepts (procedures and functions)' },
    difficulty: 'intermediate',
    description: 'See the difference between passing a parameter BYVAL (copy) and BYREF (reference).',
    starterCode: `PROCEDURE TryByVal(BYVAL n : INTEGER)
  n <- n + 100
ENDPROCEDURE

PROCEDURE TryByRef(BYREF n : INTEGER)
  n <- n + 100
ENDPROCEDURE

DECLARE x : INTEGER
x <- 1
// TODO: CALL TryByVal(x), OUTPUT x. Then CALL TryByRef(x), OUTPUT x.
`,
    solutionCode: `PROCEDURE TryByVal(BYVAL n : INTEGER)
  n <- n + 100
ENDPROCEDURE

PROCEDURE TryByRef(BYREF n : INTEGER)
  n <- n + 100
ENDPROCEDURE

DECLARE x : INTEGER
x <- 1

CALL TryByVal(x)
OUTPUT x // unchanged: 1

CALL TryByRef(x)
OUTPUT x // changed: 101
`,
  },
  {
    id: 'recursive-factorial',
    title: 'Recursive Factorial',
    topic: 'Procedures & Functions',
    syllabusRef: { section: '8.1', title: 'Programming concepts (procedures and functions)' },
    difficulty: 'advanced',
    description: 'Write a recursive FUNCTION that calculates n! (n factorial).',
    starterCode: `FUNCTION Factorial(n : INTEGER) RETURNS INTEGER
  // TODO: base case n <= 1 RETURN 1, else RETURN n * Factorial(n - 1)
ENDFUNCTION

OUTPUT Factorial(5)
`,
    solutionCode: `FUNCTION Factorial(n : INTEGER) RETURNS INTEGER
  IF n <= 1 THEN
    RETURN 1
  ELSE
    RETURN n * Factorial(n - 1)
  ENDIF
ENDFUNCTION

OUTPUT Factorial(5)
`,
  },
  {
    id: 'prime-checker',
    title: 'Prime Checker',
    topic: 'Procedures & Functions',
    syllabusRef: { section: '7', title: 'Algorithm design and problem-solving' },
    difficulty: 'intermediate',
    description: 'Write a FUNCTION that returns TRUE if a number is prime, FALSE otherwise.',
    starterCode: `FUNCTION IsPrime(n : INTEGER) RETURNS BOOLEAN
  DECLARE i : INTEGER
  IF n < 2 THEN
    RETURN FALSE
  ENDIF
  // TODO: check divisibility from 2 to n - 1
  RETURN TRUE
ENDFUNCTION

OUTPUT IsPrime(7)
OUTPUT IsPrime(8)
`,
    solutionCode: `FUNCTION IsPrime(n : INTEGER) RETURNS BOOLEAN
  DECLARE i : INTEGER
  IF n < 2 THEN
    RETURN FALSE
  ENDIF
  FOR i <- 2 TO n - 1
    IF n MOD i = 0 THEN
      RETURN FALSE
    ENDIF
  NEXT i
  RETURN TRUE
ENDFUNCTION

OUTPUT IsPrime(7)
OUTPUT IsPrime(8)
`,
  },
  {
    id: 'sum-of-digits',
    title: 'Sum of Digits',
    topic: 'Procedures & Functions',
    syllabusRef: { section: '8.1', title: 'Programming concepts (functions)' },
    difficulty: 'intermediate',
    description: 'Write a FUNCTION that adds up the digits of an integer using MOD and DIV.',
    starterCode: `FUNCTION SumOfDigits(n : INTEGER) RETURNS INTEGER
  DECLARE total : INTEGER
  DECLARE num : INTEGER
  total <- 0
  num <- n
  // TODO: WHILE num > 0 DO extract the last digit with MOD 10, add it to total,
  // then remove it with num <- num DIV 10. ENDWHILE
  RETURN total
ENDFUNCTION

OUTPUT SumOfDigits(1234)
`,
    solutionCode: `FUNCTION SumOfDigits(n : INTEGER) RETURNS INTEGER
  DECLARE total : INTEGER
  DECLARE num : INTEGER
  total <- 0
  num <- n
  WHILE num > 0 DO
    total <- total + (num MOD 10)
    num <- num DIV 10
  ENDWHILE
  RETURN total
ENDFUNCTION

OUTPUT SumOfDigits(1234)
`,
  },
  {
    id: 'student-scores-file',
    title: 'Student Scores File',
    topic: 'File Handling',
    syllabusRef: { section: '8.3', title: 'File handling' },
    difficulty: 'intermediate',
    description: 'Write three names to a virtual file, then open it again and read every line back out.',
    starterCode: `// TODO: OPENFILE "scores.txt" FOR WRITE, WRITEFILE three names, CLOSEFILE.
// Then OPENFILE FOR READ, loop with WHILE NOT EOF(...) DO, READFILE + OUTPUT, CLOSEFILE.
`,
    solutionCode: `OPENFILE "scores.txt" FOR WRITE
WRITEFILE "scores.txt", "Alice"
WRITEFILE "scores.txt", "Bilal"
WRITEFILE "scores.txt", "Chen"
CLOSEFILE "scores.txt"

DECLARE line : STRING
OPENFILE "scores.txt" FOR READ
WHILE NOT EOF("scores.txt") DO
  READFILE "scores.txt", line
  OUTPUT line
ENDWHILE
CLOSEFILE "scores.txt"
`,
  },
  {
    id: 'append-log-file',
    title: 'Append to a Log File',
    topic: 'File Handling',
    syllabusRef: { section: '8.3', title: 'File handling' },
    difficulty: 'intermediate',
    description: 'Use OPENFILE FOR APPEND to add new entries without erasing what is already in the file, then read it all back.',
    starterCode: `// TODO: OPENFILE "log.txt" FOR APPEND, WRITEFILE two new entries, CLOSEFILE.
// Then OPENFILE FOR READ, loop with WHILE NOT EOF(...) DO, READFILE + OUTPUT, CLOSEFILE.
`,
    solutionCode: `OPENFILE "log.txt" FOR APPEND
WRITEFILE "log.txt", "Login: Alice"
WRITEFILE "log.txt", "Login: Bilal"
CLOSEFILE "log.txt"

DECLARE line : STRING
OPENFILE "log.txt" FOR READ
WHILE NOT EOF("log.txt") DO
  READFILE "log.txt", line
  OUTPUT line
ENDWHILE
CLOSEFILE "log.txt"
`,
  },
  {
    id: 'count-file-lines',
    title: 'Count Lines in a File',
    topic: 'File Handling',
    syllabusRef: { section: '8.3', title: 'File handling' },
    difficulty: 'beginner',
    description: 'Read a file line by line, counting how many lines it contains using EOF.',
    starterCode: `OPENFILE "attendance.txt" FOR WRITE
WRITEFILE "attendance.txt", "Amina"
WRITEFILE "attendance.txt", "Bilal"
WRITEFILE "attendance.txt", "Chen"
WRITEFILE "attendance.txt", "Divya"
CLOSEFILE "attendance.txt"

DECLARE line : STRING
DECLARE count : INTEGER
count <- 0

// TODO: OPENFILE "attendance.txt" FOR READ, loop with WHILE NOT EOF(...) DO incrementing count,
// CLOSEFILE, then OUTPUT count.
`,
    solutionCode: `OPENFILE "attendance.txt" FOR WRITE
WRITEFILE "attendance.txt", "Amina"
WRITEFILE "attendance.txt", "Bilal"
WRITEFILE "attendance.txt", "Chen"
WRITEFILE "attendance.txt", "Divya"
CLOSEFILE "attendance.txt"

DECLARE line : STRING
DECLARE count : INTEGER
count <- 0

OPENFILE "attendance.txt" FOR READ
WHILE NOT EOF("attendance.txt") DO
  READFILE "attendance.txt", line
  count <- count + 1
ENDWHILE
CLOSEFILE "attendance.txt"

OUTPUT "Number of lines: " & count
`,
  },
  {
    id: 'student-record-type',
    title: 'Student Record',
    topic: 'User-Defined Types',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Define a TYPE for a Student (name, mark) and store one in a variable.',
    starterCode: `TYPE Student
  DECLARE name : STRING
  DECLARE mark : INTEGER
ENDTYPE

DECLARE s : Student
// TODO: set s.name and s.mark, then OUTPUT them.
`,
    solutionCode: `TYPE Student
  DECLARE name : STRING
  DECLARE mark : INTEGER
ENDTYPE

DECLARE s : Student
s.name <- "Alice"
s.mark <- 87
OUTPUT s.name & ": " & s.mark
`,
  },
  {
    id: 'day-enum',
    title: 'Day of the Week (Enumerated Type)',
    topic: 'User-Defined Types',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'beginner',
    description: 'Define an enumerated TYPE for days of the week and compare against it.',
    starterCode: `TYPE TDay = (Mon, Tue, Wed, Thu, Fri, Sat, Sun)

DECLARE today : TDay
// TODO: assign today <- Sat, then IF today = Sat OR today = Sun OUTPUT "Weekend" ELSE "Weekday"
`,
    solutionCode: `TYPE TDay = (Mon, Tue, Wed, Thu, Fri, Sat, Sun)

DECLARE today : TDay
today <- Sat

IF today = Sat OR today = Sun THEN
  OUTPUT "Weekend"
ELSE
  OUTPUT "Weekday"
ENDIF
`,
  },
  {
    id: 'array-of-records',
    title: 'Array of Records',
    topic: 'User-Defined Types',
    syllabusRef: { section: '8.1', title: 'Programming concepts' },
    difficulty: 'intermediate',
    description: 'Combine an ARRAY with a record TYPE to store several students, then loop through printing each one.',
    starterCode: `TYPE Student
  DECLARE name : STRING
  DECLARE mark : INTEGER
ENDTYPE

DECLARE students : ARRAY[1:3] OF Student
DECLARE i : INTEGER

students[1].name <- "Amina"
students[1].mark <- 78
students[2].name <- "Bilal"
students[2].mark <- 55
students[3].name <- "Chen"
students[3].mark <- 91

// TODO: FOR i <- 1 TO 3, OUTPUT students[i].name & ": " & students[i].mark
`,
    solutionCode: `TYPE Student
  DECLARE name : STRING
  DECLARE mark : INTEGER
ENDTYPE

DECLARE students : ARRAY[1:3] OF Student
DECLARE i : INTEGER

students[1].name <- "Amina"
students[1].mark <- 78
students[2].name <- "Bilal"
students[2].mark <- 55
students[3].name <- "Chen"
students[3].mark <- 91

FOR i <- 1 TO 3
  OUTPUT students[i].name & ": " & students[i].mark
NEXT i
`,
  },
]

export const topics: Topic[] = [
  'Basics',
  'Selection',
  'Iteration',
  'Arrays',
  'Strings',
  'Procedures & Functions',
  'File Handling',
  'User-Defined Types',
]
