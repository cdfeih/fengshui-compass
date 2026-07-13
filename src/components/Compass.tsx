import { useMemo } from 'react'
import { normalizeDegree } from '../utils/compass'

interface CompassFaceProps {
  degree: number
  size?: number
}

// 二十四山名称（圆形排列，从北开始顺时针）
const MOUNTAINS = [
  '子', '癸', '丑', '艮', '寅', '甲',
  '卯', '乙', '辰', '巽', '巳', '丙',
  '午', '丁', '未', '坤', '申', '庚',
  '酉', '辛', '戌', '乾', '亥', '壬',
]

// 大方向标签
const MAIN_DIRS = [
  { label: '北', angle: 0 },
  { label: '东', angle: 90 },
  { label: '南', angle: 180 },
  { label: '西', angle: 270 },
]

// 八卦符号
const TRIGRAMS = [
  { label: '☵', angle: 0 },    // 坎-北
  { label: '☶', angle: 45 },   // 艮-东北
  { label: '☳', angle: 90 },   // 震-东
  { label: '☴', angle: 135 },  // 巽-东南
  { label: '☲', angle: 180 },  // 离-南
  { label: '☷', angle: 225 },  // 坤-西南
  { label: '☱', angle: 270 },  // 兑-西
  { label: '☰', angle: 315 },  // 乾-西北
]

export default function CompassFace({ degree, size = 300 }: CompassFaceProps) {
  const center = size / 2
  const outerR = center - 4
  const middleR = outerR - 22
  const innerR = middleR - 28
  const scaleR = outerR + 6

  // 罗盘旋转角度（指针固定指北，盘面旋转）
  const rotation = -normalizeDegree(degree)

  // 生成刻度线
  const tickMarks = useMemo(() => {
    const ticks = []
    // 每5度一个小刻度
    for (let i = 0; i < 360; i += 5) {
      const angle = (i * Math.PI) / 180
      const isMain = i % 15 === 0
      const isMajor = i % 45 === 0
      const innerX = center + (isMajor ? innerR + 2 : isMain ? innerR + 6 : innerR + 10) * Math.sin(angle)
      const innerY = center - (isMajor ? innerR + 2 : isMain ? innerR + 6 : innerR + 10) * Math.cos(angle)
      const outerX = center + scaleR * Math.sin(angle)
      const outerY = center - scaleR * Math.cos(angle)
      ticks.push(
        <line
          key={i}
          x1={innerX} y1={innerY}
          x2={outerX} y2={outerY}
          stroke={isMajor ? '#C41E3A' : isMain ? '#8B6914' : '#999'}
          strokeWidth={isMajor ? 2 : isMain ? 1.5 : 0.5}
        />
      )
    }
    return ticks
  }, [center, innerR, scaleR])

  return (
    <div className="compass-face" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 外圈 */}
        <circle cx={center} cy={center} r={outerR} fill="#1a1a2e" stroke="#8B6914" strokeWidth="3" />
        <circle cx={center} cy={center} r={outerR - 3} fill="none" stroke="#D4A84B" strokeWidth="0.5" />

        {/* 可旋转的内盘 */}
        <g transform={`rotate(${rotation}, ${center}, ${center})`}>
          {/* 八卦底色 */}
          {TRIGRAMS.map((t, i) => {
            const startAngle = t.angle - 22.5
            const endAngle = t.angle + 22.5
            const isLight = i % 2 === 0
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const x1 = center + middleR * Math.sin(startRad)
            const y1 = center - middleR * Math.cos(startRad)
            const x2 = center + middleR * Math.sin(endRad)
            const y2 = center - middleR * Math.cos(endRad)
            return (
              <path
                key={`sector-${i}`}
                d={`M${center},${center} L${x1},${y1} A${middleR},${middleR} 0 0,1 ${x2},${y2} Z`}
                fill={isLight ? '#2a2a4e' : '#222240'}
                opacity={0.6}
              />
            )
          })}

          {/* 中间圈 */}
          <circle cx={center} cy={center} r={middleR} fill="none" stroke="#D4A84B" strokeWidth="1" />
          <circle cx={center} cy={center} r={innerR} fill="none" stroke="#8B6914" strokeWidth="1" />

          {/* 二十四山标签 */}
          {MOUNTAINS.map((name, i) => {
            const angle = (i * 15) * Math.PI / 180
            const x = center + (middleR - 11) * Math.sin(angle)
            const y = center - (middleR - 11) * Math.cos(angle)
            const isMain = i % 6 === 0
            return (
              <text
                key={name}
                x={x} y={y}
                fill={isMain ? '#D4A84B' : '#ccc'}
                fontSize={isMain ? 12 : 9}
                fontWeight={isMain ? 'bold' : 'normal'}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${i * 15}, ${x}, ${y})`}
                style={{ fontFamily: 'serif' }}
              >
                {name}
              </text>
            )
          })}

          {/* 大方向标签 */}
          {MAIN_DIRS.map(d => {
            const angle = (d.angle * Math.PI) / 180
            const x = center + (innerR - 6) * Math.sin(angle)
            const y = center - (innerR - 6) * Math.cos(angle)
            return (
              <text
                key={d.label}
                x={x} y={y}
                fill="#D4A84B"
                fontSize={16}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'serif' }}
              >
                {d.label}
              </text>
            )
          })}

          {/* 八卦符号 */}
          {TRIGRAMS.map(t => {
            const angle = (t.angle * Math.PI) / 180
            const x = center + (middleR + 14) * Math.sin(angle)
            const y = center - (middleR + 14) * Math.cos(angle)
            return (
              <text
                key={`trigram-${t.angle}`}
                x={x} y={y}
                fill="#C41E3A"
                fontSize={20}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'serif' }}
              >
                {t.label}
              </text>
            )
          })}

          {/* 刻度线 */}
          {tickMarks}
        </g>

        {/* 内圈（不旋转） */}
        <circle cx={center} cy={center} r={innerR - 10} fill="#1a1a2e" stroke="#D4A84B" strokeWidth="1.5" />
        <circle cx={center} cy={center} r={innerR - 20} fill="none" stroke="#8B6914" strokeWidth="0.5" />

        {/* 十字线 */}
        <line x1={center} y1={center - innerR + 12} x2={center} y2={center + innerR - 12} stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />
        <line x1={center - innerR + 12} y1={center} x2={center + innerR - 12} y2={center} stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />

        {/* 指针（固定朝上=北） */}
        <polygon
          points={`${center},${center - innerR + 22} ${center - 8},${center + 5} ${center},${center - 2} ${center + 8},${center + 5}`}
          fill="#C41E3A"
        />
        <polygon
          points={`${center},${center + innerR - 22} ${center - 8},${center - 5} ${center},${center + 2} ${center + 8},${center - 5}`}
          fill="#666"
        />
        <circle cx={center} cy={center} r={5} fill="#D4A84B" />

        {/* 方位高亮指示 */}
        <text
          x={center} y={center - innerR + 35}
          fill="#C41E3A"
          fontSize={11}
          fontWeight="bold"
          textAnchor="middle"
        >N</text>
        <text
          x={center} y={center + innerR - 28}
          fill="#999"
          fontSize={11}
          textAnchor="middle"
        >S</text>
      </svg>
    </div>
  )
}
