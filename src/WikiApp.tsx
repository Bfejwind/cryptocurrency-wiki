import logo from '../images/logo.png'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Clock3, Command, ExternalLink, Globe2, Layers3, Menu, Newspaper, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import './WikiApp.css'

type Article = { id: string; title: string; category: string; level: string; intro: string; body: string[]; updated: string; read: string }
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
const saved = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}
const money = (value: number) => value >= 1000 ? `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`

const learningPaths = [
  { name: 'Basics', description: 'Get oriented with the core ideas.', articleIds: ['bitcoin', 'ethereum', 'wallets'], time: '27 min' },
  { name: 'Mechanisms', description: 'See how networks and programs work.', articleIds: ['consensus', 'smart-contracts', 'defi'], time: '31 min' },
  { name: 'Use safely', description: 'Understand custody, pegs, and venues.', articleIds: ['wallets', 'stablecoins', 'exchanges'], time: '25 min' },
]
const cryptoTerms = [
  { term: 'Consensus', category: 'NETWORKS', definition: 'The rules that let independent participants agree on one valid transaction history.' },
  { term: 'Seed phrase', category: 'WALLETS', definition: 'A sequence of words that can restore a wallet’s keys. Anyone who gets it may control the wallet.' },
  { term: 'Gas fee', category: 'TRANSACTIONS', definition: 'A fee paid to process a transaction or computation on a blockchain network.' },
  { term: 'Stablecoin', category: 'TOKENS', definition: 'A token designed to track another asset’s value. Its target price is not guaranteed.' },
]
const cryptoQuiz = [
  { question: 'What should you do with a wallet recovery phrase?', options: ['Share it to verify your wallet', 'Keep it private and store it securely', 'Save it in a public cloud note'], answer: 1, explanation: 'Anyone with the recovery phrase may be able to control the wallet. Keep it private and offline.' },
  { question: 'Does a stablecoin always keep its target price?', options: ['Yes, that is guaranteed', 'Only on popular exchanges', 'No, the peg can fail'], answer: 2, explanation: 'A stablecoin can lose its peg. Check its reserves, redemption terms, issuer, and market conditions.' },
  { question: 'Does a smart-contract audit guarantee that code is safe?', options: ['No, it can reduce but not remove risk', 'Yes, if two firms audit it', 'Yes, once it is on a blockchain'], answer: 0, explanation: 'An audit can find some issues, but it cannot prove a contract is free of bugs or other risks.' },
]

