import { useState } from 'react'
import type { SceneType } from '../utils/fengshui'

interface SceneButtonsProps {
  activeScene: SceneType
  onSceneChange: (scene: SceneType) => void
  lockedScenes?: Set<SceneType>
}

const SCENES: { type: SceneType; label: string; icon: string; guide: string }[] = [
  {
    type: 'door', label: '测大门', icon: '🚪',
    guide: '站在入户门内侧（屋里那侧），手机竖起来朝门外方向，屏幕朝向你自己',
  },
  {
    type: 'entrance', label: '测门厅', icon: '🏠',
    guide: '站在入户门内侧，面朝屋内方向（进门后面对的方向），手机指向室内',
  },
  {
    type: 'bed', label: '测床向', icon: '🛏️',
    guide: '躺在床上正常位置，手机放在枕头旁屏幕朝上，指向床头方向',
  },
  {
    type: 'stove', label: '测灶台', icon: '🍳',
    guide: '站在灶台前方（你平时做饭站的位置），手机朝向灶台正面',
  },
  {
    type: 'mingtang', label: '测明堂', icon: '🌿',
    guide: '站在客厅中央或阳台上，面朝窗外方向，手机指向外面',
  },
]

export default function SceneButtons({ activeScene, onSceneChange, lockedScenes = new Set() }: SceneButtonsProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  return (
    <div className="scene-buttons">
      {SCENES.map(s => {
        const isLocked = lockedScenes.has(s.type)
        return (
          <div key={s.type} className="scene-btn-wrapper">
            <button
              className={`scene-btn ${activeScene === s.type ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => {
                onSceneChange(s.type)
                setShowTooltip(null)
              }}
              onMouseEnter={() => setShowTooltip(s.type)}
              onMouseLeave={() => setShowTooltip(null)}
              onTouchStart={() => {
                if (showTooltip === s.type) {
                  onSceneChange(s.type)
                  setShowTooltip(null)
                } else {
                  setShowTooltip(s.type)
                }
              }}
            >
              <span className="scene-icon">{s.icon}</span>
              <span className="scene-label">{s.label}</span>
              {isLocked && <span className="scene-locked-badge">✅</span>}
              {!isLocked && <span className="scene-info-icon">ⓘ</span>}
            </button>

            {showTooltip === s.type && (
              <div className="scene-tooltip">
                <div className="tooltip-arrow" />
                <div className="tooltip-content">
                  <strong>{s.label}怎么测：</strong>
                  <p>{s.guide}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
