// 九宫格方位图 —— 直观展示各房间在哪个卦位
interface HouseInfo {
  kitchen: string
  masterBedroom: string
  bathroom: string
  livingRoom: string
  direction: string
  layout: string
  balcony: string
  doorPattern?: string
}

const GRID_POSITIONS = [
  { label: '西南', sub: '坤·母', x: 0, y: 0 },
  { label: '正西', sub: '兑·女', x: 1, y: 0 },
  { label: '西北', sub: '乾·父', x: 2, y: 0 },
  { label: '正南', sub: '离·火', x: 0, y: 1 },
  { label: '中宫', sub: '中心', x: 1, y: 1 },
  { label: '正北', sub: '坎·水', x: 2, y: 1 },
  { label: '东南', sub: '巽·财', x: 0, y: 2 },
  { label: '正东', sub: '震·健', x: 1, y: 2 },
  { label: '东北', sub: '艮·学', x: 2, y: 2 },
]

// 方位名 → 格子位置映射
const DIR_TO_POS: Record<string, { x: number; y: number }> = {
  '西南': { x: 0, y: 0 }, '正西': { x: 1, y: 0 }, '西北': { x: 2, y: 0 },
  '正南': { x: 0, y: 1 }, '中间': { x: 1, y: 1 }, '正北': { x: 2, y: 1 },
  '东南': { x: 0, y: 2 }, '正东': { x: 1, y: 2 }, '东北': { x: 2, y: 2 },
  '南': { x: 0, y: 1 }, '西': { x: 1, y: 0 }, '北': { x: 2, y: 1 },
  '东': { x: 1, y: 2 },
}

// 房间颜色和标签
const ROOM_COLORS: Record<string, string> = {
  kitchen: '#FF6B35',        // 厨房 - 橙色
  masterBedroom: '#6C5CE7',  // 主卧 - 紫色
  bathroom: '#A8A8A8',       // 卫生间 - 灰色
  livingRoom: '#2E7D32',     // 客厅 - 绿色
}

const ROOM_LABELS: Record<string, string> = {
  kitchen: '厨房',
  masterBedroom: '主卧',
  bathroom: '卫生间',
  livingRoom: '客厅',
}

export default function HouseLayout({ info }: { info: HouseInfo }) {
  // 计算各房间在哪个格子
  const rooms: { key: string; pos: { x: number; y: number } }[] = []
  if (DIR_TO_POS[info.kitchen]) rooms.push({ key: 'kitchen', pos: DIR_TO_POS[info.kitchen] })
  if (DIR_TO_POS[info.masterBedroom]) rooms.push({ key: 'masterBedroom', pos: DIR_TO_POS[info.masterBedroom] })
  if (DIR_TO_POS[info.bathroom]) rooms.push({ key: 'bathroom', pos: DIR_TO_POS[info.bathroom] })
  if (DIR_TO_POS[info.livingRoom]) rooms.push({ key: 'livingRoom', pos: DIR_TO_POS[info.livingRoom] })

  // 判断每个格子是否有风水问题
  const getCellWarning = (label: string): string | null => {
    const kitchenHere = rooms.find(r => r.key === 'kitchen' && DIR_TO_POS[label]?.x === r.pos.x && DIR_TO_POS[label]?.y === r.pos.y)
    const bathroomHere = rooms.find(r => r.key === 'bathroom' && DIR_TO_POS[label]?.x === r.pos.x && DIR_TO_POS[label]?.y === r.pos.y)

    // 厨房问题
    if (kitchenHere && label === '西北') return '🔥 火烧天门'
    if (kitchenHere && label === '正西') return '厨房在此不佳'
    if (kitchenHere && label === '正北') return '厨房水火冲'
    if (kitchenHere && label === '中宫') return '🔥 火烧中宫'

    // 卫生间问题
    if (bathroomHere && label === '中宫') return '🚽 中宫受污'
    if (bathroomHere && label === '西北') return '🚽 压乾位'
    if (bathroomHere && label === '西南') return '🚽 压坤位'

    return null
  }

  return (
    <div className="house-layout">
      <h4>🏠 家居方位图</h4>
      <p className="layout-desc">下面的图展示了你家各房间在哪个方位，红色标记表示需要注意的位置</p>
      <div className="layout-grid">
        {GRID_POSITIONS.map(pos => {
          const roomInCell = rooms.find(r => r.pos.x === pos.x && r.pos.y === pos.y)
          const warning = getCellWarning(pos.label)
          return (
            <div key={`${pos.x}-${pos.y}`} className={`layout-cell ${warning ? 'cell-warning' : ''}`}>
              <div className="cell-label">{pos.label}</div>
              <div className="cell-sub">{pos.sub}</div>
              {roomInCell && (
                <div className="cell-room" style={{ backgroundColor: ROOM_COLORS[roomInCell.key] }}>
                  {ROOM_LABELS[roomInCell.key]}
                </div>
              )}
              {warning && (
                <div className="cell-warning-text">{warning}</div>
              )}
            </div>
          )
        })}
      </div>
      <div className="layout-legend">
        <span className="legend-item" style={{ backgroundColor: ROOM_COLORS.kitchen }}>厨房</span>
        <span className="legend-item" style={{ backgroundColor: ROOM_COLORS.masterBedroom }}>主卧</span>
        <span className="legend-item" style={{ backgroundColor: ROOM_COLORS.livingRoom }}>客厅</span>
        <span className="legend-item" style={{ backgroundColor: ROOM_COLORS.bathroom }}>卫生间</span>
      </div>
    </div>
  )
}
