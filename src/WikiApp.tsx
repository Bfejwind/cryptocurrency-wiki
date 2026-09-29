import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Command, ExternalLink, FilePenLine, Globe2, Layers3, Menu, Newspaper, Search, Settings2, ShieldCheck, Sparkles, X } from 'lucide-react'
import './WikiApp.css'

type Article = { id: string; title: string; category: string; level: string; intro: string; body: string[]; updated: string; read: string }
type Proposal = { id: string; articleId: string; title: string; intro: string; source: string; origin: 'AI' | 'Community'; created: string }
type Coin = { id: string; symbol: string; name: string; image?: string; current_price: number; price_change_percentage_24h: number; market_cap_rank: number }
type News = { title: string; link: string; author?: string; source?: string }

const starterArticles: Article[] = [
  { id: 'bitcoin', title: 'Bitcoin', category: 'Cryptocurrencies', level: 'Beginner', intro: 'A peer-to-peer digital currency secured by a distributed network, with a fixed issuance schedule and no central operator.', body: ['Bitcoin is an open-source monetary network introduced in 2009. Transactions are recorded on a public blockchain and grouped into blocks.', 'The network uses proof of work: miners compete to add valid blocks, while full nodes independently check the rules. New bitcoin issuance halves roughly every four years, until the supply approaches 21 million.'], updated: 'Sep 28, 2026', read: '8 min' },
  { id: 'ethereum', title: 'Ethereum', category: 'Cryptocurrencies', level: 'Beginner', intro: 'A programmable blockchain for applications and digital assets, maintained by a global network of validators.', body: ['Ethereum is a public blockchain whose native asset is ether (ETH). It executes smart contracts, small programs that run according to published rules.', 'Since its transition to proof of stake in 2022, validators stake ETH to help propose and attest to blocks. Many transactions happen on layer 2 networks that settle data back to Ethereum.'], updated: 'Sep 27, 2026', read: '10 min' },
  { id: 'stablecoins', title: 'Stablecoins', category: 'Cryptocurrencies', level: 'Beginner', intro: 'Tokens designed to track an external value, most often a national currency such as the US dollar.', body: ['Stablecoins can be backed by cash and short-term assets, crypto collateral, or a mechanism that attempts to balance supply and demand.', 'A target price is not a guarantee. Users should check redemption terms, reserve disclosures, issuer jurisdiction, and the risks of the blockchain used to transfer a token.'], updated: 'Sep 25, 2026', read: '7 min' },
  { id: 'consensus', title: 'Consensus mechanisms', category: 'Blockchain', level: 'Intermediate', intro: 'The rules and incentives that let independent computers agree on one transaction history.', body: ['A consensus protocol determines how blocks are proposed, checked, and finalized. Proof of work and proof of stake are two widely used approaches.', 'Every design makes trade-offs across security assumptions, performance, energy use, and who can participate. A protocol’s name alone is not a complete security assessment.'], updated: 'Sep 24, 2026', read: '11 min' },
  { id: 'wallets', title: 'Crypto wallets', category: 'Security & Wallets', level: 'Beginner', intro: 'Tools for managing the keys that authorize blockchain transactions; assets themselves remain recorded on the network.', body: ['A wallet creates and stores private keys, then uses them to sign transactions. A recovery phrase can restore access, so anyone who obtains it may control the funds.', 'Software wallets are convenient for frequent use. Hardware wallets isolate keys from an internet-connected device. Neither can reverse a transaction sent to the wrong address.'], updated: 'Sep 23, 2026', read: '9 min' },
  { id: 'smart-contracts', title: 'Smart contracts', category: 'Blockchain', level: 'Intermediate', intro: 'Programs deployed to a blockchain that execute when their conditions are met.', body: ['Smart contracts can custody tokens, enforce permissions, and coordinate actions without a traditional server operator. Their state transitions are visible to the network.', 'Code can contain bugs, and an immutable deployment may be difficult to repair. Audits reduce some risks but do not guarantee a contract is safe.'], updated: 'Sep 21, 2026', read: '8 min' },
  { id: 'defi', title: 'Decentralized finance (DeFi)', category: 'DeFi & Applications', level: 'Intermediate', intro: 'Financial services built from blockchain applications and smart contracts that users can interact with directly.', body: ['DeFi includes decentralized exchanges, lending markets, and other on-chain services. Users generally connect a wallet and authorize each action themselves.', 'Risks include smart-contract failure, collateral liquidation, oracle errors, governance changes, and liquidity loss. On-chain availability does not make a product regulated or risk-free.'], updated: 'Sep 19, 2026', read: '12 min' },
  { id: 'nfts', title: 'Non-fungible tokens (NFTs)', category: 'DeFi & Applications', level: 'Beginner', intro: 'Unique token identifiers recorded on a blockchain, often used to represent ownership or membership.', body: ['NFTs are distinct from interchangeable tokens such as ether. A token may point to metadata or media stored elsewhere, and the token does not automatically transfer copyright.', 'Before purchasing, inspect the contract, token metadata, creator terms, and marketplace rules. Prices and liquidity can change sharply.'], updated: 'Sep 18, 2026', read: '6 min' },
  { id: 'exchanges', title: 'Crypto exchanges', category: 'Markets & Exchanges', level: 'Beginner', intro: 'Services that help people trade digital assets, from custodial platforms to on-chain markets.', body: ['A centralized exchange typically holds customer assets and maintains an internal order book. A decentralized exchange can match trades through blockchain programs instead.', 'Compare custody, fees, supported regions, withdrawal policies, security history, and proof-of-reserves methodology. An exchange account is not the same as a self-custody wallet.'], updated: 'Sep 16, 2026', read: '9 min' },
]
const categories = [
  { name: 'All topics', count: 248, icon: Globe2 }, { name: 'Cryptocurrencies', count: 64, icon: Layers3 }, { name: 'Blockchain', count: 42, icon: Command }, { name: 'DeFi & Applications', count: 38, icon: Sparkles }, { name: 'Security & Wallets', count: 31, icon: ShieldCheck }, { name: 'Markets & Exchanges', count: 27, icon: Newspaper }, { name: 'Guides', count: 46, icon: BookOpen },
]
const starterCoins: Coin[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 1 }, { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 2 }, { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 0, price_change_percentage_24h: 0, market_cap_rank: 3 }, { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1, price_change_percentage_24h: 0, market_cap_rank: 4 },
]
const exampleProposals: Proposal[] = [
  { id: 'example-1', articleId: 'ethereum', title: 'Ethereum', intro: 'A programmable blockchain for applications and digital assets, maintained by validators who stake ETH. The network supports a growing ecosystem of layer 2 rollups.', source: 'Example editorial suggestion', origin: 'Community', created: '12 min ago' },
  { id: 'example-2', articleId: 'wallets', title: 'Crypto wallets', intro: 'Tools for managing the keys that authorize blockchain transactions. A wallet signs instructions; the assets remain recorded on the network.', source: 'Example editorial suggestion', origin: 'Community', created: '1 hr ago' },
]
const saved = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}
const money = (value: number) => value >= 1000 ? `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`

