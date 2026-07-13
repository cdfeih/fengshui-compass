import { useState, useEffect, useCallback } from 'react'
import CompassFace from './Compass'
import DirectionDisplay from './DirectionDisplay'
import SceneButtons from './SceneButtons'
import { useCompass } from '../hooks/useCompass'
import { useAppState } from '../context/AppContext'
import { interpretFengShui } from '../utils/fengshui'
import type { SceneType } from '../utils/fengshui'
import { isIOS } from '../utils/compass'

// 场景操作指南
const SCENE_GUIDES: Record<SceneType, string> = {
  general: '站在房间中央，手机平放在手掌上，朝向你要测的方向',
  door: '站在入户门内侧（屋里那侧），手机竖起来朝门外方向，屏幕朝向你自己',
  bed: '躺在床上正常位置，手机放在枕头旁屏幕朝上，指向床头方向',
  stove: '站在灶台前方（你平时做饭站的位置），手机朝向灶台正面',
  mingtang: '站在客厅中央或阳台上，面朝窗外方向，手机指向外面',
  entrance: '站在入户门内侧，面朝屋内方向（你进门后面对的方向），手机指向室内',
}

// 建议测量顺序（7项，5项罗盘 + 2项户型配置）
const RECOMMENDED_ORDER: SceneType[] = ['door', 'entrance', 'bed', 'stove', 'mingtang']

// 下一步建议文案
const NEXT_STEP: Record<SceneType, string> = {
  door: '接下来测「门厅朝向」',
  entrance: '接下来测「床头朝向」',
  bed: '接下来测「灶台朝向」',
  stove: '接下来测「明堂朝向」',
  mingtang: '所有罗盘测量都完成了！',
  general: '建议先选「测大门」开始测量',
}

// 场景名称映射
const SCENE_NAMES: Record<SceneType, string> = {
  door: '大门',
  entrance: '门厅',
  bed: '床向',
  stove: '灶台',
  mingtang: '明堂',
  general: '朝向',
}

