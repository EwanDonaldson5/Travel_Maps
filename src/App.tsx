import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import MapView from './pages/MapView'
import Journal from './pages/Journal'
import JournalEntry from './pages/JournalEntry'
import Guides from './pages/Guides'
import GuideDetail from './pages/GuideDetail'
import Settings from './pages/Settings'
import { useAppStore } from './stores/appStore'
import { initDatabase } from './lib/db'

function App() {
  const setOnline = useAppStore((state) => state.setOnline)
  const setDbReady = useAppStore((state) => state.setDbReady)

  useEffect(() => {
    // Initialize IndexedDB
    initDatabase().then(() => {
      setDbReady(true)
    })

    // Track online/offline status
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline, setDbReady])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MapView />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:id" element={<JournalEntry />} />
        <Route path="guides" element={<Guides />} />
        <Route path="guides/:id" element={<GuideDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
