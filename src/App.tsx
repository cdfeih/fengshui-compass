import { AppProvider, useAppState } from './context/AppContext'
import TabBar from './components/TabBar'
import CompassPage from './components/CompassPage'
import Analysis from './components/Analysis'
import Solution from './components/Solution'
import Wiki from './components/Wiki'
import OnboardingOverlay from './components/OnboardingOverlay'
import { ISSUES } from './data/issues'
import { WIKI_ARTICLES } from './data/wiki'
import './App.css'

const TABS = [
  { key: 'compass', label: '罗盘', icon: '🧭' },
  { key: 'analysis', label: '分析', icon: '📊' },
  { key: 'solution', label: '化解', icon: '🔧' },
  { key: 'wiki', label: '百科', icon: '📚' },
]

function AppInner() {
  const { activeTab, setActiveTab } = useAppState()

  return (
    <div className="app">
      <header className="app-header">
        <h1>风水罗盘</h1>
        <span className="app-subtitle">家居指南 · 大白话解读</span>
      </header>

      <main className="app-main">
        {activeTab === 'compass' && <CompassPage />}
        {activeTab === 'analysis' && <Analysis />}
        {activeTab === 'solution' && <Solution issues={ISSUES} />}
        {activeTab === 'wiki' && <Wiki articles={WIKI_ARTICLES} />}
      </main>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <OnboardingOverlay />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
