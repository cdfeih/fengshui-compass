import { findDirection } from '../data/directions'
import type { Direction } from '../data/directions'

export type SceneType = 'door' | 'bed' | 'stove' | 'balcony' | 'general'

export interface FengShuiResult {
  direction: Direction
  degree: number
  scene: SceneType
  sceneLabel: string
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  ratingText: string
  summary: string
  detailed: string
  advice: string
  tips: string[]
}

// 场景标签
const SCENE_LABELS: Record<SceneType, string> = {
  door: '大门朝向',
  bed: '床头朝向',
  stove: '灶台朝向',
  balcony: '阳台朝向',
  general: '当前朝向',
}

// 场景评级
function getSceneRating(dir: Direction, scene: SceneType): FengShuiResult['rating'] {
  const name = dir.name

  // 大门朝向评级
  if (scene === 'door') {
    if (['午', '巽', '卯', '子'].includes(name)) return 'excellent'
    if (['丙', '丁', '甲', '乙', '乾', '癸', '艮'].includes(name)) return 'good'
    if (['巳', '辰', '丑', '寅', '坤', '壬', '亥', '未'].includes(name)) return 'fair'
    return 'fair'
  }

  // 床头朝向评级
  if (scene === 'bed') {
    if (['乾', '巽', '坤', '子', '卯'].includes(name)) return 'excellent'
    if (['甲', '寅', '艮', '丑', '癸', '丁'].includes(name)) return 'good'
    if (['午', '丙', '巳', '乙', '辰', '未'].includes(name)) return 'fair'
    if (['酉', '辛', '庚', '申', '亥', '戌', '壬'].includes(name)) return 'fair'
    return 'fair'
  }

  // 灶台朝向评级
  if (scene === 'stove') {
    if (['甲', '卯', '乙', '辰', '巽', '巳'].includes(name)) return 'excellent' // 东、东南
    if (['丙', '午', '丁'].includes(name)) return 'good' // 南
    if (['丑', '艮', '寅', '未', '坤', '申'].includes(name)) return 'fair' // 土位
    if (['子', '癸', '壬', '乾', '亥'].includes(name)) return 'poor' // 北、西北
    return 'fair'
  }

  // 阳台朝向评级
  if (scene === 'balcony') {
    if (['卯', '午', '巽'].includes(name)) return 'excellent'
    if (['甲', '乙', '丙', '丁', '巳', '辰'].includes(name)) return 'good'
    if (['子', '癸', '丑', '艮', '寅', '未', '坤'].includes(name)) return 'fair'
    if (['酉', '庚', '辛', '申', '戌', '乾', '亥', '壬'].includes(name)) return 'fair'
    return 'fair'
  }

  return 'fair'
}

// 评级文本
function getRatingText(rating: FengShuiResult['rating']): string {
  switch (rating) {
    case 'excellent': return '大吉 ⭐⭐⭐⭐⭐'
    case 'good': return '吉 ⭐⭐⭐⭐'
    case 'fair': return '一般 ⭐⭐⭐'
    case 'poor': return '需注意 ⭐⭐'
  }
}

// 获取场景对应的建议
function getSceneAdvice(dir: Direction, scene: SceneType): string {
  switch (scene) {
    case 'door': return dir.doorAdvice
    case 'bed': return dir.bedAdvice
    case 'stove': return dir.stoveAdvice
    case 'balcony': return dir.balconyAdvice
    default: return dir.description
  }
}

// 主解读函数
export function interpretFengShui(degree: number, scene: SceneType): FengShuiResult {
  const direction = findDirection(degree)
  const rating = getSceneRating(direction, scene)
  const sceneLabel = SCENE_LABELS[scene]

  let summary = ''
  let tips: string[] = []

  switch (scene) {
    case 'door':
      summary = `您家的大门开在**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${getSceneAdvice(direction, scene)}`
      tips = [
        '保持门厅明亮整洁，不放杂物',
        '门口可放绿植或水晶饰品催旺',
        '若大门直冲阳台/窗户，需设屏风或玄关柜',
        '门后不宜挂镜子',
      ]
      break
    case 'bed':
      summary = `您的床头朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${getSceneAdvice(direction, scene)}`
      tips = [
        '床头必须靠实墙，忌靠窗户',
        '床上方不能有横梁',
        '卧室镜子不对床',
        '保持床底通风整洁',
      ]
      break
    case 'stove':
      summary = `您的灶台朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}。${getSceneAdvice(direction, scene)}`
      tips = [
        '灶台忌对门、对窗',
        '灶台和水槽不要正对',
        '保持灶台干净整洁',
        '厨房保持良好通风',
      ]
      break
    case 'balcony':
      summary = `您的阳台朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}。${getSceneAdvice(direction, scene)}`
      tips = [
        '阳台保持整洁开阔，忌堆杂物',
        '放阔叶绿植可聚气纳财',
        '阳台栏杆不宜过高（影响采光）',
        '晾晒衣物及时收，不要长期悬挂',
      ]
      break
    default:
      summary = `您当前面向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${direction.description}`
      tips = [
        '使用"场景选择"按钮获取针对性的风水建议',
        '测量时远离电器和金属物品',
        '手机伸出窗外测量更准确',
      ]
  }

  return {
    direction,
    degree,
    scene,
    sceneLabel,
    rating,
    ratingText: getRatingText(rating),
    summary,
    detailed: direction.description,
    advice: getSceneAdvice(direction, scene),
    tips,
  }
}
