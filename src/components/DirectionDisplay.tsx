
import type { Direction } from '../data/directions'
import { formatDegree } from '../utils/compass'

interface DirectionDisplayProps {
  direction: Direction | null
  degree: number
  sceneLabel: string
  ratingText: string
  isActive: boolean
}

export default function DirectionDisplay({
  direction,
  degree,
  sceneLabel,
  ratingText,
  isActive,
}: DirectionDisplayProps) {
  if (!direction || !isActive) {
    return (
      <div className="direction-display inactive">
        <div className="direction-value">—</div>
        <div className="direction-label">等待校准...</div>
      </div>
    )
  }

  const ratingColors: Record<string, string> = {
    '大吉': '#C41E3A',
    '吉': '#D4A84B',
    '一般': '#8B6914',
    '需注意': '#666',
  }

  const ratingColor = Object.keys(ratingColors).find(k => ratingText.includes(k))
    ? ratingColors[Object.keys(ratingColors).find(k => ratingText.includes(k))!]
    : '#8B6914'

  return (
    <div className="direction-display active">
      <div className="direction-value" style={{ color: ratingColor }}>
        {direction.fullName}
      </div>
      <div className="direction-name">{direction.name}山</div>
      <div className="direction-degree">{formatDegree(degree)}</div>
      <div className="direction-meta">
        <span className="meta-tag">{direction.element}行</span>
        <span className="meta-tag">{direction.trigramFull}</span>
      </div>
      <div className="direction-rating" style={{ color: ratingColor }}>
        {ratingText}
      </div>
      <div className="direction-scene">{sceneLabel}</div>
    </div>
  )
}
