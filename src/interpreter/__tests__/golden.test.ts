import { describe, it, expect } from 'vitest'
import { runSource } from './testUtils'

describe('golden — full CAIE-style programs', () => {
  it('bubble sort prints the sorted array', () => {
    const src = `
DECLARE nums : ARRAY[1:5] OF INTEGER
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
`.trim()
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('1\n2\n3\n4\n5\n')
  })

  it('linear search FUNCTION returns the correct index or -1', () => {
    const src = `
FUNCTION LinearSearch(values : ARRAY[1:5] OF INTEGER, target : INTEGER) RETURNS INTEGER
  DECLARE i : INTEGER
  FOR i <- 1 TO 5
    IF values[i] = target THEN
      RETURN i
    ENDIF
  NEXT i
  RETURN -1
ENDFUNCTION

DECLARE nums : ARRAY[1:5] OF INTEGER
nums[1] <- 10
nums[2] <- 20
nums[3] <- 30
nums[4] <- 40
nums[5] <- 50
OUTPUT LinearSearch(nums, 30)
OUTPUT LinearSearch(nums, 99)
`.trim()
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('3\n-1\n')
  })

  it('palindrome checker using string built-ins', () => {
    const src = `
FUNCTION IsPalindrome(s : STRING) RETURNS BOOLEAN
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
  OUTPUT "yes"
ELSE
  OUTPUT "no"
ENDIF
IF IsPalindrome("hello") THEN
  OUTPUT "yes"
ELSE
  OUTPUT "no"
ENDIF
`.trim()
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('yes\nno\n')
  })

  it('TYPE record array tracks student marks', () => {
    const src = `
TYPE Student
  DECLARE name : STRING
  DECLARE mark : INTEGER
ENDTYPE

DECLARE s : Student
s.name <- "Alice"
s.mark <- 87
OUTPUT s.name & ": " & s.mark
`.trim()
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('Alice: 87\n')
  })

  it('array of records supports indexed field assignment and access', () => {
    const src = `
TYPE Student
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
`.trim()
    const { output, error } = runSource(src)
    expect(error).toBeNull()
    expect(output).toBe('Amina: 78\nBilal: 55\nChen: 91\n')
  })
})
