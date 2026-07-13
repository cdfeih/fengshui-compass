import { useState } from 'react'
import type { FengShuiIssue } from '../data/issues'

interface IssueCardProps {
  issue: FengShuiIssue
}

function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false)

  const severityColors: Record<string, string> = {
    high: '#C41E3A',
    medium: '#D4A84B',
    low: '#8B6914',
  }

  const severityLabels: Record<string, string> = {
    high: '⚠️ 高优先级',
    medium: '⚡ 中优先级',
    low: '📌 低优先级',
  }

  return (
    <div className={`issue-card severity-${issue.severity}`}>
      <div className="issue-header" onClick={() => setExpanded(!expanded)}>
        <div className="issue-left">
          <span className="issue-icon">{issue.icon}</span>
          <div className="issue-info">
            <h4>{issue.name}</h4>
            <span className="issue-category">{issue.category}</span>
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
          <p className="issue-desc">{issue.description}</p>

          <div className="issue-impact">
            <strong>影响：</strong>{issue.impact}
          </div>

          <div className="issue-solutions">
            <strong>化解方法：</strong>
            <ol>
              {issue.solutions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          {issue.items.length > 0 && (
            <div className="issue-items">
              <strong>所需物品：</strong>
              <div className="item-tags">
                {issue.items.map((item, i) => (
                  <span key={i} className="item-tag">{item}</span>
                ))}
              </div>
            </div>
          )}
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

  const categories = Array.from(new Set(issues.map(i => i.category)))

  const filtered = issues.filter(i => {
    if (filter !== 'all' && i.severity !== filter) return false
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="page solution-page">
      <h2>风水问题化解</h2>
      <p className="page-desc">常见风水问题的识别和化解方法</p>

      {/* 过滤器 */}
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">严重程度：</span>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'high' ? '高' : f === 'medium' ? '中' : '低'}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">分类：</span>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">全部</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 问题列表 */}
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
