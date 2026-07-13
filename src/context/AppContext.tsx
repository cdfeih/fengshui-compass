import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CompassMeasurement {
  doorDegree: number | null      // 大门朝向度数
  bedDegree: number | null       // 床头朝向度数
  stoveDegree: number | null     // 灶台朝向度数
  mingtangDegree: number | null  // 明堂（客厅窗/阳台）朝向度数
  entranceDegree: number | null  // 门厅（玄关）朝向度数
}

export interface HouseInfo {
  floor: number
  totalFloors: number
  direction: string
  layout: string
  balcony: string           // 阳台格局（单阳台/双阳台/无阳台）
  kitchen: string           // 厨房位置方位
  masterBedroom: string     // 主卧位置方位
  bathroom: string          // 卫生间位置方位
  livingRoom: string        // 客厅位置方位（新增）
  doorPattern: string       // 入户门格局
}

export interface AppState {
  measurements: CompassMeasurement
  houseInfo: HouseInfo
  activeTab: string
  setMeasurement: (scene: string, degree: number) => void
  setHouseInfo: (info: Partial<HouseInfo>) => void
  setActiveTab: (tab: string) => void
}

const DEFAULT_HOUSE_INFO: HouseInfo = {
  floor: 7,
  totalFloors: 32,
  direction: '正南',
  layout: '方正',
  balcony: '双阳台',
  kitchen: '',
  masterBedroom: '',
  bathroom: '',
  livingRoom: '',
  doorPattern: '正常',
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<CompassMeasurement>({
    doorDegree: null,
    bedDegree: null,
    stoveDegree: null,
    mingtangDegree: null,
    entranceDegree: null,
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
