import { findDirection } from '../data/directions'

// 归一化度数到 0-360
export function normalizeDegree(degree: number): number {
  let d = degree % 360
  if (d < 0) d += 360
  return Math.round(d * 10) / 10
}

// 度数转方位名
export function degreeToDirectionName(degree: number): string {
  const dir = findDirection(degree)
  return `${dir.fullName}（${dir.name}山）`
}

// 度数转大方向
export function degreeToCategory(degree: number): string {
  return findDirection(degree).direction
}

// 格式化度数显示
export function formatDegree(degree: number): string {
  return `${normalizeDegree(degree).toFixed(1)}°`
}

// 判断是否iOS设备
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// 判断是否Android设备
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

// 判断是否移动设备
export function isMobile(): boolean {
  return isIOS() || isAndroid() || window.innerWidth < 768
}
