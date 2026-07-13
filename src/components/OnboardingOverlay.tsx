import { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'fengshui-compass-onboarded'

const STEPS = [
  {
    icon: '1',
    title: '第一步：测大门',
    desc: '打开罗盘，选择"测大门"，站在入户门内侧，手机朝门外方向测量。这能告诉你家大门朝向好不好。',
    tip: '大门朝向是风水的基础，决定了全家的运势基调',
  },
  {
    icon: '2',
    title: '第二步：测床头',
    desc: '躺在床上，选"测床向"，手机放在枕头旁边指向床头方向。床头朝向直接影响你的睡眠质量。',
    tip: '睡不好？可能是床头朝向的问题',
  },
  {
    icon: '3',
    title: '第三步：看分析',
    desc: '切换到"分析"页面，输入你家房子的基本信息（楼层、朝向、户型等），系统会给你一个风水评分和具体建议。',
    tip: '不想花钱请风水师？自己就能做基本判断',
  },
]

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDING_KEY)
    if (!onboarded) {
      setVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem(ONBOARDING_KEY, '1')
      setVisible(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-step-icon">{current.icon}</div>
        <h3 className="onboarding-title">{current.title}</h3>
        <p className="onboarding-desc">{current.desc}</p>
        <p className="onboarding-tip">💡 {current.tip}</p>

        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`progress-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          {step < STEPS.length - 1 && (
            <button className="btn-secondary" onClick={handleSkip}>
              跳过
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {step === STEPS.length - 1 ? '开始使用' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
