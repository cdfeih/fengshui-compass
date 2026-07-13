import { useState, useEffect, useCallback, useRef } from 'react'
import { normalizeDegree, isIOS } from '../utils/compass'

interface CompassState {
  degree: number
  heading: number | null  // 罗盘朝向（0=北）
  accuracy: number | null
  isSupported: boolean
  isCalibrated: boolean
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown'
  error: string | null
}

export function useCompass(): CompassState & {
  requestPermission: () => Promise<void>
  calibrate: () => void
} {
  const [degree, setDegree] = useState(0)
  const [heading, setHeading] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [permissionState, setPermissionState] = useState<CompassState['permissionState']>('unknown')
  const [error, setError] = useState<string | null>(null)
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null)

  // 处理方向数据（Android 用 webkitCompassHeading，iOS 用 alpha）
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let h: number | null = null

    // Android 通常有 webkitCompassHeading
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      h = 360 - event.webkitCompassHeading // webkitCompassHeading 是顺时针，转换为逆时针
    } else if (event.alpha !== null) {
      // iOS 使用 alpha（需要配合屏幕方向调整）
      // alpha: 0=北, 90=东, 180=南, 270=西
      h = event.alpha
    }

    if (h !== null) {
      // 根据屏幕方向修正（手机竖屏时需要调整）
      const orientation = (window.screen as any).orientation?.angle || window.orientation || 0
      if (orientation === 90) {
        h = (h - 90 + 360) % 360
      } else if (orientation === -90 || orientation === 270) {
        h = (h + 90) % 360
      }

      const normalized = normalizeDegree(h)
      setHeading(normalized)
      setDegree(normalized)

      if (event.webkitCompassAccuracy !== undefined && event.webkitCompassAccuracy !== null) {
        setAccuracy(event.webkitCompassAccuracy)
      }
      setIsCalibrated(true)
    }
  }, [])

  // 检查是否支持
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      setIsSupported(true)

      // 检查是否需要权限（iOS 13+）
      if (isIOS() && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setPermissionState('prompt')
      } else {
        setPermissionState('granted')
        // 非iOS直接添加监听
        listenerRef.current = handleOrientation
        window.addEventListener('deviceorientation', handleOrientation)
      }
    } else {
      setIsSupported(false)
      setError('您的设备不支持电子罗盘功能。请使用带有陀螺仪的手机。')
    }

    return () => {
      if (listenerRef.current) {
        window.removeEventListener('deviceorientation', listenerRef.current)
      }
    }
  }, [handleOrientation])

  // iOS 请求权限
  const requestPermission = useCallback(async () => {
    if (!isIOS()) return

    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission()
      if (permission === 'granted') {
        setPermissionState('granted')
        listenerRef.current = handleOrientation
        window.addEventListener('deviceorientation', handleOrientation)
        setError(null)
      } else {
        setPermissionState('denied')
        setError('需要授予方向传感器权限才能使用罗盘功能')
      }
    } catch (e) {
      setPermissionState('denied')
      setError('权限请求失败，请在设置中允许方向传感器')
    }
  }, [handleOrientation])

  // 校准
  const calibrate = useCallback(() => {
    setIsCalibrated(false)
    setTimeout(() => setIsCalibrated(true), 500)
  }, [])

  return {
    degree,
    heading,
    accuracy,
    isSupported,
    isCalibrated,
    permissionState,
    error,
    requestPermission,
    calibrate,
  }
}
