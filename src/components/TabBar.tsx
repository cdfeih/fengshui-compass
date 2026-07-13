

interface TabBarProps {
  tabs: { key: string; label: string; icon: string }[]
  activeTab: string
  onTabChange: (key: string) => void
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
