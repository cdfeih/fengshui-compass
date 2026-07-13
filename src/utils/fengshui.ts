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
  // 专业术语版
  summary: string
  detailed: string
  advice: string
  tips: string[]
  // 大白话版（给不懂风水的人看）
  plainSummary: string
  plainAdvice: string
  plainTips: string[]
  // 关联的百科文章id
  relatedWikiIds: string[]
  // 关联的化解问题id
  relatedIssueIds: string[]
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

  if (scene === 'door') {
    if (['午', '巽', '卯', '子'].includes(name)) return 'excellent'
    if (['丙', '丁', '甲', '乙', '乾', '癸', '艮'].includes(name)) return 'good'
    if (['巳', '辰', '丑', '寅', '坤', '壬', '亥', '未'].includes(name)) return 'fair'
    return 'fair'
  }

  if (scene === 'bed') {
    if (['乾', '巽', '坤', '子', '卯'].includes(name)) return 'excellent'
    if (['甲', '寅', '艮', '丑', '癸', '丁'].includes(name)) return 'good'
    if (['午', '丙', '巳', '乙', '辰', '未'].includes(name)) return 'fair'
    if (['酉', '辛', '庚', '申', '亥', '戌', '壬'].includes(name)) return 'fair'
    return 'fair'
  }

  if (scene === 'stove') {
    if (['甲', '卯', '乙', '辰', '巽', '巳'].includes(name)) return 'excellent'
    if (['丙', '午', '丁'].includes(name)) return 'good'
    if (['丑', '艮', '寅', '未', '坤', '申'].includes(name)) return 'fair'
    if (['子', '癸', '壬', '乾', '亥'].includes(name)) return 'poor'
    return 'fair'
  }

  if (scene === 'balcony') {
    if (['卯', '午', '巽'].includes(name)) return 'excellent'
    if (['甲', '乙', '丙', '丁', '巳', '辰'].includes(name)) return 'good'
    if (['子', '癸', '丑', '艮', '寅', '未', '坤'].includes(name)) return 'fair'
    if (['酉', '庚', '辛', '申', '戌', '乾', '亥', '壬'].includes(name)) return 'fair'
    return 'fair'
  }

  return 'fair'
}

// 评级文本（大白话版）
const RATING_PLAIN: Record<FengShuiResult['rating'], string> = {
  excellent: '非常好',
  good: '还不错',
  fair: '一般般',
  poor: '不太好，需要调整',
}

function getRatingText(rating: FengShuiResult['rating']): string {
  switch (rating) {
    case 'excellent': return '大吉 ⭐⭐⭐⭐⭐'
    case 'good': return '吉 ⭐⭐⭐⭐'
    case 'fair': return '一般 ⭐⭐⭐'
    case 'poor': return '需注意 ⭐⭐'
  }
}

function getSceneAdvice(dir: Direction, scene: SceneType): string {
  switch (scene) {
    case 'door': return dir.doorAdvice
    case 'bed': return dir.bedAdvice
    case 'stove': return dir.stoveAdvice
    case 'balcony': return dir.balconyAdvice
    default: return dir.description
  }
}

// 大白话版场景建议
function getScenePlainAdvice(dir: Direction, scene: SceneType): string {
  switch (scene) {
    case 'door': return dir.doorPlain
    case 'bed': return dir.bedPlain
    case 'stove': return dir.stovePlain
    case 'balcony': return dir.balconyPlain
    default: return dir.plainSummary
  }
}

// 根据方位和场景关联百科文章
function getRelatedWikiIds(dir: Direction, scene: SceneType): string[] {
  const ids: string[] = []
  // 所有场景都可链接八卦方位
  ids.push('eight_trigrams')
  // 大门关联大门攻略
  if (scene === 'door') ids.push('door_fengshui')
  // 床头关联卧室指南
  if (scene === 'bed') ids.push('bedroom_fengshui')
  // 灶台关联厨房风水
  if (scene === 'stove') ids.push('kitchen_fengshui')
  // 东南方位关联财位
  if (dir.direction === '东南') ids.push('wealth_position')
  // 五行相关
  ids.push('five_elements')
  // 二十四山相关
  ids.push('twenty_four_mountains')
  return ids
}

