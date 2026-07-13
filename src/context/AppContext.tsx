import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CompassMeasurement {
  doorDegree: number | null    // 大门朝向度数
  bedDegree: number | null     // 床头朝向度数
  stoveDegree: number | null   // 灶台朝向度数
  balconyDegree: number | null // 阳台朝向度数
}

export interface HouseInfo {
  floor: number
  totalFloors: number
  direction: string
  layout: string
  balcony: string
  kitchen: string
  masterBedroom: string
  bathroom: string       // 新增：卫生间位置
  doorPattern: string   // 新增：入户门格局
}

export interface AppState {
  measurements: CompassMeasurement
  houseInfo: HouseInfo
  activeTab: string
  // 罗盘测量结果保存
  setMeasurement: (scene: string, degree: number) => void
  // 分析表单数据
  setHouseInfo: (info: Partial<HouseInfo>) => void
  // Tab 切换（支持从其他组件跳转）
  setActiveTab: (tab: string) => void
}

const DEFAULT_HOUSE_INFO: HouseInfo = {
  floor: 7,
  totalFloors: 32,
  direction: '正南',
  layout: '方正',
  balcony: '双阳台',
  kitchen: '北',
  masterBedroom: '东南',
  bathroom: '西南',
  doorPattern: '正常',
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<CompassMeasurement>({
    doorDegree: null,
    bedDegree: null,
    stoveDegree: null,
    balconyDegree: null,
  })
  const [houseInfo, setHouseInfoState] = useState<HouseInfo>(DEFAULT_HOUSE_INFO)
  const [activeTab, setActiveTab] = useState('compass')

  const setMeasurement = (scene: string, degree: number) => {
    setMeasurements(prev => ({
      ...prev,
      [`${scene}Degree`]: degree,
    }))
  }

  const setHouseInfo = (info: Partial<HouseInfo>) => {
    setHouseInfoState(prev => ({ ...prev, ...info }))
  }

  return (
    <AppContext.Provider value={{
      measurements,
      houseInfo,
      activeTab,
      setMeasurement,
      setHouseInfo,
      setActiveTab,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
