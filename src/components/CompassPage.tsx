import { useState, useEffect } from 'react'
import CompassFace from './Compass'
import DirectionDisplay from './DirectionDisplay'
import SceneButtons from './SceneButtons'
import { useCompass } from '../hooks/useCompass'
import { interpretFengShui } from '../utils/fengshui'
import type { SceneType, FengShuiResult } from '../utils/fengshui'
import { isIOS } from '../utils/compass'

// 场景操作指南
const SCENE_GUIDES: Record<SceneType, string> = {
  general: '站在房间中央，手机平放在手掌上，朝向你要测的方向',
  door: '站在入户门内侧，手机竖起来朝门外方向，屏幕朝向你',
  bed: '躺在床上正常位置，手机放在枕头旁边，屏幕朝上，指向床头方向',
  stove: '站在灶台前方（你平时做饭站的位置），手机朝向灶台正面',
  balcony: '站在阳台中央，手机朝向阳台外方向，屏幕朝向你',
}

export default function CompassPage() {
  const compass = useCompass()
  const [scene, setScene] = useState<SceneType>('general')
  const [result, setResult] = useState<FengShuiResult | null>(null)
  const [showCalibrateTip, setShowCalibrateTip] = useState(true)
  const [showPermission, setShowPermission] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (isIOS() && compass.permissionState === 'prompt') {
      setShowPermission(true)
    }
  }, [compass.permissionState])

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

  const handleSceneChange = (newScene: SceneType) => {
    setScene(newScene)
    setShowGuide(true) // 切换场景时显示操作指南
  }

  // 桌面端模拟罗盘
  const [simulatedDegree, setSimulatedDegree] = useState(180)
  const isSimulated = !compass.isSupported || (!compass.heading && compass.permissionState !== 'prompt')

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
          <span>📱 将手机平放，像画"8"字一样晃动几下来校准，远离电器和金属物体</span>
          <button className="tip-close" onClick={() => setShowCalibrateTip(false)}>✕</button>
        </div>
      )}

      {/* 场景操作指南 */}
      {showGuide && (
        <div className="guide-tip">
          <span>💡 {SCENE_GUIDES[scene]}</span>
          <button className="tip-close" onClick={() => setShowGuide(false)}>✕</button>
        </div>
      )}

      {/* 模拟罗盘提示 */}
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
          rating={displayResult?.rating || 'fair'}
          plainSummary={displayResult?.plainSummary || ''}
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
      <SceneButtons activeScene={scene} onSceneChange={handleSceneChange} />

      {/* 大白话解读结果 */}
      {displayResult && (
        <div className="result-card">
          <div className={`result-rating rating-${displayResult.rating}`}>
            {displayResult.ratingText}
          </div>

          {/* 大白话总结（优先展示） */}
          <div className="result-plain">
            <p className="result-plain-summary">{displayResult.plainSummary}</p>
          </div>

          {/* 专业术语版（折叠展示） */}
          <div className="result-detail-toggle">
            <button className="toggle-btn" onClick={() => {
              const el = document.getElementById('result-detail-content')
              if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
            }}>
              查看专业解读 ▼
            </button>
          </div>
          <div id="result-detail-content" style={{ display: 'none' }}>
            <p className="result-summary">{displayResult.summary}</p>
          </div>

          {/* 大白话建议列表 */}
          <div className="result-tips">
            <h4>💡 日常建议</h4>
            <ul>
              {displayResult.plainTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* 关联链接 */}
          {displayResult.relatedIssueIds.length > 0 && (
            <div className="result-links">
              <h4>⚠️ 可能相关的问题</h4>
              <div className="link-tags">
                {displayResult.relatedIssueIds.map(id => (
                  <a key={id} href={`#solution-${id}`} className="link-tag">
                    查看化解方案 →
                  </a>
                ))}
              </div>
            </div>
          )}

          {displayResult.relatedWikiIds.length > 0 && (
            <div className="result-links">
              <h4>📚 想了解更多？</h4>
              <div className="link-tags">
                {displayResult.relatedWikiIds.map(id => (
                  <a key={id} href={`#wiki-${id}`} className="link-tag">
                    相关百科 →
                  </a>
                ))}
              </div>
            </div>
          )}
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
