import { useState, useEffect } from 'react'
import CompassFace from './Compass'
import DirectionDisplay from './DirectionDisplay'
import SceneButtons from './SceneButtons'
import { useCompass } from '../hooks/useCompass'
import { interpretFengShui } from '../utils/fengshui'
import type { SceneType, FengShuiResult } from '../utils/fengshui'
import { isIOS } from '../utils/compass'

export default function CompassPage() {
  const compass = useCompass()
  const [scene, setScene] = useState<SceneType>('general')
  const [result, setResult] = useState<FengShuiResult | null>(null)
  const [showCalibrateTip, setShowCalibrateTip] = useState(true)
  const [showPermission, setShowPermission] = useState(false)

  // 检查是否需要显示权限按钮
  useEffect(() => {
    if (isIOS() && compass.permissionState === 'prompt') {
      setShowPermission(true)
    }
  }, [compass.permissionState])

  // 更新解读结果
  useEffect(() => {
    if (compass.heading !== null) {
      setResult(interpretFengShui(compass.degree, scene))
    }
  }, [compass.degree, compass.heading, scene])

  const handlePermission = async () => {
    await compass.requestPermission()
    setShowPermission(false)
    setShowCalibrateTip(true)
  }

  // 桌面端模拟罗盘（无陀螺仪时）
  const [simulatedDegree, setSimulatedDegree] = useState(180)
  const isSimulated = !compass.isSupported || (!compass.heading && compass.permissionState !== 'prompt')

  // 如果桌面端且无传感器，使用模拟数据
  const displayDegree = isSimulated ? simulatedDegree : compass.degree
  const displayResult = isSimulated
    ? interpretFengShui(simulatedDegree, scene)
    : result

  useEffect(() => {
    if (isSimulated) {
      setResult(interpretFengShui(simulatedDegree, scene))
    }
  }, [simulatedDegree, scene, isSimulated])

  return (
    <div className="page compass-page">
      {/* 权限请求 */}
      {showPermission && (
        <div className="permission-overlay">
          <div className="permission-card">
            <div className="permission-icon">🧭</div>
            <h3>需要方向传感器权限</h3>
            <p>风水罗盘需要使用您手机的方向传感器来确定方位。请点击下方按钮授权。</p>
            <button className="btn-primary" onClick={handlePermission}>
              授权方向传感器
            </button>
            <p className="permission-note">我们不会收集或上传您的任何数据</p>
          </div>
        </div>
      )}

      {/* 校准提示 */}
      {showCalibrateTip && compass.permissionState !== 'prompt' && (
        <div className="calibrate-tip">
          <span>📱 请将手机平放，画"8"字校准，远离电器和金属物体</span>
          <button className="tip-close" onClick={() => setShowCalibrateTip(false)}>✕</button>
        </div>
      )}

      {/* 模拟罗盘提示（桌面端） */}
      {isSimulated && (
        <div className="simulate-tip">
          <span>💻 桌面端演示模式 — 点击罗盘旋转或拖动下方滑块</span>
        </div>
      )}

      {/* 罗盘区域 */}
      <div className="compass-section">
        <CompassFace degree={displayDegree} size={280} />
        <DirectionDisplay
          direction={displayResult?.direction || null}
          degree={displayDegree}
          sceneLabel={displayResult?.sceneLabel || '当前朝向'}
          ratingText={displayResult?.ratingText || ''}
          isActive={compass.isCalibrated || isSimulated}
        />
      </div>

      {/* 桌面端滑块 */}
      {isSimulated && (
        <div className="simulate-slider">
          <input
            type="range"
            min={0}
            max={359}
            value={simulatedDegree}
            onChange={e => setSimulatedDegree(Number(e.target.value))}
          />
          <span>{simulatedDegree.toFixed(0)}°</span>
        </div>
      )}

      {/* 场景按钮 */}
      <SceneButtons activeScene={scene} onSceneChange={setScene} />

      {/* 解读结果 */}
      {displayResult && (
        <div className="result-card">
          <div className={`result-rating rating-${displayResult.rating}`}>
            {displayResult.ratingText}
          </div>
          <p className="result-summary">{displayResult.summary}</p>
          <div className="result-tips">
            <h4>💡 实用建议</h4>
            <ul>
              {displayResult.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 不支持提示 */}
      {!compass.isSupported && (
        <div className="error-card">
          <p>⚠️ {compass.error}</p>
          <p className="error-sub">当前为桌面端演示模式，使用模拟罗盘数据</p>
        </div>
      )}
    </div>
  )
}
