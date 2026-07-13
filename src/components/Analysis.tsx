import { useState, useMemo } from 'react'

interface HouseInfo {
  floor: number
  totalFloors: number
  direction: string
  layout: string
  balcony: string
  kitchen: string
  masterBedroom: string
}

const DIRECTIONS = ['正南', '南偏东', '南偏西', '正东', '东南', '正北', '东北', '正西', '西南', '西北']
const LAYOUTS = ['方正', '略缺角', 'L型', '长条形', '不规则']
const BALCONY_OPTIONS = ['单阳台', '双阳台', '无阳台']
const KITCHEN_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北', '中间']
const BEDROOM_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北']

interface AnalysisResult {
  totalScore: number
  items: { name: string; score: number; maxScore: number; comment: string }[]
  summary: string
  recommendations: string[]
  warnings: string[]
}

export default function Analysis() {
  const [info, setInfo] = useState<HouseInfo>({
    floor: 7,
    totalFloors: 32,
    direction: '正南',
    layout: '方正',
    balcony: '双阳台',
    kitchen: '北',
    masterBedroom: '东南',
  })

  const [showResult, setShowResult] = useState(false)

  const updateField = (field: keyof HouseInfo, value: string | number) => {
    setInfo(prev => ({ ...prev, [field]: value }))
  }

  const analysis = useMemo((): AnalysisResult => {
    const items: AnalysisResult['items'] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    // 1. 楼层评分
    let floorScore = 5
    let floorComment = ''
    const ratio = info.floor / info.totalFloors
    if (ratio <= 0.15) {
      floorScore = 3
      floorComment = '低楼层，可能潮湿或噪音较大'
      warnings.push('低楼层需注意防潮和隐私')
    } else if (ratio <= 0.35) {
      floorScore = 5
      floorComment = '中低层，接地气不潮湿，理想高度'
    } else if (ratio <= 0.65) {
      floorScore = 4
      floorComment = '中高层，视野好但略高'
    } else if (ratio < 1) {
      floorScore = 3
      floorComment = '高层，气场易散'
      recommendations.push('高层可多养绿植增加"地气"')
    } else {
      floorScore = 1
      floorComment = '顶层，孤高煞，阳气过盛'
      warnings.push('顶层需注意隔热和漏水问题')
    }
    items.push({ name: '楼层高度', score: floorScore, maxScore: 5, comment: floorComment })

    // 2. 朝向评分
    let dirScore = 5
    let dirComment = ''
    if (info.direction.includes('南') && !info.direction.includes('西')) {
      dirScore = 5
      dirComment = '朝南是最佳朝向，采光充足，冬暖夏凉'
    } else if (info.direction.includes('东')) {
      dirScore = 4
      dirComment = '朝东紫气东来，利健康和生机'
    } else if (info.direction.includes('东南')) {
      dirScore = 5
      dirComment = '东南朝向，财位+文昌，利财运和学业'
    } else if (info.direction.includes('南') && info.direction.includes('西')) {
      dirScore = 3
      dirComment = '西南朝向，午后西晒较严重'
    } else if (info.direction.includes('西')) {
      dirScore = 2
      dirComment = '西向有西晒问题，夏季炎热'
      warnings.push('西向需做好遮阳措施')
    } else if (info.direction.includes('北')) {
      dirScore = 3
      dirComment = '北向采光较弱，但夏季凉爽'
    } else {
      dirScore = 3
      dirComment = '朝向一般，注意采光和通风'
    }
    items.push({ name: '房屋朝向', score: dirScore, maxScore: 5, comment: dirComment })

    // 3. 户型评分
    let layoutScore = 5
    let layoutComment = ''
    switch (info.layout) {
      case '方正':
        layoutScore = 5
        layoutComment = '方正户型，八卦齐全，气场稳定'
        break
      case '略缺角':
        layoutScore = 3
        layoutComment = '略有缺角，需注意补角化解'
        warnings.push('缺角户型需在缺角位置放对应五行物品补角')
        break
      case 'L型':
        layoutScore = 2
        layoutComment = 'L型户型，气场不稳定'
        warnings.push('L型户型建议用屏风或柜子分隔')
        break
      case '长条形':
        layoutScore = 2
        layoutComment = '长条形户型，中间区域采光可能不足'
        recommendations.push('长条形户型中间区域需加强灯光')
        break
      default:
        layoutScore = 2
        layoutComment = '不规则户型，需专业风水师现场勘测'
        warnings.push('不规则户型风水隐患较多')
    }
    items.push({ name: '户型格局', score: layoutScore, maxScore: 5, comment: layoutComment })

    // 4. 阳台评分
    let balconyScore = 5
    let balconyComment = ''
    switch (info.balcony) {
      case '双阳台':
        balconyScore = 5
        balconyComment = '双阳台南北通透，气场活而不散'
        break
      case '单阳台':
        balconyScore = 3
        balconyComment = '单阳台纳气口偏少，需保持明亮整洁'
        break
      case '无阳台':
        balconyScore = 1
        balconyComment = '无阳台缺乏纳气口，需多开窗通风'
        warnings.push('无阳台需勤开窗通风，室内放绿植补气')
        break
    }
    items.push({ name: '阳台格局', score: balconyScore, maxScore: 5, comment: balconyComment })

    // 5. 厨房位置
    let kitchenScore = 5
    let kitchenComment = ''
    const kitchenPos = info.kitchen
    if (['东', '东南'].includes(kitchenPos)) {
      kitchenScore = 5
      kitchenComment = '厨房在东/东南，木火相生，大吉'
    } else if (kitchenPos === '南') {
      kitchenScore = 3
      kitchenComment = '厨房在南，火气过旺，需注意通风'
    } else if (['西南', '东北'].includes(kitchenPos)) {
      kitchenScore = 4
      kitchenComment = '厨房在土位，土助火势，较佳'
    } else if (['西', '西北'].includes(kitchenPos)) {
      kitchenScore = 1
      kitchenComment = '厨房在西/西北，火克金，大忌'
      warnings.push('厨房在西/西北严重影响男主人运，建议用白色/金属色调和')
    } else if (kitchenPos === '北') {
      kitchenScore = 2
      kitchenComment = '厨房在北，水火相冲，需木色调和'
      recommendations.push('厨房在北建议多用木色/绿色装饰调和')
    } else if (kitchenPos === '中间') {
      kitchenScore = 1
      kitchenComment = '厨房在中宫，火烧中宫，大忌'
      warnings.push('厨房在中宫严重影响全家运势')
    }
    items.push({ name: '厨房位置', score: kitchenScore, maxScore: 5, comment: kitchenComment })

    // 6. 主卧位置
    let bedroomScore = 5
    let bedroomComment = ''
    const bedPos = info.masterBedroom
    if (['东南', '西南', '西北'].includes(bedPos)) {
      bedroomScore = 5
      bedroomComment = '主卧在吉位，利财运/婚姻/权威'
    } else if (['东', '南', '东北'].includes(bedPos)) {
      bedroomScore = 4
      bedroomComment = '主卧位置较佳，利健康/事业/子孙'
    } else if (['北'].includes(bedPos)) {
      bedroomScore = 3
      bedroomComment = '主卧在北，偏阴，需保持温暖明亮'
      recommendations.push('北面主卧需注意保暖和增加照明')
    } else {
      bedroomScore = 3
      bedroomComment = '主卧位置一般'
    }
    items.push({ name: '主卧位置', score: bedroomScore, maxScore: 5, comment: bedroomComment })

    // 总分
    const totalScore = Math.round(
      (items.reduce((sum, i) => sum + i.score / i.maxScore, 0) / items.length) * 100
    )

    // 总结
    let summary = ''
    if (totalScore >= 85) summary = '这套房子风水上佳，核心要素齐全，居住舒适度高，财运事业运旺。'
    else if (totalScore >= 70) summary = '这套房子风水良好，大部分要素合理，少数细节需要注意。'
    else if (totalScore >= 55) summary = '这套房子风水中等，有一些需要注意和化解的地方。'
    else summary = '这套房子风水存在较多问题，建议请专业风水师现场勘测。'

    return { totalScore, items, summary, recommendations, warnings }
  }, [info])

  const scoreColor = analysis.totalScore >= 85 ? '#C41E3A' : analysis.totalScore >= 70 ? '#D4A84B' : analysis.totalScore >= 55 ? '#8B6914' : '#666'

  return (
    <div className="page analysis-page">
      <h2>户型风水分析</h2>
      <p className="page-desc">输入您房子的基本信息，获取风水评分和建议</p>

      <div className="form-group">
        <label>楼层</label>
        <div className="input-row">
          <input
            type="number"
            min={1}
            max={100}
            value={info.floor}
            onChange={e => updateField('floor', Number(e.target.value))}
          />
          <span className="input-sep">/</span>
          <input
            type="number"
            min={1}
            max={100}
            value={info.totalFloors}
            onChange={e => updateField('totalFloors', Number(e.target.value))}
          />
          <span className="input-suffix">层</span>
        </div>
      </div>

      <div className="form-group">
        <label>主朝向</label>
        <select value={info.direction} onChange={e => updateField('direction', e.target.value)}>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>户型格局</label>
        <select value={info.layout} onChange={e => updateField('layout', e.target.value)}>
          {LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>阳台</label>
        <select value={info.balcony} onChange={e => updateField('balcony', e.target.value)}>
          {BALCONY_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>厨房位置</label>
        <select value={info.kitchen} onChange={e => updateField('kitchen', e.target.value)}>
          {KITCHEN_OPTIONS.map(k => <option key={k} value={k}>{k}面</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>主卧位置</label>
        <select value={info.masterBedroom} onChange={e => updateField('masterBedroom', e.target.value)}>
          {BEDROOM_OPTIONS.map(b => <option key={b} value={b}>{b}角</option>)}
        </select>
      </div>

      <button className="btn-primary btn-analyze" onClick={() => setShowResult(true)}>
        开始分析
      </button>

      {showResult && (
        <div className="analysis-result">
          {/* 总评分 */}
          <div className="total-score" style={{ borderColor: scoreColor }}>
            <div className="score-number" style={{ color: scoreColor }}>{analysis.totalScore}</div>
            <div className="score-label">风水评分 / 100</div>
            <div className="score-bar-bg">
              <div
                className="score-bar-fill"
                style={{ width: `${analysis.totalScore}%`, backgroundColor: scoreColor }}
              />
            </div>
          </div>

          <p className="analysis-summary">{analysis.summary}</p>

          {/* 各维度评分 */}
          <div className="score-items">
            {analysis.items.map((item, i) => (
              <div key={i} className="score-item">
                <div className="score-item-header">
                  <span className="score-item-name">{item.name}</span>
                  <span className="score-item-stars">
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} style={{ opacity: j < item.score ? 1 : 0.2 }}>
                        {j < item.score ? '⭐' : '☆'}
                      </span>
                    ))}
                  </span>
                </div>
                <p className="score-item-comment">{item.comment}</p>
              </div>
            ))}
          </div>

          {/* 警告 */}
          {analysis.warnings.length > 0 && (
            <div className="analysis-warnings">
              <h4>⚠️ 需注意</h4>
              <ul>
                {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {/* 建议 */}
          {analysis.recommendations.length > 0 && (
            <div className="analysis-recommendations">
              <h4>💡 改善建议</h4>
              <ul>
                {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
