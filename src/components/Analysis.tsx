import { useState, useMemo } from 'react'
import { useAppState } from '../context/AppContext'
import HouseLayout from './HouseLayout'

interface HouseInfo {
  floor: number
  totalFloors: number
  direction: string
  layout: string
  balcony: string
  kitchen: string
  masterBedroom: string
  bathroom: string
  livingRoom: string
  doorPattern: string
}

const DIRECTIONS = ['正南', '南偏东', '南偏西', '正东', '东南', '正北', '东北', '正西', '西南', '西北']
const LAYOUTS = ['方正', '略缺角', 'L型', '长条形', '不规则']
const BALCONY_OPTIONS = ['单阳台', '双阳台', '无阳台']
const KITCHEN_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北', '中间']
const BEDROOM_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北']
const BATHROOM_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北', '中间']
const LIVING_ROOM_OPTIONS = ['东', '东南', '南', '西南', '西', '西北', '北', '东北', '中间']
const DOOR_PATTERN_OPTIONS = ['正常', '对电梯', '对楼梯', '对邻居门', '对阳台（穿堂）', '对厨房', '对厕所']

interface AnalysisResult {
  totalScore: number
  items: { name: string; score: number; maxScore: number; weight: number; comment: string; plainComment: string }[]
  summary: string
  plainSummary: string
  recommendations: string[]
  plainRecommendations: string[]
  warnings: string[]
  plainWarnings: string[]
}