export default function WikiApp() {
  const [articles, setArticles] = useState<Article[]>(() => saved('cw-articles', starterArticles))
  const [proposals, setProposals] = useState<Proposal[]>(() => saved('cw-proposals', exampleProposals))
  const [coins, setCoins] = useState<Coin[]>(starterCoins)
  const [news, setNews] = useState<News[]>([])
  const [newsSource, setNewsSource] = useState('')
  const [category, setCategory] = useState('All topics')
  const [query, setQuery] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [editTarget, setEditTarget] = useState<Article | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [aiModel, setAiModel] = useState('gpt-4o-mini')
  const [marketStatus, setMarketStatus] = useState<'loading' | 'live' | 'sample'>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Loading sources')
  const [notice, setNotice] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { localStorage.setItem('cw-articles', JSON.stringify(articles)) }, [articles])
  useEffect(() => { localStorage.setItem('cw-proposals', JSON.stringify(proposals)) }, [proposals])

  async function checkAiStatus(showNotice = false) {
    try {
      const response = await fetch('/api/status')
      if (!response.ok) throw new Error('API status unavailable')
      const status = await response.json() as { aiConfigured?: boolean; model?: string }
      setAiConfigured(Boolean(status.aiConfigured))
      setAiModel(status.model || 'gpt-4o-mini')
      if (showNotice) setNotice(status.aiConfigured ? `AI is ready (${status.model || 'configured model'}).` : 'AI is not configured. Add OPENAI_API_KEY to .env and restart.')
    } catch {
      setAiConfigured(false)
      if (showNotice) setNotice('Could not reach the local research API.')
    }
  }

  async function refreshResearch(makeDraft = false) {
    setRefreshing(true)
    const outcomes = await Promise.allSettled([
      fetch('/api/market').then((response) => { if (!response.ok) throw new Error('Market feed unavailable'); return response.json() as Promise<Coin[]> }),
      fetch('/api/news').then((response) => { if (!response.ok) throw new Error('News feed unavailable'); return response.json() as Promise<{ items?: News[]; source?: string }> }),
    ])
    let freshHeadlines: News[] = []
    if (outcomes[0].status === 'fulfilled' && outcomes[0].value.length) { setCoins(outcomes[0].value); setMarketStatus('live') }
    else { setMarketStatus('sample') }
    if (outcomes[1].status === 'fulfilled') { freshHeadlines = outcomes[1].value.items ?? []; setNews(freshHeadlines.slice(0, 4)); setNewsSource(outcomes[1].value.source ?? 'Crypto news') }
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    if (makeDraft && !aiConfigured) {
      setSettingsOpen(true)
      setNotice('AI is not configured. Add OPENAI_API_KEY to .env and restart.')
    } else if (makeDraft && freshHeadlines.length) {
      try {
        const response = await fetch('/api/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articles: articles.map((article) => ({ title: article.title })), headlines: freshHeadlines }) })
        const draft = await response.json() as { title?: string; summary?: string; source?: string; error?: string }
        if (!response.ok) throw new Error(draft.error || 'AI request failed.')
        const match = articles.find((article) => article.title.toLowerCase() === draft.title?.toLowerCase()) ?? articles[0]
        if (draft.summary && match) {
          setProposals((current) => [{ id: crypto.randomUUID(), articleId: match.id, title: match.title, intro: draft.summary!, source: draft.source ?? newsSource, origin: 'AI', created: 'Just now' }, ...current])
          setNotice('AI draft added to the review queue. Nothing was published.')
        }
      } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not generate an AI draft.') }
    } else if (makeDraft) { setNotice('No source headlines were available for an AI draft.') }
    else if (outcomes.some((outcome) => outcome.status === 'fulfilled')) { setNotice('Source refresh complete.') }
    else { setNotice('Live sources could not be reached. Showing the reference library.') }
    setRefreshing(false)
  }

  const refreshOnSchedule = useEffectEvent(() => { void checkAiStatus(); void refreshResearch() })
  useEffect(() => {
    const initial = window.setTimeout(() => refreshOnSchedule(), 0)
    const timer = window.setInterval(() => refreshOnSchedule(), 10 * 60 * 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [])
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchExpanded(false)
        ;(document.activeElement as HTMLElement | null)?.blur()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const visibleArticles = useMemo(() => articles.filter((article) => (category === 'All topics' || article.category === category || (category === 'Guides' && article.level === 'Beginner')) && `${article.title} ${article.intro} ${article.category}`.toLowerCase().includes(query.toLowerCase())), [articles, category, query])

  function saveSuggestion(title: string, intro: string, source: string) {
    if (!editTarget || !title.trim() || !intro.trim()) return
    setProposals((current) => [{ id: crypto.randomUUID(), articleId: editTarget.id, title: title.trim(), intro: intro.trim(), source: source.trim() || 'Community contribution', origin: 'Community', created: 'Just now' }, ...current])
    setEditTarget(null)
    setNotice('Suggestion sent to the review queue.')
  }

  function reviewProposal(proposal: Proposal, publish: boolean) {
    if (publish) setArticles((current) => current.map((article) => article.id === proposal.articleId ? { ...article, title: proposal.title, intro: proposal.intro, updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : article))
    setProposals((current) => current.filter((item) => item.id !== proposal.id))
    setNotice(publish ? 'Edit approved and published.' : 'Suggestion dismissed.')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" title="Toggle navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={19} /></button>
        <a className="wordmark" href="#home" onClick={() => { setCategory('All topics'); setQuery('') }}><span className="brand-mark">cw</span><span>cryptocurrency<span className="wordmark-light">.wiki</span></span></a>
        <div className={`searchbox ${searchExpanded ? 'search-expanded' : ''}`}><button className="search-trigger icon-button" aria-label="Open search" onClick={() => { setSearchExpanded(true); window.setTimeout(() => document.getElementById('encyclopedia-search')?.focus(), 0) }}><Search size={17} /></button><input id="encyclopedia-search" aria-label="Search the encyclopedia" placeholder="Search the encyclopedia..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="top-actions"><span className="independent"><span /> Independent resource</span><button className="settings-button" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /><span>AI settings</span></button></div>
      </header>
      <div className="workspace">
        <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
          <div className="side-label">THE LIBRARY</div>
          <nav className="category-nav" aria-label="Article categories">{categories.map(({ name, count, icon: Icon }) => <button className={`nav-item ${category === name ? 'nav-active' : ''}`} key={name} onClick={() => { setCategory(name); setMobileNavOpen(false) }}><Icon size={17} strokeWidth={1.8} /><span>{name}</span><span className="nav-count">{count}</span></button>)}</nav>
          <div className="side-divider" /><div className="side-label">THE DESK</div>
          <button className="nav-item" onClick={() => document.getElementById('review-desk')?.scrollIntoView({ behavior: 'smooth' })}><FilePenLine size={17} /><span>Review queue</span><span className="nav-count queue-count">{proposals.length}</span></button>
          <button className="nav-item" onClick={() => document.getElementById('newsroom')?.scrollIntoView({ behavior: 'smooth' })}><Clock3 size={17} /><span>Recent changes</span></button>
          <div className="sidebar-note"><div className="note-icon"><ShieldCheck size={16} /></div><p>Independent by design.</p><span>Educational reference, not financial advice.</span></div>
          <div className="sidebar-foot"><span className="foot-dot" /> Sources checked {lastUpdated}</div>
        </aside>
        <main className="main-content" id="home">
          <div className="eyebrow"><span className="eyebrow-mark">CW</span> THE OPEN CRYPTO ENCYCLOPEDIA <span className="eyebrow-rule" /></div>
          <section className="intro-row"><div><h1>Understand the<br /><em>whole chain.</em></h1><p className="intro-copy">An independent guide to the technology, people, and ideas changing money.</p></div><div className="intro-aside"><span className="asterisk">✳</span><span>Curious minds<br />welcome here.</span></div></section>
          <section className="market-strip" aria-label="Cryptocurrency market overview"><div className="market-heading"><span className="live-indicator" /><span>MARKET PULSE</span><span className="market-caption">{marketStatus === 'live' ? 'LIVE · USD' : marketStatus === 'loading' ? 'CONNECTING' : 'SAMPLE · USD'}</span></div><div className="coin-row">{coins.slice(0, 4).map((coin, index) => <div className="coin-item" key={coin.id}><div className={`coin-icon coin-${index}`}>{coin.image ? <img src={coin.image} alt="" /> : coin.symbol.slice(0, 1).toUpperCase()}</div><div className="coin-info"><span className="coin-name">{coin.symbol.toUpperCase()} <small>{coin.name}</small></span><strong>{coin.current_price ? money(coin.current_price) : '—'}</strong></div><span className={`coin-change ${coin.price_change_percentage_24h < 0 ? 'negative' : ''}`}>{coin.current_price ? <>{coin.price_change_percentage_24h < 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</> : '···'}</span></div>)}</div><button className="refresh-button" title="Refresh market and news sources" onClick={() => void refreshResearch()} disabled={refreshing}>{refreshing ? <span className="spinner" /> : <ArrowRight size={15} />}{refreshing ? 'Updating' : 'Refresh'}</button></section>
          <div className="content-grid">
            <section className="library-column">
              <div className="section-heading"><div><span className="section-kicker">A PLACE TO BEGIN</span><h2>{query ? 'Search results' : category === 'All topics' ? 'Start with the essentials' : category}</h2></div><button className="text-link" onClick={() => { setCategory('All topics'); setQuery('') }}>Browse all <ArrowRight size={15} /></button></div>
              {visibleArticles.length === 0 ? <div className="empty-state">No entries match that search yet. Try another term.</div> : <div className="article-grid">{visibleArticles.slice(0, 6).map((article, index) => <button className={`article-card article-card-${index % 3}`} key={article.id} onClick={() => setActiveArticle(article)}><div className="article-card-top"><span className="article-category">{article.category}</span><ArrowRight size={16} /></div><h3>{article.title}</h3><p>{article.intro}</p><div className="article-meta"><span>{article.level}</span><span className="meta-dot" /><span>{article.read} read</span></div></button>)}</div>}
              <section className="featured-band"><div className="feature-copy"><span className="section-kicker">FIELD GUIDE · 01</span><h2>Start with the<br /><em>building blocks.</em></h2><p>From blocks and keys to markets and protocols: clear explanations, built one idea at a time.</p><button className="dark-button" onClick={() => { setCategory('Blockchain'); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore the guide <ArrowRight size={15} /></button></div><div className="chain-art" aria-hidden="true"><div className="chain-orbit orbit-one" /><div className="chain-orbit orbit-two" /><div className="chain-core">⛓</div><span className="chain-node node-one">01</span><span className="chain-node node-two">02</span><span className="chain-node node-three">03</span><span className="chain-tag">BLOCKCHAIN / 101</span></div></section>
              <section className="news-section" id="newsroom"><div className="section-heading news-heading"><div><span className="section-kicker">FROM THE WIRES</span><h2>Industry, in context</h2></div><span className="source-label">{news.length ? newsSource.toUpperCase() : 'REFERENCE DESK'}</span></div>{news.length ? <div className="news-list">{news.slice(0, 4).map((item, index) => <a className="news-item" href={item.link} key={`${item.link}-${index}`} target="_blank" rel="noreferrer"><span className="news-index">0{index + 1}</span><span className="news-title">{item.title}</span><span className="news-source">{item.source || newsSource} <ExternalLink size={12} /></span></a>)}</div> : <div className="news-empty"><Newspaper size={17} /><span>Refresh to fetch current industry coverage. Headlines are treated as sources, not encyclopedia facts.</span></div>}</section>
            </section>
            <aside className="desk-column">
              <section className="review-panel" id="review-desk"><div className="panel-head"><div><span className="section-kicker">EDITORIAL DESK</span><h2>Proposed edits <span className="proposal-count">{proposals.length}</span></h2></div><button className="panel-menu icon-button" title="AI settings" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /></button></div><p className="panel-description">Every update gets a human read before it enters the library.</p><button className="draft-ai-button" onClick={() => void refreshResearch(true)} disabled={refreshing}><Sparkles size={14} /> Draft from latest news</button>{proposals.length ? <div className="proposal-list">{proposals.map((proposal) => <article className="proposal-card" key={proposal.id}><div className="proposal-top"><span className={`origin-tag ${proposal.origin === 'AI' ? 'origin-ai' : ''}`}>{proposal.origin === 'AI' ? <Sparkles size={11} /> : <FilePenLine size={11} />}{proposal.origin} PROPOSAL</span><span className="proposal-time">{proposal.created}</span></div><h3>{proposal.title}</h3><p>{proposal.intro}</p><div className="proposal-source">Source: {proposal.source}</div><div className="proposal-actions"><button className="approve-button" onClick={() => reviewProposal(proposal, true)}><Check size={14} /> Approve</button><button className="dismiss-button" onClick={() => reviewProposal(proposal, false)}>Dismiss</button></div></article>)}</div> : <div className="queue-empty"><Check size={19} /><span>The desk is clear.</span></div>}<button className="submit-edit" onClick={() => setEditTarget(articles[0] ?? null)}><FilePenLine size={15} /> Suggest an edit</button></section>
              <section className="quick-panel"><div className="quick-heading"><span className="section-kicker">REFERENCE, NOT HYPE</span><span className="quick-star">✳</span></div><p>Understand the mechanism. Check the source. Make your own call.</p><div className="quick-rule" /><span className="quick-caption">INDEPENDENT · EDUCATIONAL · OPEN</span></section>
              <section className="recent-panel"><div className="recent-heading"><span className="section-kicker">RECENTLY REVISED</span><button title="Refresh sources" onClick={() => void refreshResearch()}><Clock3 size={15} /></button></div>{articles.slice(0, 4).map((article) => <button className="recent-row" key={article.id} onClick={() => setActiveArticle(article)}><span className="recent-bullet" /><span>{article.title}</span><time>{article.updated.replace(', 2026', '')}</time></button>)}</section>
              <div className="ai-status"><span className={`ai-status-dot ${aiConfigured ? 'configured' : ''}`} /><span>{aiConfigured ? 'AI research ready' : 'AI not configured'}</span><button onClick={() => setSettingsOpen(true)}>{aiConfigured ? 'Manage' : 'Set up'} <ArrowRight size={13} /></button></div>
            </aside>
          </div>
          <footer className="page-footer"><span>cryptocurrency.wiki <span className="footer-dot">·</span> Independent educational resource</span><span>Information only. Not financial advice.</span></footer>
        </main>
      </div>
      {notice && <div className="toast" role="status">{notice}<button title="Dismiss" onClick={() => setNotice('')}><X size={14} /></button></div>}
      {activeArticle && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveArticle(null) }}><article className="article-modal"><button className="modal-close icon-button" title="Close article" onClick={() => setActiveArticle(null)}><X size={18} /></button><span className="section-kicker">{activeArticle.category.toUpperCase()} · {activeArticle.level.toUpperCase()}</span><h2>{activeArticle.title}</h2><p className="modal-lead">{activeArticle.intro}</p>{activeArticle.body.map((paragraph) => <p className="modal-body" key={paragraph}>{paragraph}</p>)}<div className="modal-meta">Updated {activeArticle.updated} <span>·</span> {activeArticle.read} read</div><button className="dark-button" onClick={() => { setEditTarget(activeArticle); setActiveArticle(null) }}><FilePenLine size={15} /> Suggest an edit</button></article></div>}
      {editTarget && <SuggestionModal article={editTarget} onClose={() => setEditTarget(null)} onSubmit={saveSuggestion} />}
      {settingsOpen && <SettingsModal configured={aiConfigured} model={aiModel} onClose={() => setSettingsOpen(false)} onCheck={() => void checkAiStatus(true)} />}
    </div>
  )
}

function SuggestionModal({ article, onClose, onSubmit }: { article: Article; onClose: () => void; onSubmit: (title: string, intro: string, source: string) => void }) {
  const [title, setTitle] = useState(article.title)
  const [intro, setIntro] = useState(article.intro)
  const [source, setSource] = useState('')
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><form className="form-modal" onSubmit={(event) => { event.preventDefault(); onSubmit(title, intro, source) }}><button type="button" className="modal-close icon-button" title="Close form" onClick={onClose}><X size={18} /></button><span className="section-kicker">CONTRIBUTE TO THE LIBRARY</span><h2>Suggest an edit</h2><p className="form-intro">Your suggestion will be reviewed before publication.</p><label>Entry title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Proposed summary<textarea value={intro} onChange={(event) => setIntro(event.target.value)} rows={4} required /></label><label>Source link or citation<input value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://..." /></label><button className="dark-button form-submit" type="submit">Send for review <ArrowRight size={15} /></button></form></div>
}

function SettingsModal({ configured, model, onClose, onCheck }: { configured: boolean; model: string; onClose: () => void; onCheck: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-modal settings-modal"><button type="button" className="modal-close icon-button" title="Close settings" onClick={onClose}><X size={18} /></button><span className="section-kicker">RESEARCH AUTOMATION</span><h2>AI settings</h2><p className="form-intro">Market and news sources refresh automatically every 10 minutes. AI drafts are created on demand and always go to editorial review.</p><div className="security-note"><ShieldCheck size={16} /><span>{configured ? `AI draft generation is enabled with ${model}.` : 'Add OPENAI_API_KEY to your .env file, then restart the app to enable AI drafts.'} The key stays on the server and is never sent to the browser.</span></div><button className="dark-button form-submit" type="button" onClick={onCheck}>Check AI connection <ArrowRight size={15} /></button></section></div>
}
