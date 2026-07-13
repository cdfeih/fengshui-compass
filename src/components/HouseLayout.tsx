import { useState, useMemo } from 'react'
import { useAppState } from '../context/AppContext'
import { findDirection } from '../data/directions'

// 度数 → 方位名映射（用于罗盘提示）
function degreeToDirectionName(degree: number): string {
  if (degree >= 157.5 && degree < 202.5) return '南'
  if (degree >= 112.5 && degree < 157.5) return '东南'
  if (degree >= 67.5 && degree < 112.5) return '东'
  if (degree >= 22.5 && degree < 67.5) return '东北'
  if (degree >= 0 && degree < 22.5 || degree >= 337.5) return '北'
  if (degree >= 292.5 && degree < 337.5) return '西北'
  if (degree >= 247.5 && degree < 292.5) return '西'
  if (degree >= 202.5 && degree < 247.5) return '西南'
  return '北'
}

// 罗盘场景 → 房间建议映射
// "测明堂朝南" = 客厅窗户朝南 → 客厅在南面
// "测灶台朝南" = 灶台朝南 → 厨房大概率在南面（灶台面向的方向就是灶台所在方位）
// 注意：这只是建议，不强制自动填充，因为朝向和位置不完全等同

// 房间类型定义
const ROOM_TYPES = [
  { key: 'kitchen', label: '厨房', color: '#FF6B35', icon: '🍳' },
  { key: 'masterBedroom', label: '主卧', color: '#6C5CE7', icon: '🛏️' },
  { key: 'livingRoom', label: '客厅', color: '#2E7D32', icon: '📺' },
  { key: 'bathroom', label: '卫生间', color: '#A8A8A8', icon: '🚿' },
  { key: 'clear', label: '清除', color: '#999', icon: '✕' },
] as const

const GRID_POSITIONS = [
  { label: '西南', sub: '坤·母', dirKey: '西南', x: 0, y: 0 },
  { label: '正西', sub: '兑·女', dirKey: '西', x: 1, y: 0 },
  { label: '西北', sub: '乾·父', dirKey: '西北', x: 2, y: 0 },
  { label: '正南', sub: '离·火', dirKey: '南', x: 0, y: 1 },
  { label: '中宫', sub: '中心', dirKey: '中间', x: 1, y: 1 },
  { label: '正北', sub: '坎·水', dirKey: '北', x: 2, y: 1 },
  { label: '东南', sub: '巽·财', dirKey: '东南', x: 0, y: 2 },
  { label: '正东', sub: '震·健', dirKey: '东', x: 1, y: 2 },
  { label: '东北', sub: '艮·学', dirKey: '东北', x: 2, y: 2 },
]

// 房间 key → HouseInfo 字段映射
const ROOM_TO_FIELD: Record<string, string> = {
  kitchen: 'kitchen',
  masterBedroom: 'masterBedroom',
  livingRoom: 'livingRoom',
  bathroom: 'bathroom',
}

// 中宫不允许放：主卧（没有"中间"选项）
const ROOM_BLACKLIST_PER_CELL: Record<string, string[]> = {
  '中宫': ['masterBedroom'], // 主卧只能8方位，不能居中
}

