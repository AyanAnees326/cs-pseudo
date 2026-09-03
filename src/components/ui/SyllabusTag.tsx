import { BookMarked } from 'lucide-react'
import type { SyllabusRef } from '../../content/curriculum'

export default function SyllabusTag({ syllabusRef }: { syllabusRef: SyllabusRef }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-canvas px-2 py-0.5 text-[11px] font-mono text-text-muted">
      <BookMarked size={10} />
      Syllabus {syllabusRef.section} · {syllabusRef.title}
    </span>
  )
}
