import { TabProvider } from './context/TabContext'
import { Header } from './components/Header'
import { TabOverview } from './components/TabOverview'
import { SettingsPanel } from './components/SettingsPanel'
import { useTabContext } from './context/TabContext'

function AppContent() {
  const { showSettings } = useTabContext()

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e]">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {showSettings ? <SettingsPanel /> : <TabOverview />}
      </div>
    </div>
  )
}

export function App() {
  return (
    <TabProvider>
      <AppContent />
    </TabProvider>
  )
}
