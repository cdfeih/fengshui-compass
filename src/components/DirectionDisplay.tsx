import type { Direction } from '../data/directions'
import { formatDegree } from '../utils/compass'

interface DirectionDisplayProps {
  direction: Direction | null
  degree: number
  sceneLabel: string
  ratingText: string
  rating: string
  plainSummary: string
  isActive: boolean
}

export default function DirectionDisplay({
  direction,
  degree,
  sceneLabel,
  rating,
  plainSummary,
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
    excellent: '#C41E3A',
    good: '#D4A84B',
    fair: '#8B6914',
    poor: '#666',
  }

  const ratingPlain: Record<string, string> = {
    excellent: '非常好',
    good: '还不错',
    fair: '一般般',
    poor: '不太好',
  }

  const color = ratingColors[rating] || '#8B6914'

  return (
    <div className="direction-display active">
      {/* 大白话主展示区 */}
      <div className="direction-plain">
        <div className="direction-value" style={{ color }}>
          {direction.fullName}
        </div>
        <div className="direction-plain-label" style={{ color }}>
          {ratingPlain[rating]}！
        </div>
      </div>

      {/* 术语信息（次要位置，小字） */}
      <div className="direction-detail">
        <span className="detail-tag">{direction.name}山 · {direction.trigramFull} · {direction.element}行</span>
        <span className="direction-degree">{formatDegree(degree)}</span>
      </div>

      {/* 大白话一句话总结 */}
      <div className="direction-plain-summary" style={{ color }}>
        {plainSummary}
      </div>

      <div className="direction-scene">{sceneLabel}</div>
    </div>
  )
}
