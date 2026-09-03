import { useEffect, useRef, useState } from 'react'
import PseudocodeEditor from '../editor/PseudocodeEditor'
import QuestionPanel from '../editor/QuestionPanel'
import ConsoleView from '../terminal/ConsoleView'
import VfsDrawer from '../terminal/VfsDrawer'
import SplitPane from './SplitPane'
import MobilePaneSwitcher, { type MobilePane } from './MobilePaneSwitcher'
import { useFilesStore } from '../../app/store/filesStore'
import { useModeStore } from '../../app/store/modeStore'
import { useRunner } from '../../hooks/useRunner'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function AppShell() {
  const files = useFilesStore((s) => s.files)
  const activeFileId = useFilesStore((s) => s.activeFileId)
  const updateFileContent = useFilesStore((s) => s.updateFileContent)
  const unlinkQuestion = useFilesStore((s) => s.unlinkQuestion)
  const mode = useModeStore((s) => s.mode)
  const { status, entries } = useRunner()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [mobilePane, setMobilePane] = useState<MobilePane>('code')
  const [hasUnread, setHasUnread] = useState(false)
  const prevStatus = useRef(status)

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0]

  useEffect(() => {
    const started = prevStatus.current === 'idle' || prevStatus.current === 'finished' || prevStatus.current === 'stopped'
    if (status === 'running' && started) setMobilePane('console')
    if (status === 'awaiting-input') setMobilePane('console')
    prevStatus.current = status
  }, [status])

  useEffect(() => {
    if (mobilePane === 'code' && entries.length > 0) setHasUnread(true)
  }, [entries.length, mobilePane])

  function handlePaneChange(pane: MobilePane) {
    setMobilePane(pane)
    if (pane === 'console') setHasUnread(false)
  }

  const editorSlot = activeFile ? (
    <div className="flex h-full min-h-0 flex-col">
      {activeFile.questionId && (
        <QuestionPanel key={activeFile.id} questionId={activeFile.questionId} onDismiss={() => unlinkQuestion(activeFile.id)} />
      )}
      <div className="min-h-0 flex-1">
        <PseudocodeEditor
          key={activeFile.id}
          value={activeFile.content}
          mode={mode}
          onChange={(content) => updateFileContent(activeFile.id, content)}
        />
      </div>
    </div>
  ) : null

  const terminalSlot = (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ConsoleView />
      </div>
      <VfsDrawer />
    </div>
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isDesktop ? (
        <SplitPane editor={editorSlot} terminal={terminalSlot} />
      ) : (
        <MobilePaneSwitcher editor={editorSlot} terminal={terminalSlot} active={mobilePane} hasUnread={hasUnread} onChange={handlePaneChange} />
      )}
    </div>
  )
}
