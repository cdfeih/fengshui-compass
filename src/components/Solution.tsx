import { useState } from 'react'
import type { FengShuiIssue } from '../data/issues'

interface IssueCardProps {
  issue: FengShuiIssue
  highlight?: boolean
}

function IssueCard({ issue, highlight }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false)

  const severityColors: Record<string, string> = {
    high: '#C41E3A',
    medium: '#D4A84B',
    low: '#8B6914',
  }

  const severityLabels: Record<string, string> = {
    high: '很重要，赶紧处理',
    medium: '中等重要，建议处理',
    low: '影响不大，有空可以处理',
  }

  return (
    <div className={`issue-card severity-${issue.severity} ${highlight ? 'highlighted' : ''}`} id={`solution-${issue.id}`}>
      <div className="issue-header" onClick={() => setExpanded(!expanded)}>
        <div className="issue-left">
          <span className="issue-icon">{issue.icon}</span>
          <div className="issue-info">
            {/* 大白话名称优先 */}
            <h4>{issue.namePlain}</h4>
            <span className="issue-category-plain">{issue.categoryPlain}</span>
          </div>
        </div>
        <div className="issue-right">
          <span className="issue-severity" style={{ color: severityColors[issue.severity] }}>
            {severityLabels[issue.severity]}
          </span>
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </div>

      {expanded && (
        <div className="issue-body">
          {/* 大白话描述优先 */}
          <p className="issue-desc-plain">{issue.descriptionPlain}</p>

          <div className="issue-impact-plain">
            <strong>会有什么影响：</strong>{issue.impactPlain}
          </div>

          {/* 大白话化解方法 */}
          <div className="issue-solutions">
            <strong>怎么化解：</strong>
            <ol>
              {issue.solutionsPlain.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          {issue.items.length > 0 && (
            <div className="issue-items">
              <strong>需要准备的物品：</strong>
              <div className="item-tags">
                {issue.items.map((item, i) => (
                  <span key={i} className="item-tag">{item}</span>
                ))}
              </div>
            </div>
          )}

          {/* 专业术语版折叠 */}
          <div className="issue-detail-toggle">
            <button className="toggle-btn" onClick={() => {
              const el = document.getElementById(`issue-detail-${issue.id}`)
              if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
            }}>
              查看专业解读 ▼
            </button>
          </div>
          <div id={`issue-detail-${issue.id}`} style={{ display: 'none' }}>
            <p className="issue-desc">{issue.description}</p>
            <div className="issue-impact">
              <strong>专业解读：</strong>{issue.impact}
            </div>
            <div className="issue-solutions">
              <strong>专业化解方案：</strong>
              <ol>
                {issue.solutions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SolutionProps {
  issues: FengShuiIssue[]
}

export default function Solution({ issues }: SolutionProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = Array.from(new Set(issues.map(i => i.categoryPlain)))

  const filtered = issues.filter(i => {
    if (filter !== 'all' && i.severity !== filter) return false
    if (categoryFilter !== 'all' && i.categoryPlain !== categoryFilter) return false
    return true
  })

  const filterLabels: Record<string, string> = {
    all: '全部',
    high: '重要',
    medium: '中等',
    low: '轻微',
  }

  return (
    <div className="page solution-page">
      <h2>风水问题化解</h2>
      <p className="page-desc">常见问题的识别和化解方法，大白话解说，每个人都能看懂</p>

      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">重要程度：</span>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {filterLabels[f]}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">分类：</span>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">全部</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="issue-list">
        {filtered.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>没有匹配的问题</p>
        </div>
      )}
    </div>
  )
}
