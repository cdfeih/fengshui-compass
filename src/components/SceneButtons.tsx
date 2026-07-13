
import type { SceneType } from '../utils/fengshui'

interface SceneButtonsProps {
  activeScene: SceneType
  onSceneChange: (scene: SceneType) => void
}

const SCENES: { type: SceneType; label: string; icon: string }[] = [
  { type: 'general', label: '测朝向', icon: '🧭' },
  { type: 'door', label: '测大门', icon: '🚪' },
  { type: 'bed', label: '测床向', icon: '🛏️' },
  { type: 'stove', label: '测灶台', icon: '🍳' },
  { type: 'balcony', label: '测阳台', icon: '🌿' },
]

export default function SceneButtons({ activeScene, onSceneChange }: SceneButtonsProps) {
  return (
    <div className="scene-buttons">
      {SCENES.map(s => (
        <button
          key={s.type}
          className={`scene-btn ${activeScene === s.type ? 'active' : ''}`}
          onClick={() => onSceneChange(s.type)}
        >
          <span className="scene-icon">{s.icon}</span>
          <span className="scene-label">{s.label}</span>
        </button>
      ))}
    </div>
  )
}