// 根据方位和场景关联化解问题
function getRelatedIssueIds(dir: Direction, scene: SceneType): string[] {
  const ids: string[] = []
  // 灶台朝北
  if (scene === 'stove' && dir.direction === '北') ids.push('stove_facing_north')
  // 灶台朝西北（火烧天门）
  if (scene === 'stove' && dir.direction === '西北') ids.push('kitchen_northwest')
  // 厨房在北方
  if (scene === 'stove' && dir.direction === '北') ids.push('kitchen_north')
  // 床头对门（门冲床）
  if (scene === 'bed') ids.push('bed_facing_door')
  // 床头靠窗
  if (scene === 'bed') ids.push('bed_under_window')
  // 横梁压床
  if (scene === 'bed') ids.push('beam_over_bed')
  return ids
}

// 主解读函数
export function interpretFengShui(degree: number, scene: SceneType): FengShuiResult {
  const direction = findDirection(degree)
  const rating = getSceneRating(direction, scene)
  const sceneLabel = SCENE_LABELS[scene]

  let summary = ''
  let tips: string[] = []
  let plainTips: string[] = []

  switch (scene) {
    case 'door':
      summary = `您家的大门开在**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${getSceneAdvice(direction, scene)}`
      tips = ['保持门厅明亮整洁，不放杂物', '门口可放绿植或水晶饰品催旺', '若大门直冲阳台/窗户，需设屏风或玄关柜', '门后不宜挂镜子']
      plainTips = ['门口保持干净明亮，不要堆杂物', '大门直通阳台的话，中间放个屏风挡一下', '门口放一盆绿植会让运气更好', '门后面不要挂镜子']
      break
    case 'bed':
      summary = `您的床头朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${getSceneAdvice(direction, scene)}`
      tips = ['床头必须靠实墙，忌靠窗户', '床上方不能有横梁', '卧室镜子不对床', '保持床底通风整洁']
      plainTips = ['床头一定要靠着墙，不要靠着窗户', '床上方不能有横梁压着', '卧室里的镜子不要正对着床', '床底下不要堆杂物']
      break
    case 'stove':
      summary = `您的灶台朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}。${getSceneAdvice(direction, scene)}`
      tips = ['灶台忌对门、对窗', '灶台和水槽不要正对', '保持灶台干净整洁', '厨房保持良好通风']
      plainTips = ['灶台不要正对着厨房门或窗户', '灶台和水龙头不要面对面', '灶台保持干净整洁', '厨房要通风好']
      break
    case 'balcony':
      summary = `您的阳台朝向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}。${getSceneAdvice(direction, scene)}`
      tips = ['阳台保持整洁开阔，忌堆杂物', '放阔叶绿植可聚气纳财', '阳台栏杆不宜过高（影响采光）', '晾晒衣物及时收，不要长期悬挂']
      plainTips = ['阳台保持干净整洁，不要堆杂物', '放几盆大叶子的植物会让家里运气更好', '晾好的衣服及时收起来', '栏杆太高会影响采光']
      break
    default:
      summary = `您当前面向**${direction.fullName}（${direction.name}山）**，五行属${direction.element}，${direction.trigramFull}卦位。${direction.description}`
      tips = ['使用"场景选择"按钮获取针对性的风水建议', '测量时远离电器和金属物品', '手机伸出窗外测量更准确']
      plainTips = ['点击下方的"测大门""测床"等按钮，可以获取更有用的建议', '测量时远离电器和金属物品，结果更准确', '手机伸出窗外测量更准确']
  }

  const plainSummary = `${RATING_PLAIN[rating]}！${direction.plainSummary}。${getScenePlainAdvice(direction, scene)}`

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
    plainSummary,
    plainAdvice: getScenePlainAdvice(direction, scene),
    plainTips,
    relatedWikiIds: getRelatedWikiIds(direction, scene),
    relatedIssueIds: getRelatedIssueIds(direction, scene),
  }
}
