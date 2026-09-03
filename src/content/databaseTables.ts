import type { DatabaseTable } from '../sql'

/** Original sample tables for the Databases (SQL) reference questions — not from any real exam data set. */
export const databaseTables: Record<string, DatabaseTable> = {
  Books: {
    name: 'Books',
    columns: [
      { name: 'BookID', type: 'NUMBER' },
      { name: 'Title', type: 'STRING' },
      { name: 'Author', type: 'STRING' },
      { name: 'Genre', type: 'STRING' },
      { name: 'Price', type: 'NUMBER' },
    ],
    rows: [
      { BookID: 1, Title: 'Dune', Author: 'Herbert', Genre: 'SciFi', Price: 12 },
      { BookID: 2, Title: 'Emma', Author: 'Austen', Genre: 'Fiction', Price: 8 },
      { BookID: 3, Title: 'Circuits 101', Author: 'Reyes', Genre: 'NonFiction', Price: 22 },
      { BookID: 4, Title: 'Foundation', Author: 'Asimov', Genre: 'SciFi', Price: 14 },
      { BookID: 5, Title: 'Persuasion', Author: 'Austen', Genre: 'Fiction', Price: 9 },
      { BookID: 6, Title: 'Algorithms Illustrated', Author: 'Reyes', Genre: 'NonFiction', Price: 25 },
      { BookID: 7, Title: 'The Martian', Author: 'Weir', Genre: 'SciFi', Price: 11 },
      { BookID: 8, Title: 'Sense and Sensibility', Author: 'Austen', Genre: 'Fiction', Price: 7 },
    ],
  },
  Students: {
    name: 'Students',
    columns: [
      { name: 'StudentID', type: 'NUMBER' },
      { name: 'Name', type: 'STRING' },
      { name: 'Form', type: 'STRING' },
      { name: 'Mark', type: 'NUMBER' },
    ],
    rows: [
      { StudentID: 1, Name: 'Amina', Form: '4A', Mark: 78 },
      { StudentID: 2, Name: 'Bilal', Form: '4B', Mark: 55 },
      { StudentID: 3, Name: 'Chen', Form: '4A', Mark: 91 },
      { StudentID: 4, Name: 'Divya', Form: '4B', Mark: 63 },
      { StudentID: 5, Name: 'Elif', Form: '4A', Mark: 47 },
      { StudentID: 6, Name: 'Farid', Form: '4B', Mark: 88 },
      { StudentID: 7, Name: 'Grace', Form: '4A', Mark: 72 },
    ],
  },
}

export type DatabaseTableName = keyof typeof databaseTables
