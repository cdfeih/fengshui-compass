interface DeviceOrientationEvent {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

interface DeviceOrientationEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

interface Window {
  DeviceOrientationEvent: DeviceOrientationEventStatic
  orientation?: number
}
