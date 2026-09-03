import { useCodeMirror } from '../../editor/useCodeMirror'
import type { Mode } from '../../app/store/modeStore'

interface PseudocodeEditorProps {
  value: string
  mode: Mode
  onChange: (value: string) => void
}

export default function PseudocodeEditor({ value, mode, onChange }: PseudocodeEditorProps) {
  const containerRef = useCodeMirror({ value, mode, onChange })
  return <div ref={containerRef} className="h-full w-full overflow-hidden" />
}
