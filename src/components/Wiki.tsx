import { useState } from 'react'
import type { WikiArticle } from '../data/wiki'

interface WikiCardProps {
  article: WikiArticle
}

function WikiCard({ article }: WikiCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`wiki-card ${expanded ? 'expanded' : ''}`} id={`wiki-${article.id}`}>
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
    .replace(/^### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^## (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim())
      if (cells.every(c => /^-+$/.test(c.trim()))) return ''
      const tag = 'td'
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, (match) => {
    if (match.includes('<th>')) return `<table>${match}</table>`
    return match
  })

  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  return html
}

interface WikiProps {
  articles: WikiArticle[]
}

// 推荐百科卡片（从其他页面跳过来时的推荐）
function RecommendedArticles({ articles }: { articles: WikiArticle[] }) {
  if (articles.length === 0) return null

  return (
    <div className="wiki-recommended">
      <h4>📌 为你推荐</h4>
      <div className="recommended-list">
        {articles.map(a => (
          <div key={a.id} className="recommended-card" id={`wiki-${a.id}`} onClick={() => {
            // 滚动到对应卡片
            const el = document.getElementById(`wiki-${a.id}`)
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}>
            <span className="rec-icon">{a.icon}</span>
            <span className="rec-title">{a.title}</span>
            <span className="rec-summary">{a.summary}</span>
          </div>
        ))}
      </div>
    </div>
  )
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

      {/* 入门推荐 */}
      <RecommendedArticles articles={articles.filter(a => a.tags.includes('入门') || a.tags.includes('基础'))} />

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