export default function CompassPage() {
  const compass = useCompass()
  const { setMeasurement, setActiveTab } = useAppState()

  // 本地状态
  const [scene, setScene] = useState<SceneType>('general')
  const [showCalibrateTip, setShowCalibrateTip] = useState(true)
  const [showPermission, setShowPermission] = useState(false)
  const [showGuide, setShowGuide] = useState(true)

  // 桌面端模拟罗盘
  const [simulatedDegree, setSimulatedDegree] = useState(180)
  const isSimulated = !compass.isSupported || (!compass.heading && compass.permissionState !== 'prompt')

  // 🔒 锁定机制
  const [lockedResults, setLockedResults] = useState<Partial<Record<SceneType, number>>>({})

  // 当前场景是否已锁定
  const isCurrentLocked = lockedResults[scene] !== undefined
  const allKeyScenesMeasured = (['door', 'entrance', 'bed', 'stove', 'mingtang'] as SceneType[]).every(
    s => lockedResults[s] !== undefined
  )

  // 显示用度数
  const displayDegree: number = isCurrentLocked
    ? (lockedResults[scene] ?? 0)
    : (isSimulated ? simulatedDegree : compass.degree)

  // 实时解读
  const displayResult = interpretFengShui(displayDegree, scene)

  // 下一个未测量的关键场景
  const nextScene = RECOMMENDED_ORDER.find(s => lockedResults[s] === undefined)

  // 🔒 锁定当前测量结果
  const handleLockResult = useCallback(() => {
    const currentDegree = isSimulated ? simulatedDegree : compass.degree
    setLockedResults(prev => ({ ...prev, [scene]: currentDegree }))
    setMeasurement(scene, currentDegree)
  }, [scene, compass.degree, isSimulated, simulatedDegree, setMeasurement])

  // 🔓 解锁重新测量
  const handleUnlockResult = useCallback(() => {
    setLockedResults(prev => {
      const next = { ...prev }
      delete next[scene]
      return next
    })
    setShowGuide(true)
  }, [scene])

  // iOS 权限检测
  useEffect(() => {
    if (isIOS() && compass.permissionState === 'prompt') {
      setShowPermission(true)
    }
  }, [compass.permissionState])

  const handlePermission = async () => {
    await compass.requestPermission()
    setShowPermission(false)
    setShowCalibrateTip(true)
  }

  const handleSceneChange = (newScene: SceneType) => {
    setScene(newScene)
    setShowGuide(true)
  }

  return (
    <div className="page compass-page">
      {/* 权限请求 */}
      {showPermission && (
        <div className="permission-overlay">
          <div className="permission-card">
            <div className="permission-icon">🧭</div>
            <h3>需要方向传感器权限</h3>
            <p>风水罗盘需要使用您手机的方向传感器来确定方位。请点击下方按钮授权。</p>
            <button className="btn-primary" onClick={handlePermission}>授权方向传感器</button>
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

      {/* 场景操作指南（未锁定时显示） */}
      {showGuide && !isCurrentLocked && (
        <div className="guide-tip">
          <span>💡 {SCENE_GUIDES[scene]}</span>
          <button className="tip-close" onClick={() => setShowGuide(false)}>✕</button>
        </div>
      )}

      {/* 🔒 锁定成功提示 */}
      {isCurrentLocked && (
        <div className="lock-success-tip">
          ✅ 已锁定！{(lockedResults[scene] ?? 0).toFixed(0)}° — {displayResult.direction.fullName}
        </div>
      )}

      {/* 🎉 全部测完提示 */}
      {allKeyScenesMeasured && (
        <div className="measurement-saved-tip">
          🎉 所有罗盘测量都完成了！去「分析」页填写户型位置，获取完整风水评分
          <button className="btn-primary btn-small" onClick={() => setActiveTab('analysis')}>
            前往分析 →
          </button>
        </div>
      )}

      {/* 模拟罗盘提示 */}
      {isSimulated && !isCurrentLocked && (
        <div className="simulate-tip">
          <span>💻 桌面端演示模式 — 拖动下方滑块选择方向</span>
        </div>
      )}

      {/* 🔒 锁定/解锁按钮 */}
      <div className="lock-actions">
        {!isCurrentLocked ? (
          <button className="btn-primary btn-lock" onClick={handleLockResult}>
            🔒 锁定结果
          </button>
        ) : (
          <button className="btn-secondary btn-lock" onClick={handleUnlockResult}>
            🔓 重新测量
          </button>
        )}
      </div>

      {/* 罗盘区域 */}
      <div className="compass-section">
        <CompassFace degree={displayDegree} size={280} />
        <DirectionDisplay
          direction={displayResult.direction}
          degree={displayDegree}
          sceneLabel={displayResult.sceneLabel}
          rating={displayResult.rating}
          plainSummary={displayResult.plainSummary}
          isActive={compass.isCalibrated || isSimulated}
        />
      </div>

      {/* 桌面端滑块 */}
      {isSimulated && !isCurrentLocked && (
        <div className="simulate-slider">
          <input type="range" min={0} max={359} value={simulatedDegree}
            onChange={e => setSimulatedDegree(Number(e.target.value))} />
          <span>{simulatedDegree.toFixed(0)}°</span>
        </div>
      )}

      {/* 场景按钮 */}
      <SceneButtons
        activeScene={scene}
        onSceneChange={handleSceneChange}
        lockedScenes={new Set(Object.keys(lockedResults) as SceneType[])}
      />

      {/* 大白话解读结果 */}
      <div className="result-card">
        <div className={`result-rating rating-${displayResult.rating}`}>
          {displayResult.ratingText}
        </div>

        <div className="result-plain">
          <p className="result-plain-summary">{displayResult.plainSummary}</p>
        </div>

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

        <div className="result-tips">
          <h4>💡 日常建议</h4>
          <ul>
            {displayResult.plainTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        {displayResult.relatedIssueIds.length > 0 && (
          <div className="result-links">
            <h4>⚠️ 可能相关的问题</h4>
            <button className="btn-secondary btn-small" onClick={() => setActiveTab('solution')}>
              前往化解页面查看 →
            </button>
          </div>
        )}
        {displayResult.relatedWikiIds.length > 0 && (
          <div className="result-links">
            <h4>📚 想了解更多？</h4>
            <button className="btn-secondary btn-small" onClick={() => setActiveTab('wiki')}>
              前往风水百科 →
            </button>
          </div>
        )}

        {/* 🔒 下一步引导 */}
        <div className="result-next-step">
          {isCurrentLocked ? (
            nextScene ? (
              <>
                {NEXT_STEP[scene]}
                <button className="btn-secondary btn-small" onClick={() => handleSceneChange(nextScene)}>
                  测{SCENE_NAMES[nextScene]} →
                </button>
              </>
            ) : (
              <>
                所有罗盘测量都完成了！
                <button className="btn-primary btn-small" onClick={() => setActiveTab('analysis')}>
                  前往分析 →
                </button>
              </>
            )
          ) : (
            '调整好位置后，点击「锁定结果」确认这个方向的测量'
          )}
        </div>
      </div>

      {/* 不支持提示 */}
      {!compass.isSupported && (
        <div className="error-card">
          <p>⚠️ {compass.error}</p>
          <p className="error-sub">当前为桌面端演示模式</p>
        </div>
      )}
    </div>
  )
}
