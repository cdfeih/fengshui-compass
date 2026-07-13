import { useState } from 'react'
import type { WikiArticle } from '../data/wiki'

interface WikiCardProps {
  article: WikiArticle
}

function WikiCard({ article }: WikiCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`wiki-card ${expanded ? 'expanded' : ''}`}>
      <div className="wiki-header" onClick={() => setExpanded(!expanded)}>
        <span className="wiki-icon">{article.icon}</span>
        <div className="wiki-info">
          <h4>{article.title}</h4>
          <p className="wiki-summary">{article.summary}</p>
        </div>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="wiki-body">
          <div className="wiki-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }} />
          <div className="wiki-tags">
            {article.tags.map(tag => (
              <span key={tag} className="wiki-tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 简单的 Markdown 格式化（转为HTML）
function formatMarkdown(md: string): string {
  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^## (.+)$/gm, '<h4>$1</h4>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 表格
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim())
      if (cells.every(c => /^-+$/.test(c.trim()))) return '' // 分隔行
      const isHeader = line.includes('---') === false
      const tag = isHeader ? 'th' : 'td'
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    // 无序列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 段落
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

  // 包裹表格
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, (match) => {
    if (match.includes('<th>')) return `<table>${match}</table>`
    return match
  })

  // 包裹列表
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  return html
}

interface WikiProps {
  articles: WikiArticle[]
}

export default function Wiki({ articles }: WikiProps) {
  const [search, setSearch] = useState('')

  const filtered = articles.filter(a =>
    !search || a.title.includes(search) || a.summary.includes(search) ||
    a.tags.some(t => t.includes(search))
  )

  return (
    <div className="page wiki-page">
      <h2>风水知识百科</h2>
      <p className="page-desc">通俗易懂的风水基础知识，每个人都能学会</p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="搜索风水知识..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="wiki-list">
        {filtered.map(article => (
          <WikiCard key={article.id} article={article} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>没有找到相关内容</p>
        </div>
      )}

      <div className="disclaimer">
        <p>⚠️ 免责声明：本应用的风水知识仅供学习参考，不构成专业风水建议。重大风水决策请咨询专业风水师。</p>
      </div>
    </div>
  )
}
