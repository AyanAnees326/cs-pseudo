import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopBar from './components/layout/TopBar'
import AppShell from './components/layout/AppShell'
import LibraryPage from './components/library/LibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
        <TopBar />
        <Routes>
          <Route path="/" element={<AppShell />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
