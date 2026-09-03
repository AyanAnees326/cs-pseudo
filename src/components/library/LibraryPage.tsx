import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, FilePlus, FileCode } from 'lucide-react'
import { curriculum, topics, type CurriculumEntry } from '../../content/curriculum'
import { referenceQuestions, referenceTopics, type ReferenceQuestion } from '../../content/referenceQuestions'
import { topicOverviews } from '../../content/topicOverviews'
import { useFilesStore } from '../../app/store/filesStore'
import SqlPlayground from './SqlPlayground'
import SyllabusTag from '../ui/SyllabusTag'

const DIFFICULTY_COLOR: Record<CurriculumEntry['difficulty'], string> = {
  beginner: 'text-success',
  intermediate: 'text-warning',
  advanced: 'text-danger',
}

function TopicOverview({ topic }: { topic: keyof typeof topicOverviews }) {
  return <p className="mb-4 text-sm leading-relaxed text-text-muted">{topicOverviews[topic]}</p>
}

function EntryCard({ entry }: { entry: CurriculumEntry }) {
  const [revealed, setRevealed] = useState(false)
  const createFile = useFilesStore((s) => s.createFile)
  const navigate = useNavigate()

  function openInEditor() {
    createFile(entry.id, `// ${entry.title}\n`, entry.id)
    navigate('/')
  }

  function openSolutionInEditor() {
    createFile(`${entry.id}-solution`, entry.solutionCode, entry.id)
    navigate('/')
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text">{entry.title}</h3>
          <p className="mt-1 text-sm text-text-muted">{entry.description}</p>
          <div className="mt-2">
            <SyllabusTag syllabusRef={entry.syllabusRef} />
          </div>
        </div>
        <span className={`shrink-0 text-xs font-medium uppercase tracking-wide ${DIFFICULTY_COLOR[entry.difficulty]}`}>
          {entry.difficulty}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openInEditor}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-contrast"
        >
          <FilePlus size={14} />
          Open in editor
        </button>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          {revealed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {revealed ? 'Hide solution' : 'Reveal solution'}
        </button>
      </div>

      {revealed && (
        <>
          <pre className="mt-3 scrollbar-thin overflow-x-auto rounded-lg border border-border bg-canvas p-3 font-mono text-xs text-text">
            {entry.solutionCode}
          </pre>
          <button
            type="button"
            onClick={openSolutionInEditor}
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            <FileCode size={14} />
            Open solution in editor
          </button>
        </>
      )}
    </div>
  )
}

function ReferenceCard({ question }: { question: ReferenceQuestion }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-text">{question.title}</h3>
        <SyllabusTag syllabusRef={question.syllabusRef} />
      </div>
      <pre className="mt-2 scrollbar-thin overflow-x-auto whitespace-pre-wrap font-sans text-sm text-text-muted">{question.prompt}</pre>

      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="mt-3 flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        {revealed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {revealed ? 'Hide answer' : 'Reveal answer'}
      </button>

      {revealed && (
        <pre className="mt-3 scrollbar-thin overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-canvas p-3 font-mono text-xs text-text">
          {question.answer}
        </pre>
      )}

      {question.table && <SqlPlayground tableName={question.table} />}
    </div>
  )
}

export default function LibraryPage() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-text">Practice Library</h1>
        <p className="mt-1 text-sm text-text-muted">
          Practice programs mapped to the CAIE O Level Computer Science (2210) syllabus — "for examination in 2026, 2027 and
          2028". Each entry is tagged with the syllabus section it covers. Open one in the editor, or reveal the worked
          solution if you get stuck.
        </p>

        {topics.map((topic) => {
          const entries = curriculum.filter((e) => e.topic === topic)
          if (entries.length === 0) return null
          return (
            <section key={topic} className="mt-8">
              <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wide text-accent">{topic}</h2>
              <TopicOverview topic={topic} />
              <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          )
        })}

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-bold text-text">Paper 2 Reference Topics</h2>
          <p className="mt-1 text-sm text-text-muted">
            Databases (SQL) and Boolean logic are also examined on Paper 2, but they aren't pseudocode. SQL questions include
            a live query runner against a sample table; Boolean logic questions are worked reference examples.
          </p>

          {referenceTopics.map((topic) => (
            <section key={topic} className="mt-6">
              <h3 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wide text-accent">{topic}</h3>
              <TopicOverview topic={topic} />
              <div className="flex flex-col gap-3">
                {referenceQuestions[topic].map((q) => (
                  <ReferenceCard key={q.id} question={q} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