export default function WikiApp() {
  const [articles] = useState<Article[]>(() => saved('cw-articles', starterArticles))
  const [coins, setCoins] = useState<Coin[]>(starterCoins)
  const [news, setNews] = useState<News[]>([])
  const [newsSource, setNewsSource] = useState('')
  const [category, setCategory] = useState('All topics')
  const [query, setQuery] = useState('')
  const [learningPathIndex, setLearningPathIndex] = useState(0)
  const [termIndex, setTermIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [marketStatus, setMarketStatus] = useState<'loading' | 'live' | 'sample'>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Loading sources')
  const [notice, setNotice] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  async function refreshResearch() {
    setRefreshing(true)
    const outcomes = await Promise.allSettled([
      fetch('/api/market').then((response) => { if (!response.ok) throw new Error('Market feed unavailable'); return response.json() as Promise<Coin[]> }),
      fetch('/api/news').then((response) => { if (!response.ok) throw new Error('News feed unavailable'); return response.json() as Promise<{ items?: News[]; source?: string }> }),
    ])
    if (outcomes[0].status === 'fulfilled' && outcomes[0].value.length) { setCoins(outcomes[0].value); setMarketStatus('live') }
    else { setMarketStatus('sample') }
    if (outcomes[1].status === 'fulfilled') { const headlines = outcomes[1].value.items ?? []; setNews(headlines.slice(0, 4)); setNewsSource(outcomes[1].value.source ?? 'Crypto news') }
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    if (outcomes.some((outcome) => outcome.status === 'fulfilled')) { setNotice('Source refresh complete.') }
    else { setNotice('Live sources could not be reached. Showing the reference library.') }
    setRefreshing(false)
  }

  const refreshOnSchedule = useEffectEvent(() => { void refreshResearch() })
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
  const activeLearningPath = learningPaths[learningPathIndex]
  const learningPathArticles = activeLearningPath.articleIds.flatMap((id) => {
    const article = articles.find((item) => item.id === id)
    return article ? [article] : []
  })
  const activeTerm = cryptoTerms[termIndex]
  const activeQuiz = cryptoQuiz[quizIndex]
  const marketTools = [
    { name: 'TradingView', type: 'CHARTS', description: 'Explore candlestick charts, technical indicators, and drawing tools.', url: 'https://www.tradingview.com/chart/' },
    { name: 'CoinGecko', type: 'MARKET DATA', description: 'Compare prices, market capitalization, and supply information.', url: 'https://www.coingecko.com/' },
    { name: 'CoinPaprika', type: 'MARKET DATA', description: 'Review asset listings, historical data, and market statistics.', url: 'https://coinpaprika.com/' },
    { name: 'DefiLlama', type: 'DEFI ANALYTICS', description: 'Explore protocol, chain, and total-value-locked dashboards.', url: 'https://defillama.com/' },
    { name: 'CoinGlass', type: 'DERIVATIVES DATA', description: 'Inspect funding rates, open interest, and liquidation data.', url: 'https://www.coinglass.com/' },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu icon-button" title="Toggle navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={19} /></button>
        <a className="wordmark" href="#home" onClick={() => { setCategory('All topics'); setQuery('') }}><img className="site-logo" src={logo} alt="Cryptocurrency.Wiki" /></a>
        <div className={`searchbox ${searchExpanded ? 'search-expanded' : ''}`}><button className="search-trigger icon-button" aria-label="Open search" onClick={() => { setSearchExpanded(true); window.setTimeout(() => document.getElementById('encyclopedia-search')?.focus(), 0) }}><Search size={17} /></button><input id="encyclopedia-search" aria-label="Search the encyclopedia" placeholder="Search the encyclopedia..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="top-actions"><a className="guide-nav-link" href="/learn"><BookOpen size={15} /><span>Learning guide</span></a><span className="independent"><span /> Independent resource</span></div>
      </header>
      <div className="workspace">
        <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
          <div className="side-label">THE LIBRARY</div>
          <nav className="category-nav" aria-label="Article categories">{categories.map(({ name, count, icon: Icon }) => <button className={`nav-item ${category === name ? 'nav-active' : ''}`} key={name} onClick={() => { setCategory(name); setMobileNavOpen(false) }}><Icon size={17} strokeWidth={1.8} /><span>{name}</span><span className="nav-count">{count}</span></button>)}</nav>
          <div className="side-divider" />
          <button className="nav-item" onClick={() => document.getElementById('newsroom')?.scrollIntoView({ behavior: 'smooth' })}><Clock3 size={17} /><span>Industry updates</span></button>
          <div className="sidebar-note"><div className="note-icon"><ShieldCheck size={16} /></div><p>Independent by design.</p><span>Educational reference, not financial advice.</span></div>
          <div className="sidebar-foot"><span className="foot-dot" /> Sources checked {lastUpdated}</div>
        </aside>
        <main className="main-content" id="home">
          <section className="intro-row"><div><h1>Understand<br /><em>Blockchain.</em></h1><p className="intro-copy">An independent guide to the technology, people, and ideas changing money.</p></div><div className="intro-aside"><span className="asterisk">✳</span><span>Curious minds<br />welcome here.</span></div></section>
          <div className="market-module"><section className="market-strip" aria-label="Cryptocurrency market overview"><div className="market-heading"><span className="live-indicator" /><span>MARKET PULSE</span><span className="market-caption">{marketStatus === 'live' ? 'LIVE · USD' : marketStatus === 'loading' ? 'CONNECTING' : 'SAMPLE · USD'}</span></div><div className="coin-row">{coins.slice(0, 4).map((coin, index) => <div className="coin-item" key={coin.id}><div className={`coin-icon coin-${index}`}>{coin.image ? <img src={coin.image} alt="" /> : coin.symbol.slice(0, 1).toUpperCase()}</div><div className="coin-info"><span className="coin-name">{coin.symbol.toUpperCase()} <small>{coin.name}</small></span><strong>{coin.current_price ? money(coin.current_price) : '—'}</strong></div><span className={`coin-change ${coin.price_change_percentage_24h < 0 ? 'negative' : ''}`}>{coin.current_price ? <>{coin.price_change_percentage_24h < 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</> : '···'}</span></div>)}</div></section><div className="market-actions"><button className="refresh-button" title="Refresh market and news sources" onClick={() => void refreshResearch()} disabled={refreshing}>{refreshing ? <span className="spinner" /> : <ArrowRight size={15} />}{refreshing ? 'Updating' : 'Refresh'}</button></div></div>
          <div className="content-grid">
            <section className="library-column">
              <div className="section-heading"><div><span className="section-kicker">A PLACE TO BEGIN</span><h2>{query ? 'Search results' : category === 'All topics' ? 'Start with the essentials' : category}</h2></div><button className="text-link" onClick={() => { setCategory('All topics'); setQuery('') }}>Browse all <ArrowRight size={15} /></button></div>
              {visibleArticles.length === 0 ? <div className="empty-state">No entries match that search yet. Try another term.</div> : <div className="article-grid">{visibleArticles.slice(0, 6).map((article, index) => <button className={`article-card article-card-${index % 3} article-card-topic-${article.id}`} key={article.id} onClick={() => setActiveArticle(article)}><div className="article-card-top"><span className="article-category">{article.category}</span><ArrowRight size={16} /></div><h3>{article.title}</h3><p>{article.intro}</p><div className="article-meta"><span>{article.level}</span><span className="meta-dot" /><span>{article.read} read</span></div></button>)}</div>}
              <section className="featured-band"><div className="feature-copy"><span className="section-kicker">FIELD GUIDE · 01</span><h2>Start with the<br /><em>building blocks.</em></h2><p>From blocks and keys to markets and protocols: clear explanations, built one idea at a time.</p><button className="dark-button" onClick={() => { setCategory('Blockchain'); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore the guide <ArrowRight size={15} /></button></div><div className="chain-art" aria-hidden="true"><div className="chain-orbit orbit-one" /><div className="chain-orbit orbit-two" /><div className="chain-core">⛓</div><span className="chain-node node-one">01</span><span className="chain-node node-two">02</span><span className="chain-node node-three">03</span><span className="chain-tag">BLOCKCHAIN / 101</span></div></section>
              <section className="news-section" id="newsroom"><div className="section-heading news-heading"><div><span className="section-kicker">FROM THE WIRES</span><h2>Industry, in context</h2></div><span className="source-label">{news.length ? newsSource.toUpperCase() : 'REFERENCE DESK'}</span></div>{news.length ? <div className="news-list">{news.slice(0, 4).map((item, index) => <a className="news-item" href={item.link} key={`${item.link}-${index}`} target="_blank" rel="noreferrer"><span className="news-index">0{index + 1}</span><span className="news-title">{item.title}</span><span className="news-source">{item.source || newsSource} <ExternalLink size={12} /></span></a>)}</div> : <div className="news-empty"><Newspaper size={17} /><span>Refresh to fetch current industry coverage. Headlines are treated as sources, not encyclopedia facts.</span></div>}</section>
            </section>
            <aside className="context-column">
              <section className="learning-panel"><div className="learning-heading"><span className="section-kicker">GUIDED LEARNING</span><span className="learning-step-count">{String(learningPathIndex + 1).padStart(2, '0')} / {String(learningPaths.length).padStart(2, '0')}</span></div><h2>Choose a path</h2><p className="learning-description">{activeLearningPath.description}</p><div className="learning-path-tabs" role="tablist" aria-label="Learning paths">{learningPaths.map((path, index) => <button key={path.name} type="button" role="tab" aria-selected={learningPathIndex === index} className={`learning-path-tab ${learningPathIndex === index ? 'learning-path-active' : ''}`} onClick={() => setLearningPathIndex(index)}>{path.name}</button>)}</div><div className="learning-steps">{learningPathArticles.map((article, index) => <button className="learning-step" type="button" key={article.id} onClick={() => setActiveArticle(article)}><span className="learning-step-number">0{index + 1}</span><span className="learning-step-title">{article.title}</span><ArrowRight size={14} /></button>)}</div><div className="learning-time"><BookOpen size={13} /> About {activeLearningPath.time}</div></section>
              <section className="term-panel" aria-live="polite"><div className="term-panel-heading"><span className="section-kicker">CRYPTO TERM</span><button type="button" onClick={() => setTermIndex((index) => (index + 1) % cryptoTerms.length)} aria-label="Show another crypto term">Next <ArrowRight size={13} /></button></div><span className="term-category">{activeTerm.category}</span><h2>{activeTerm.term}</h2><p>{activeTerm.definition}</p></section>
              <section className="quick-check" aria-labelledby="quick-check-title"><div className="quiz-heading"><span className="section-kicker">QUICK CHECK</span><span>{String(quizIndex + 1).padStart(2, '0')} / {String(cryptoQuiz.length).padStart(2, '0')}</span></div><h2 id="quick-check-title">{activeQuiz.question}</h2><div className="quiz-options">{activeQuiz.options.map((option, index) => <button type="button" className={`quiz-option ${quizAnswer === index ? 'quiz-option-selected' : ''}`} aria-pressed={quizAnswer === index} key={option} onClick={() => setQuizAnswer(index)}><span className="quiz-option-marker">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>{quizAnswer !== null && <div className={`quiz-feedback ${quizAnswer === activeQuiz.answer ? 'quiz-feedback-correct' : 'quiz-feedback-incorrect'}`} role="status"><strong>{quizAnswer === activeQuiz.answer ? 'Correct' : 'Not quite'}</strong><span>{activeQuiz.explanation}</span></div>}<button className="quiz-next" type="button" onClick={() => { setQuizIndex((index) => (index + 1) % cryptoQuiz.length); setQuizAnswer(null) }}>Next question <ArrowRight size={14} /></button></section>
              <section className="recent-panel"><div className="recent-heading"><span className="section-kicker">RECENTLY REVISED</span><button title="Refresh sources" onClick={() => void refreshResearch()}><Clock3 size={15} /></button></div>{articles.slice(0, 4).map((article) => <button className="recent-row" key={article.id} onClick={() => setActiveArticle(article)}><span className="recent-bullet" /><span>{article.title}</span><time>{article.updated.replace(', 2026', '')}</time></button>)}</section>
            </aside>
          </div>
          <section className="analysis-tools-section" id="market-tools" aria-labelledby="market-tools-title"><div className="section-heading"><div><span className="section-kicker">RESEARCH DESK</span><h2 id="market-tools-title">Market analysis tools</h2></div><span className="source-label">EXTERNAL RESOURCES</span></div><p className="analysis-tools-intro">Use multiple sources, understand what each metric measures, and verify data before drawing conclusions. These links are informational, not endorsements.</p><div className="analysis-tools-list">{marketTools.map((tool) => <a className="analysis-tool" href={tool.url} key={tool.name} target="_blank" rel="noreferrer"><span className="analysis-tool-type">{tool.type}</span><span className="analysis-tool-copy"><strong>{tool.name}</strong><small>{tool.description}</small></span><ExternalLink size={15} /></a>)}</div></section>
          <footer className="page-footer"><span>cryptocurrency.wiki <span className="footer-dot">·</span> Independent educational resource</span><span>Information only. Not financial advice.</span></footer>
        </main>
      </div>
      {notice && <div className="toast" role="status">{notice}<button title="Dismiss" onClick={() => setNotice('')}><X size={14} /></button></div>}
      {activeArticle && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveArticle(null) }}><article className="article-modal"><button className="modal-close icon-button" title="Close article" onClick={() => setActiveArticle(null)}><X size={18} /></button><span className="section-kicker">{activeArticle.category.toUpperCase()} · {activeArticle.level.toUpperCase()}</span><h2>{activeArticle.title}</h2><p className="modal-lead">{activeArticle.intro}</p>{activeArticle.body.map((paragraph) => <p className="modal-body" key={paragraph}>{paragraph}</p>)}<div className="modal-meta">Updated {activeArticle.updated} <span>·</span> {activeArticle.read} read</div></article></div>}
    </div>
  )
}