export default function Analysis() {
  const { houseInfo, setHouseInfo, measurements, setActiveTab } = useAppState()
  const [showResult, setShowResult] = useState(false)

  // 从 Context 同步数据
  const info: HouseInfo = useMemo(() => {
    const base = { ...houseInfo }
    if (measurements.doorDegree !== null) {
      const degree = measurements.doorDegree
      if (degree >= 157.5 && degree < 202.5) base.direction = '正南'
      else if (degree >= 112.5 && degree < 157.5) base.direction = '东南'
      else if (degree >= 67.5 && degree < 112.5) base.direction = '正东'
      else if (degree >= 0 && degree < 22.5 || degree >= 337.5) base.direction = '正北'
      else if (degree >= 22.5 && degree < 67.5) base.direction = '东北'
      else if (degree >= 202.5 && degree < 247.5) base.direction = '西南'
      else if (degree >= 247.5 && degree < 292.5) base.direction = '正西'
      else if (degree >= 292.5 && degree < 337.5) base.direction = '西北'
    }
    return base
  }, [houseInfo, measurements.doorDegree])

  const updateField = (field: string, value: string | number) => {
    setHouseInfo({ [field]: value })
  }

  const analysis = useMemo((): AnalysisResult => {
    const items: AnalysisResult['items'] = []
    const warnings: string[] = []
    const plainWarnings: string[] = []
    const recommendations: string[] = []
    const plainRecommendations: string[] = []

    // 1. 朝向评分 (权重2.0)
    let dirScore = 5, dirComment = '', dirPlain = ''
    if (info.direction === '正南') {
      dirScore = 5; dirComment = '朝南最佳，采光充足冬暖夏凉'; dirPlain = '大门朝南，冬天暖和夏天不会太热，采光最好'
    } else if (info.direction === '东南') {
      dirScore = 5; dirComment = '东南朝向，财位+文昌'; dirPlain = '大门朝东南，既有财运又利学业，非常不错'
    } else if (info.direction === '正东' || info.direction === '南偏东') {
      dirScore = 4; dirComment = '朝东紫气东来，利健康'; dirPlain = '大门朝东，早上阳光好，对身体健康有帮助'
    } else if (info.direction === '南偏西' || info.direction === '西南') {
      dirScore = 3; dirComment = '西南有西晒'; dirPlain = '大门朝西南/南偏西，夏天下午会比较热，需要做好遮阳'
      warnings.push('西南/南偏西朝向需做好遮阳'); plainWarnings.push('下午太阳很晒，窗帘和遮阳要做好')
    } else if (info.direction === '正西') {
      dirScore = 2; dirComment = '西向有严重西晒'; dirPlain = '大门朝西，夏天下午很热很晒，不太理想'
      warnings.push('西向需做好遮阳措施'); plainWarnings.push('夏天西晒严重，窗帘一定要厚')
    } else if (info.direction === '正北' || info.direction === '北') {
      dirScore = 3; dirComment = '北向采光较弱'; dirPlain = '大门朝北，冬天会比较冷，采光不太好，但夏天凉快'
    } else if (info.direction === '东北') {
      dirScore = 3; dirComment = '东北朝向一般'; dirPlain = '大门朝东北，采光不算太好但也不差'
    } else if (info.direction === '西北') {
      dirScore = 3; dirComment = '西北朝向有西晒'; dirPlain = '大门朝西北，有西晒问题但也有一定采光'
    }
    items.push({ name: '房屋朝向', score: dirScore, maxScore: 5, weight: 2.0, comment: dirComment, plainComment: dirPlain })

    // 2. 户型评分 (权重1.5)
    let layoutScore = 5, layoutComment = '', layoutPlain = ''
    switch (info.layout) {
      case '方正':
        layoutScore = 5; layoutComment = '方正户型八卦齐全气场稳定'; layoutPlain = '户型方正最好，每个方位都完整，运势均衡'
        break
      case '略缺角':
        layoutScore = 3; layoutComment = '略有缺角需补角化解'; layoutPlain = '户型有缺角，少了某个方位会影响对应的运势，需要补角'
        warnings.push('缺角户型需在缺角位置放对应物品补角'); plainWarnings.push('缺角的地方放一些装饰物品来"补齐"')
        break
      case 'L型':
        layoutScore = 2; layoutComment = 'L型气场不稳定'; layoutPlain = 'L型户型某个方向太长太窄，气场不稳'
        warnings.push('L型户型建议用屏风或柜子分隔'); plainWarnings.push('L型户型可以用柜子或屏风把空间分隔开来')
        break
      case '长条形':
        layoutScore = 2; layoutComment = '长条形中间采光不足'; layoutPlain = '长条形户型中间可能比较暗，需要加强灯光'
        recommendations.push('长条形户型中间区域需加强灯光'); plainRecommendations.push('中间比较暗的地方多加几盏灯')
        break
      default:
        layoutScore = 2; layoutComment = '不规则户型需专业勘测'; layoutPlain = '户型不规则，问题比较多，最好请专业人士看看'
        warnings.push('不规则户型风水隐患较多'); plainWarnings.push('户型不规则，建议找专业人士来评估')
    }
    items.push({ name: '户型格局', score: layoutScore, maxScore: 5, weight: 1.5, comment: layoutComment, plainComment: layoutPlain })

    // 3. 厨房位置 (权重2.5)
    let kitchenScore = 3, kitchenComment = '', kitchenPlain = ''
    const kitchenPos = info.kitchen
    if (!kitchenPos) {
      kitchenComment = '请选择厨房位置'; kitchenPlain = '请在方位图或下拉框中选择厨房在哪个方位'
    } else if (['东', '东南'].includes(kitchenPos)) {
      kitchenScore = 5; kitchenComment = '厨房在东/东南，木火相生大吉'; kitchenPlain = '厨房在东边或东南边，位置非常好，做饭顺心，家人吃得香'
    } else if (kitchenPos === '南') {
      kitchenScore = 3; kitchenComment = '厨房在南火气过旺'; kitchenPlain = '厨房在南边，做饭时会比较热，注意通风'
    } else if (['西南', '东北'].includes(kitchenPos)) {
      kitchenScore = 4; kitchenComment = '厨房在土位较佳'; kitchenPlain = '厨房在西南或东北，位置还可以'
    } else if (kitchenPos === '西') {
      kitchenScore = 1; kitchenComment = '厨房在西火克金'; kitchenPlain = '厨房在西边不太好，会影响家人的运气'
      warnings.push('厨房在西需用白色/金属色调和'); plainWarnings.push('厨房在西边的话，装修多用白色或银色来调和')
    } else if (kitchenPos === '西北') {
      kitchenScore = 1; kitchenComment = '厨房在西北火烧天门大忌'; kitchenPlain = '厨房在西北边是大忌！会严重影响家里男主人的健康和事业'
      warnings.push('厨房在西北严重影响男主人运'); plainWarnings.push('厨房在西北是最差的位置，会严重影响家里男人的运气')
    } else if (kitchenPos === '北') {
      kitchenScore = 2; kitchenComment = '厨房在北水火相冲'; kitchenPlain = '厨房在北边不太好，水和火对着干，做饭不太顺心'
      recommendations.push('厨房在北建议多用木色/绿色装饰调和'); plainRecommendations.push('厨房在北边的话，多用绿色装饰来中和一下')
    } else if (kitchenPos === '中间') {
      kitchenScore = 1; kitchenComment = '厨房在中宫火烧中宫大忌'; kitchenPlain = '厨房在房子正中间是大忌！会影响全家人的健康'
      warnings.push('厨房在中宫严重影响全家运势'); plainWarnings.push('厨房在正中间是最差的位置，全家人的健康都会受影响')
    }
    items.push({ name: '厨房位置', score: kitchenScore, maxScore: 5, weight: 2.5, comment: kitchenComment, plainComment: kitchenPlain })

    // 4. 卫生间位置 (权重1.5)
    let bathroomScore = 3, bathroomComment = '', bathroomPlain = ''
    const bathroomPos = info.bathroom
    if (!bathroomPos) {
      bathroomComment = '请选择卫生间位置'; bathroomPlain = '请在方位图或下拉框中选择卫生间在哪个方位'
    } else if (bathroomPos === '中间') {
      bathroomScore = 1; bathroomComment = '卫生间居中污秽弥漫全屋'; bathroomPlain = '卫生间在房子正中间是大忌！脏气和湿气会弥漫整个家'
      warnings.push('卫生间居中严重影响全家健康'); plainWarnings.push('卫生间在正中间最差，脏气散到全屋，影响全家健康')
    } else if (bathroomPos === '西南') {
      bathroomScore = 2; bathroomComment = '卫生间压坤位影响女主人'; bathroomPlain = '卫生间在西南方向不太好，会影响家里女主人的健康'
      warnings.push('卫生间在西南影响女主人'); plainWarnings.push('卫生间在西南会影响家里女主人的运势和健康')
    } else if (bathroomPos === '西北') {
      bathroomScore = 2; bathroomComment = '卫生间压乾位影响男主人'; bathroomPlain = '卫生间在西北方向不太好，会影响家里男主人的运势'
      warnings.push('卫生间在西北影响男主人'); plainWarnings.push('卫生间在西北会影响家里男人的运气')
    } else if (['东', '东南'].includes(bathroomPos)) {
      bathroomScore = 3; bathroomComment = '卫生间在东/东南，需保持清洁'; bathroomPlain = '卫生间在东边或东南边，一般般，但一定要保持干净通风'
    } else {
      bathroomScore = 4; bathroomComment = '卫生间位置可接受'; bathroomPlain = '卫生间位置还可以，保持干净通风就行'
    }
    items.push({ name: '卫生间位置', score: bathroomScore, maxScore: 5, weight: 1.5, comment: bathroomComment, plainComment: bathroomPlain })

    // 5. 主卧位置 (权重1.5)
    let bedroomScore = 3, bedroomComment = '', bedroomPlain = ''
    const bedPos = info.masterBedroom
    if (!bedPos) {
      bedroomComment = '请选择主卧位置'; bedroomPlain = '请在方位图或下拉框中选择主卧在哪个方位'
    } else if (['东南', '西南', '西北'].includes(bedPos)) {
      bedroomScore = 5; bedroomComment = '主卧在吉位'; bedroomPlain = '主卧在这个方向非常好，住着舒服运势好'
    } else if (['东', '南', '东北'].includes(bedPos)) {
      bedroomScore = 4; bedroomComment = '主卧位置较佳'; bedroomPlain = '主卧位置不错，对健康和事业有帮助'
    } else if (bedPos === '北') {
      bedroomScore = 3; bedroomComment = '主卧在北偏阴需保暖'; bedroomPlain = '主卧在北边冬天会比较冷，需要加强保暖和灯光'
      recommendations.push('北面主卧需注意保暖和增加照明'); plainRecommendations.push('北面的卧室多加灯和保暖用品')
    } else {
      bedroomScore = 3; bedroomComment = '主卧位置一般'; bedroomPlain = '主卧位置一般，不算特别好也不算差'
    }
    items.push({ name: '主卧位置', score: bedroomScore, maxScore: 5, weight: 1.5, comment: bedroomComment, plainComment: bedroomPlain })

    // 6. 客厅位置 (权重1.5 —— 新增)
    let livingRoomScore = 3, livingRoomComment = '', livingRoomPlain = ''
    const livingPos = info.livingRoom
    if (!livingPos) {
      livingRoomComment = '请选择客厅位置'; livingRoomPlain = '请在方位图或下拉框中选择客厅在哪个方位'
    } else if (livingPos === '中间') {
      livingRoomScore = 5; livingRoomComment = '客厅居中聚气最佳'; livingRoomPlain = '客厅在房子正中间最好，是家里的核心，聚气纳财'
    } else if (['南', '东南'].includes(livingPos)) {
      livingRoomScore = 5; livingRoomComment = '客厅在南/东南采光充足纳气好'; livingRoomPlain = '客厅在南边或东南边非常好，采光好又纳气'
    } else if (['东', '西南'].includes(livingPos)) {
      livingRoomScore = 4; livingRoomComment = '客厅位置较佳'; livingRoomPlain = '客厅位置不错，采光和通风都可以'
    } else if (livingPos === '北') {
      livingRoomScore = 2; livingRoomComment = '客厅在北采光不足需补阳气'; livingRoomPlain = '客厅在北边不太好，采光差，需要多加灯和暖色装饰'
      recommendations.push('北面客厅需加强灯光和暖色装饰'); plainRecommendations.push('客厅在北边的话多加灯和暖色装修')
    } else if (livingPos === '西北') {
      livingRoomScore = 3; livingRoomComment = '客厅在西北气场偏刚'; livingRoomPlain = '客厅在西北方向，气场比较硬朗，适合事业型家庭'
    } else if (livingPos === '西') {
      livingRoomScore = 3; livingRoomComment = '客厅在西有西晒需调和'; livingRoomPlain = '客厅在西边，下午有西晒，需要做好遮阳'
      plainWarnings.push('客厅在西边的话下午很晒，窗帘要厚')
    } else if (livingPos === '东北') {
      livingRoomScore = 3; livingRoomComment = '客厅在东北偏稳'; livingRoomPlain = '客厅在东北方向，气场比较稳，适合安静的家庭'
    }
    items.push({ name: '客厅位置', score: livingRoomScore, maxScore: 5, weight: 1.5, comment: livingRoomComment, plainComment: livingRoomPlain })

    // 7. 入户门格局 (权重1.0)
    let doorScore = 5, doorComment = '', doorPlain = ''
    switch (info.doorPattern) {
      case '正常':
        doorScore = 5; doorComment = '入户门格局正常'; doorPlain = '入户门格局正常，没有问题'
        break
      case '对电梯':
        doorScore = 2; doorComment = '门对电梯开口煞'; doorPlain = '入户门正对电梯，气场会被电梯吸走，不太好'
        warnings.push('门对电梯需设屏风遮挡'); plainWarnings.push('门正对电梯的话，门口放个屏风遮挡一下')
        break
      case '对楼梯':
        doorScore = 2; doorComment = '门对楼梯气流直冲'; doorPlain = '入户门正对楼梯，气流直冲进家，不太稳定'
        recommendations.push('门对楼梯可放绿植缓冲'); plainRecommendations.push('门口放一盆大绿植，让气流进来有个缓冲')
        break
      case '对邻居门':
        doorScore = 3; doorComment = '门对门气场相冲'; doorPlain = '入户门和邻居门对着，气场互相冲撞'
        recommendations.push('门对门可挂门帘化解'); plainRecommendations.push('挂个门帘就能缓解')
        break
      case '对阳台（穿堂）':
        doorScore = 1; doorComment = '穿堂煞财来财去'; doorPlain = '入户门直通阳台！这是最常见的漏财格局，钱来得快走得也快'
        warnings.push('穿堂煞是最典型的漏财格局，务必化解'); plainWarnings.push('大门直通阳台是最差的情况，一定要放屏风或柜子挡一下')
        break
      case '对厨房':
        doorScore = 2; doorComment = '门对厨房财气被烧'; doorPlain = '入户门对着厨房，好的气场还没进来就被火烧了'
        recommendations.push('门对厨房需设玄关隔断'); plainRecommendations.push('门口设个玄关柜把厨房挡住')
        break
      case '对厕所':
        doorScore = 1; doorComment = '门对厕所纳污秽之气'; doorPlain = '入户门对着厕所！脏气直接冲进门，最差的情况'
        warnings.push('门对厕所务必常关厕所门'); plainWarnings.push('厕所门一定要常关，门口放绿植净化一下')
        break
    }
    items.push({ name: '入户门格局', score: doorScore, maxScore: 5, weight: 1.0, comment: doorComment, plainComment: doorPlain })

    // 8. 楼层评分 (权重0.8)
    let floorScore = 5, floorComment = '', floorPlain = ''
    const ratio = info.floor / info.totalFloors
    if (ratio <= 0.15) {
      floorScore = 3; floorComment = '低楼层可能潮湿噪音大'; floorPlain = '楼层比较低，可能比较吵也比较潮'
      plainWarnings.push('低楼层注意防潮和噪音')
    } else if (ratio <= 0.35) {
      floorScore = 5; floorComment = '中低层理想高度'; floorPlain = '楼层高度刚好，不太高不太低，最好'
    } else if (ratio <= 0.65) {
      floorScore = 4; floorComment = '中高层视野好'; floorPlain = '楼层比较高，视野不错'
    } else if (ratio < 1) {
      floorScore = 3; floorComment = '高层气场易散'; floorPlain = '楼层很高，气场不容易聚集'
      plainRecommendations.push('高层多养绿植增加"地气"')
    } else {
      floorScore = 1; floorComment = '顶层孤高煞'; floorPlain = '住顶层不太好，夏天热冬天冷，气场容易散掉'
      warnings.push('顶层需注意隔热和漏水'); plainWarnings.push('顶层注意隔热和漏水问题')
    }
    items.push({ name: '楼层高度', score: floorScore, maxScore: 5, weight: 0.8, comment: floorComment, plainComment: floorPlain })

    // 9. 阳台格局 (权重0.8)
    let balconyScore = 5, balconyComment = '', balconyPlain = ''
    switch (info.balcony) {
      case '双阳台':
        balconyScore = 5; balconyComment = '双阳台南北通透'; balconyPlain = '有两个阳台最好，通风采光都很棒'
        break
      case '单阳台':
        balconyScore = 3; balconyComment = '单阳台需保持明亮'; balconyPlain = '只有一个阳台，要保持干净明亮'
        break
      case '无阳台':
        balconyScore = 1; balconyComment = '无阳台缺乏纳气口'; balconyPlain = '没有阳台不太好，通风采光差，要多开窗'
        warnings.push('无阳台需勤开窗通风'); plainWarnings.push('没有阳台就要勤开窗户通风')
        break
    }
    items.push({ name: '阳台格局', score: balconyScore, maxScore: 5, weight: 0.8, comment: balconyComment, plainComment: balconyPlain })

    // 加权总分
    const totalWeighted = items.reduce((sum, i) => sum + (i.score / i.maxScore) * i.weight, 0)
    const maxWeighted = items.reduce((sum, i) => sum + i.weight, 0)
    const totalScore = Math.round((totalWeighted / maxWeighted) * 100)

    let summary = '', plainSummary = ''
    if (totalScore >= 85) {
      summary = '风水上佳'; plainSummary = '这套房子整体非常好，住着舒服运气旺'
    } else if (totalScore >= 70) {
      summary = '风水良好'; plainSummary = '这套房子还不错，大部分都挺好，少数地方需要注意'
    } else if (totalScore >= 55) {
      summary = '风水中等'; plainSummary = '这套房子有一些需要注意的地方，按下面的建议调整就能改善'
    } else {
      summary = '风水存在较多问题'; plainSummary = '这套房子风水问题比较多，建议找专业人士来评估，或者按下面的建议做调整'
    }

    return { totalScore, items, summary, plainSummary, recommendations, plainRecommendations, warnings, plainWarnings }
  }, [info])

  const scoreColor = analysis.totalScore >= 85 ? '#C41E3A' : analysis.totalScore >= 70 ? '#D4A84B' : analysis.totalScore >= 55 ? '#8B6914' : '#666'

  // 空间关系检测（户型图判断）
  const spatialWarnings = useMemo(() => {
    const sw: string[] = []
    // 厨房在西北 → 火烧天门
    if (info.kitchen === '西北') sw.push('厨房在西北：火烧天门，严重影响男主人')
    // 卫生间在中间 → 中宫受污
    if (info.bathroom === '中间') sw.push('卫生间居中：中宫受污，影响全家健康')
    // 厨房在中间 → 火烧中宫
    if (info.kitchen === '中间') sw.push('厨房居中：火烧中宫，影响全家运势')
    // 卫生间和厨房同位 → 水火相冲
    if (info.kitchen === info.bathroom && info.kitchen !== '中间') sw.push('厨房和卫生间在同一方位：水火相冲')
    // 大门对阳台 → 穿堂煞
    if (info.doorPattern === '对阳台（穿堂）') sw.push('大门直通阳台：穿堂煞，财来财去')
    return sw
  }, [info])

  return (
    <div className="page analysis-page">
      <h2>户型风水分析</h2>
      <p className="page-desc">填写您房子的基本信息，系统会判断空间关系问题并给出风水评分</p>

      {measurements.doorDegree !== null && (
        <div className="auto-fill-tip">
          ✅ 已从罗盘自动带入大门朝向数据（{measurements.doorDegree.toFixed(0)}°）
        </div>
      )}

      {/* 九宫格方位图（交互式） */}
      <HouseLayout />

      {/* 空间关系警告 */}
      {spatialWarnings.length > 0 && (
        <div className="spatial-warnings">
          <h4>⚠️ 户型空间关系问题</h4>
          <ul>
            {spatialWarnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label>楼层</label>
        <div className="input-row">
          <input type="number" min={1} max={100} value={info.floor} onChange={e => updateField('floor', Number(e.target.value))} />
          <span className="input-sep">/</span>
          <input type="number" min={1} max={100} value={info.totalFloors} onChange={e => updateField('totalFloors', Number(e.target.value))} />
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
        <label>入户门格局</label>
        <select value={info.doorPattern} onChange={e => updateField('doorPattern', e.target.value)}>
          {DOOR_PATTERN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>阳台格局</label>
        <select value={info.balcony} onChange={e => updateField('balcony', e.target.value)}>
          {BALCONY_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>厨房位置 <span className="field-hint">👇 或点击上方方位图直接放置</span></label>
        <select value={info.kitchen} onChange={e => updateField('kitchen', e.target.value)}>
          <option value="">未选择</option>
          {KITCHEN_OPTIONS.map(k => <option key={k} value={k}>{k === '中间' ? '居中' : `${k}面`}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>卫生间位置 <span className="field-hint">👇 或点击上方方位图直接放置</span></label>
        <select value={info.bathroom} onChange={e => updateField('bathroom', e.target.value)}>
          <option value="">未选择</option>
          {BATHROOM_OPTIONS.map(b => <option key={b} value={b}>{b === '中间' ? '居中' : `${b}面`}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>主卧位置 <span className="field-hint">👇 或点击上方方位图直接放置</span></label>
        <select value={info.masterBedroom} onChange={e => updateField('masterBedroom', e.target.value)}>
          <option value="">未选择</option>
          {BEDROOM_OPTIONS.map(b => <option key={b} value={b}>{b}角</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>客厅位置 <span className="field-hint">👇 或点击上方方位图直接放置</span></label>
        <select value={info.livingRoom} onChange={e => updateField('livingRoom', e.target.value)}>
          <option value="">未选择</option>
          {LIVING_ROOM_OPTIONS.map(l => <option key={l} value={l}>{l === '中间' ? '居中' : `${l}面`}</option>)}
        </select>
      </div>

      <button className="btn-primary btn-analyze" onClick={() => setShowResult(true)}>
        开始分析
      </button>

      {showResult && (
        <div className="analysis-result">
          <div className="total-score" style={{ borderColor: scoreColor }}>
            <div className="score-number" style={{ color: scoreColor }}>{analysis.totalScore}</div>
            <div className="score-label">风水评分 / 100</div>
            <div className="score-bar-bg">
              <div className="score-bar-fill" style={{ width: `${analysis.totalScore}%`, backgroundColor: scoreColor }} />
            </div>
          </div>

          <p className="analysis-plain-summary" style={{ color: scoreColor }}>
            {analysis.plainSummary}
          </p>

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
                <p className="score-item-plain">{item.plainComment}</p>
                <p className="score-item-detail">{item.comment}</p>
              </div>
            ))}
          </div>

          {analysis.plainWarnings.length > 0 && (
            <div className="analysis-warnings">
              <h4>⚠️ 需要注意的问题</h4>
              <ul>
                {analysis.plainWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {analysis.plainRecommendations.length > 0 && (
            <div className="analysis-recommendations">
              <h4>💡 改善建议</h4>
              <ul>
                {analysis.plainRecommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {analysis.plainWarnings.length > 0 && (
            <div className="result-links">
              <h4>🔧 查看具体化解方法</h4>
              <button className="btn-primary btn-small" onClick={() => setActiveTab('solution')}>
                前往化解页面 →
              </button>
            </div>
          )}

          <div className="result-links">
            <h4>📚 想深入了解？</h4>
            <button className="btn-secondary btn-small" onClick={() => setActiveTab('wiki')}>
              查看风水百科 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