export default function HouseLayout() {
  const { houseInfo, setHouseInfo, measurements } = useAppState()
  const [activeCell, setActiveCell] = useState<string | null>(null)

  // 🔔 罗盘数据 → 九宫格提示
  const compassHints = useMemo(() => {
    const hints: Record<string, string[]> = {}  // dirKey → 提示文字数组

    // 明堂朝向 → 客厅可能在这个方向
    if (measurements.mingtangDegree !== null) {
      const dirName = degreeToDirectionName(measurements.mingtangDegree)
      if (!hints[dirName]) hints[dirName] = []
      hints[dirName].push(`🌿 明堂朝${dirName} → 客厅/阳台窗可能在这面`)
    }

    // 灶台朝向 → 厨房可能在这个方向
    if (measurements.stoveDegree !== null) {
      const dirName = degreeToDirectionName(measurements.stoveDegree)
      if (!hints[dirName]) hints[dirName] = []
      hints[dirName].push(`🍳 灶台朝${dirName} → 厨房可能在这面`)
    }

    // 大门朝向 → 入户门在这面墙上
    if (measurements.doorDegree !== null) {
      const dirName = degreeToDirectionName(measurements.doorDegree)
      if (!hints[dirName]) hints[dirName] = []
      hints[dirName].push(`🚪 大门朝${dirName} → 门在这面墙上`)
    }

    // 门厅朝向 → 入户门在这面墙上（补充）
    if (measurements.entranceDegree !== null) {
      const dirName = degreeToDirectionName(measurements.entranceDegree)
      // 门厅和门朝向是同一面墙的两侧，门朝外=门厅朝内，门厅在门对面
      // 但实际入户门还是在门测出的那面墙上，所以门厅提示只是"进门后的方向"
    }

    return hints
  }, [measurements.mingtangDegree, measurements.stoveDegree, measurements.doorDegree, measurements.entranceDegree])

  // 有罗盘提示的格子
  const hasAnyHints = Object.keys(compassHints).length > 0

  // 方位名 → 房间反向映射
  const getRoomInCell = (dirKey: string): { key: string; label: string; color: string; icon: string } | null => {
    const fields = [
      { key: 'kitchen', value: houseInfo.kitchen },
      { key: 'masterBedroom', value: houseInfo.masterBedroom },
      { key: 'livingRoom', value: houseInfo.livingRoom },
      { key: 'bathroom', value: houseInfo.bathroom },
    ]
    for (const f of fields) {
      if (f.value === dirKey) {
        const roomDef = ROOM_TYPES.find(r => r.key === f.key)
        if (roomDef) return { key: f.key, label: roomDef.label, color: roomDef.color, icon: roomDef.icon }
      }
    }
    return null
  }

  // 判断每个格子是否有风水问题
  const getCellWarning = (dirKey: string): string | null => {
    const roomInCell = getRoomInCell(dirKey)
    if (!roomInCell) return null

    if (roomInCell.key === 'kitchen') {
      if (dirKey === '西北') return '🔥 火烧天门'
      if (dirKey === '西') return '厨房不佳'
      if (dirKey === '北') return '厨房水火冲'
      if (dirKey === '中间') return '🔥 火烧中宫'
    }
    if (roomInCell.key === 'bathroom') {
      if (dirKey === '中间') return '🚽 中宫受污'
      if (dirKey === '西北') return '🚽 压乾位'
      if (dirKey === '西南') return '🚽 压坤位'
    }
    return null
  }

  // 点击格子放置房间
  const handleCellClick = (dirKey: string) => {
    setActiveCell(activeCell === dirKey ? null : dirKey)
  }

  // 选择房间类型
  const handleRoomSelect = (roomKey: string, dirKey: string) => {
    if (roomKey === 'clear') {
      // 清除这个格子的房间：找到当前占据的房间并重置
      const currentRoom = getRoomInCell(dirKey)
      if (currentRoom) {
        const field = ROOM_TO_FIELD[currentRoom.key]
        // 重置为默认值
        setHouseInfo({ [field]: '' })
      }
      setActiveCell(null)
      return
    }

    // 检查该房间是否已被限制在这个格子
    const blacklist = ROOM_BLACKLIST_PER_CELL[dirKey] || []
    if (blacklist.includes(roomKey)) {
      // 主卧不能放中宫，提示
      return
    }

    // 先检查这个房间之前是否在其他格子，需要清除旧位置
    const field = ROOM_TO_FIELD[roomKey]
    const oldValue = houseInfo[field as keyof typeof houseInfo]
    if (oldValue && oldValue !== dirKey) {
      // 房间从旧位置移走，旧位置变空
      // 不需要特别处理，因为移走后旧格子自然就没有了
    }

    // 如果这个格子已经有别的房间，先移走
    const currentRoom = getRoomInCell(dirKey)
    if (currentRoom && currentRoom.key !== roomKey) {
      const currentField = ROOM_TO_FIELD[currentRoom.key]
      setHouseInfo({ [currentField]: '' })
    }

    // 放置新房间
    setHouseInfo({ [field]: dirKey })
    setActiveCell(null)
  }

  // 统计已放置的房间数
  const placedRooms = [
    houseInfo.kitchen,
    houseInfo.masterBedroom,
    houseInfo.livingRoom,
    houseInfo.bathroom,
  ].filter(v => v !== '').length

  return (
    <div className="house-layout">
      <h4>🏠 家居方位图</h4>
      <p className="layout-desc">
        根据你的户型图，把厨房、卧室、客厅、卫生间分别放在哪个方位（{placedRooms}/4 已放置）
      </p>
      {hasAnyHints && (
        <p className="layout-compass-tip">
          🧭 罗盘已测出方向数据，格子里的蓝色标签是建议位置，仅供参考
        </p>
      )}
      {!hasAnyHints && placedRooms === 0 && (
        <p className="layout-compass-tip">
          💡 没有罗盘数据？也没关系，对照你家的户型图（买房时的平面图），看看每个房间在哪个方向
        </p>
      )}

      <div className="layout-grid">
        {GRID_POSITIONS.map(pos => {
          const roomInCell = getRoomInCell(pos.dirKey)
          const warning = getCellWarning(pos.dirKey)
          const isActive = activeCell === pos.dirKey
          const blacklist = ROOM_BLACKLIST_PER_CELL[pos.dirKey] || []

          return (
            <div key={`${pos.x}-${pos.y}`} className={`layout-cell ${warning ? 'cell-warning' : ''} ${isActive ? 'cell-active' : ''}`}
              onClick={() => handleCellClick(pos.dirKey)}>
              <div className="cell-label">{pos.label}</div>
              <div className="cell-sub">{pos.sub}</div>
              {roomInCell && (
                <div className="cell-room" style={{ backgroundColor: roomInCell.color }}>
                  {roomInCell.icon} {roomInCell.label}
                </div>
              )}
              {!roomInCell && !warning && compassHints[pos.dirKey] && (
                <div className="cell-compass-hint">
                  {compassHints[pos.dirKey].map((hint, i) => (
                    <div key={i}>{hint}</div>
                  ))}
                </div>
              )}
              {!roomInCell && !warning && !compassHints[pos.dirKey] && (
                <div className="cell-empty">点击放置</div>
              )}
              {warning && (
                <div className="cell-warning-text">{warning}</div>
              )}

              {/* 房间选择弹出 */}
              {isActive && (
                <div className="cell-selector">
                  {ROOM_TYPES.filter(r => r.key !== 'clear').filter(r => !blacklist.includes(r.key)).map(r => (
                    <button key={r.key}
                      className={`selector-btn ${roomInCell?.key === r.key ? 'selector-active' : ''}`}
                      style={{ borderColor: r.color }}
                      onClick={(e) => { e.stopPropagation(); handleRoomSelect(r.key, pos.dirKey) }}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                  {roomInCell && (
                    <button className="selector-btn selector-clear"
                      onClick={(e) => { e.stopPropagation(); handleRoomSelect('clear', pos.dirKey) }}>
                      ✕ 清除
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="layout-legend">
        {ROOM_TYPES.filter(r => r.key !== 'clear').map(r => (
          <span key={r.key} className="legend-item" style={{ backgroundColor: r.color }}>
            {r.icon} {r.label}
          </span>
        ))}
      </div>

      {placedRooms < 4 && (
        <div className="layout-hint">
          💡 对照你家户型图（买房平面图），看看厨房、卧室、客厅、卫生间分别在哪个方向，点格子放进去
        </div>
      )}
    </div>
  )
}
