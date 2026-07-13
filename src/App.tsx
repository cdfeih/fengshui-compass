import { useState } from 'react'
import TabBar from './components/TabBar'
import CompassPage from './components/CompassPage'
import Analysis from './components/Analysis'
import Solution from './components/Solution'
import Wiki from './components/Wiki'
import { ISSUES } from './data/issues'
import { WIKI_ARTICLES } from './data/wiki'
import './App.css'

const TABS = [
  { key: 'compass', label: '罗盘', icon: '🧭' },
  { key: 'analysis', label: '分析', icon: '📊' },
  { key: 'solution', label: '化解', icon: '🔧' },
  { key: 'wiki', label: '百科', icon: '📚' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('compass')

  return (
    <div className="app">
      <header className="app-header">
        <h1>风水罗盘</h1>
        <span className="app-subtitle">家居指南</span>
      </header>

      <main className="app-main">
        {activeTab === 'compass' && <CompassPage />}
        {activeTab === 'analysis' && <Analysis />}
        {activeTab === 'solution' && <Solution issues={ISSUES} />}
        {activeTab === 'wiki' && <Wiki articles={WIKI_ARTICLES} />}
      </main>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
