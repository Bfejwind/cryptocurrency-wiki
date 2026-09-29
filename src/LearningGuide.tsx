import { ArrowLeft, ArrowRight, BookOpen, Clock3, ExternalLink, ShieldAlert } from 'lucide-react'
import './LearningGuide.css'
import { learningStages as stages } from './learningData'

const tools = [
  { name: 'TradingView', url: 'https://www.tradingview.com/chart/', description: 'Charts, drawing tools, and market indicators.' },
  { name: 'CoinGecko', url: 'https://www.coingecko.com/', description: 'Asset listings, supply data, and market comparisons.' },
  { name: 'DefiLlama', url: 'https://defillama.com/', description: 'DeFi protocol and chain-level analytics.' },
]

export default function LearningGuide() {
  return (
    <div className="guide-shell">
      <header className="guide-topbar">
        <a className="wordmark" href="/" aria-label="Cryptocurrency.Wiki home"><span className="brand-mark">cw</span><span>cryptocurrency<span className="wordmark-light">.wiki</span></span></a>
        <a className="guide-return" href="/"><ArrowLeft size={15} /> Back to the encyclopedia</a>
      </header>
      <main className="guide-main">
        <section className="guide-hero">
          <span className="guide-eyebrow">A PRACTICAL STUDY PATH</span>
          <h1>Learn crypto.<br /><em>Build your own framework.</em></h1>
          <p>Start with networks and custody, work through market mechanics, then study risk and advanced analysis. Move at your own pace; no purchase is required to learn.</p>
          <div className="guide-meta"><span><BookOpen size={14} /> 8 stages</span><span><Clock3 size={14} /> Self-paced</span><span>Beginner to advanced</span></div>
        </section>

        <nav className="guide-toc" aria-label="Guide contents">
          <span className="guide-toc-label">ON THIS PAGE</span>
          {stages.map((stage, index) => <a href={`#${stage.id}`} key={stage.id}><span>{String(index + 1).padStart(2, '0')}</span>{stage.title}</a>)}
          <a href="#toolkit"><span>09</span>Research toolkit</a>
        </nav>

        <div className="guide-notice"><ShieldAlert size={17} /><p><strong>Education, not a trading signal.</strong> Crypto markets are volatile and losses can be substantial. This guide explains concepts and practice methods; it does not recommend buying, selling, or using leverage.</p></div>

        <div className="guide-stages">
          {stages.map((stage, index) => <section className="guide-stage" id={stage.id} key={stage.id}>
            <div className="guide-stage-index"><span>{String(index + 1).padStart(2, '0')}</span><span>{stage.level}</span></div>
            <div className="guide-stage-content">
              <h2>{stage.title}</h2>
              <p className="guide-stage-summary">{stage.summary}</p>
              <div className="guide-stage-columns">
                <div className="guide-learning-block"><h3>What to learn</h3><ul>{stage.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></div>
                <div className="guide-practice-block"><h3>Practice</h3><p>{stage.practice}</p><div className="guide-checkpoint"><strong>Checkpoint</strong><span>{stage.checkpoint}</span></div></div>
              </div>
              <a className="guide-stage-link" href={`/learn/${stage.id}`}><BookOpen size={14} /> Open full lesson <ArrowRight size={14} /></a>
            </div>
          </section>)}
        </div>

        <section className="guide-toolkit" id="toolkit">
          <div><span className="guide-eyebrow">REFERENCE TOOLS</span><h2>Continue your research</h2><p>Use several sources and check what each metric actually measures. Tool links are for research, not endorsements.</p></div>
          <div className="guide-tool-list">{tools.map((tool) => <a href={tool.url} key={tool.name} target="_blank" rel="noreferrer"><span><strong>{tool.name}</strong><small>{tool.description}</small></span><ExternalLink size={15} /></a>)}</div>
        </section>
        <footer className="guide-footer"><a href="/">Cryptocurrency.Wiki</a><span>Independent educational resource · Not financial advice</span></footer>
      </main>
    </div>
  )
}
