import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { learningStages as stages } from './learningData'
import './LearningLesson.css'

type LessonSection = { title: string; paragraphs: string[] }
type LessonResource = { title: string; url: string }
type LessonDetail = {
  image: string
  imageAlt: string
  sections: LessonSection[]
  concepts: { term: string; definition: string }[]
  exercise: { title: string; steps: string[] }
  resources: LessonResource[]
  newsKeywords?: string[]
}
type NewsItem = { title: string; link: string; source?: string }

const lessonDetails: Record<string, LessonDetail> = {
  foundations: {
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Abstract network of connected digital blocks',
    sections: [
      { title: 'A shared ledger', paragraphs: ['A blockchain is a replicated ledger: many independent computers keep and verify copies of an ordered record. New transactions are grouped into blocks and linked to earlier blocks with cryptographic hashes. Changing old records becomes detectable, though each network has its own security model.', 'Consensus rules describe how participants accept new blocks. Proof of work and proof of stake are different mechanisms with different costs, incentives, and failure assumptions. “Decentralized” is not a yes-or-no guarantee; it is useful to ask who can validate, upgrade, or censor a network.'] },
      { title: 'Coins, tokens, and networks', paragraphs: ['A coin is generally native to its own network, such as BTC on Bitcoin or ETH on Ethereum. A token is created using a network’s token standards and relies on that network for settlement. A token’s market price does not explain its rights, utility, or risks.', 'Stablecoins aim to track another asset, often a currency, but the peg can fail. Review how a stablecoin is backed, whether redemption is available, who controls its contracts, and where its reserves are held. Network fees are separate from the asset price.'] },
    ],
    concepts: [
      { term: 'Ledger', definition: 'An ordered record of transactions and balances maintained by a network.' },
      { term: 'Consensus', definition: 'Rules that let network participants agree which valid block comes next.' },
      { term: 'Token', definition: 'A digital asset issued through a blockchain’s contract or token standards.' },
    ],
    exercise: { title: 'Make a two-network glossary', steps: ['Read the official Bitcoin and Ethereum introductory documentation.', 'Write down each network’s native asset, consensus approach, and typical fee unit.', 'Mark which statements are measurable facts and which are interpretations.'] },
    resources: [
      { title: 'Bitcoin.org: how Bitcoin works', url: 'https://bitcoin.org/en/how-it-works' },
      { title: 'Ethereum.org: intro to Ethereum', url: 'https://ethereum.org/en/what-is-ethereum/' },
    ],
  },
  custody: {
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Mobile payment and digital account security',
    sections: [
      { title: 'Keys authorize; wallets organize', paragraphs: ['A public address identifies where a transaction can send assets. A private key signs an authorization. Wallet software manages keys and prepares transactions; the assets themselves are recorded on the blockchain.', 'A recovery phrase can recreate the keys for a wallet. Anyone who gets the phrase may be able to move its assets. A legitimate support agent, website, or airdrop never needs your recovery phrase. Keep it offline and private.'] },
      { title: 'Custody changes the risks', paragraphs: ['With a custodial exchange, the service controls the keys and keeps an account record for you. This can be convenient, but access depends on the provider, its security, withdrawal rules, solvency, and local regulations.', 'With self-custody, you authorize transactions yourself and take responsibility for backups and device security. Hardware wallets can isolate keys from an internet-connected computer, but they do not protect against a compromised recovery phrase or a malicious transaction you approve.'] },
    ],
    concepts: [
      { term: 'Private key', definition: 'Secret cryptographic material used to authorize transactions.' },
      { term: 'Recovery phrase', definition: 'Words that can restore a wallet’s keys; treat them like the keys themselves.' },
      { term: 'Custody', definition: 'Who holds and controls the keys needed to move assets.' },
    ],
    exercise: { title: 'Practice without funding a wallet', steps: ['Use a wallet demo or test network, never a wallet containing funds.', 'Inspect the address, selected network, requested permissions, and transaction details before confirming.', 'Identify where a recovery phrase would be backed up, and how you would detect a fake support request.'] },
    resources: [
      { title: 'Ethereum.org: wallets', url: 'https://ethereum.org/en/wallets/' },
      { title: 'Bitcoin.org: securing your wallet', url: 'https://bitcoin.org/en/secure-your-wallet' },
    ],
    newsKeywords: ['wallet', 'custody', 'security', 'hack', 'exchange', 'phishing'],
  },
  networks: {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Global digital network visualization',
    sections: [
      { title: 'From signature to block', paragraphs: ['A wallet signs a transaction with a private key. Nodes check that it follows the network rules and may relay it to other nodes. Pending transactions wait for inclusion; miners or validators propose blocks according to the chain’s consensus protocol.', 'A block explorer makes public network data easier to inspect: transaction hash, sender and recipient addresses, fee, block number, and confirmations. Addresses are pseudonymous identifiers, not verified real-world names.'] },
      { title: 'Confirmations and finality', paragraphs: ['On proof-of-work chains, additional blocks make rewriting a transaction increasingly costly, but short reorganizations can happen. Proof-of-stake networks use validator attestations and protocol-specific finality rules.', 'A displayed “success” state depends on the application and network. High fees can reflect congestion or transaction complexity. Always verify the network and address before sending; blockchain transfers are generally difficult to reverse.'] },
    ],
    concepts: [
      { term: 'Mempool', definition: 'A node’s view of valid transactions waiting for a block.' },
      { term: 'Confirmation', definition: 'A block inclusion; additional blocks can strengthen confidence in settlement.' },
      { term: 'Finality', definition: 'The protocol point after which a block is considered settled under its rules.' },
    ],
    exercise: { title: 'Read a transaction', steps: ['Open a public explorer and choose an old, well-known transaction.', 'Locate the transaction fee, block height, timestamp, and confirmation count.', 'Compare the explorer’s status with the chain’s own finality or confirmation model.'] },
    resources: [
      { title: 'Bitcoin.org: transactions', url: 'https://bitcoin.org/en/how-it-works#transactions' },
      { title: 'Ethereum.org: transactions', url: 'https://ethereum.org/en/developers/docs/transactions/' },
    ],
    newsKeywords: ['bitcoin', 'ethereum', 'network', 'validator', 'blockchain', 'upgrade'],
  },
  'market-mechanics': {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Market chart displayed on a trading screen',
    sections: [
      { title: 'Understand the venue and order', paragraphs: ['Spot trading exchanges one asset for another. A market order prioritizes immediate execution, while a limit order sets a price boundary and may not fill. The bid is the best visible buy price; the ask is the best visible sell price. The difference is the spread.', 'Liquidity describes how much can trade without substantially moving the price. Slippage is the difference between an expected and actual execution price. Thin order books, volatile conditions, and large orders can increase it. Fees also affect the result.'] },
      { title: 'Read a chart without overclaiming', paragraphs: ['A candlestick summarizes open, high, low, and close for a chosen interval. Volume describes reported trading activity on a venue or data source; it is not automatically proof of demand across the whole market.', 'Market capitalization is usually price multiplied by circulating supply. Fully diluted valuation uses a broader supply assumption. Neither is a complete measure of value; check supply definitions, unlock schedules, liquidity, and data provenance.'] },
      { title: 'Spot is not derivatives', paragraphs: ['Futures and perpetual contracts create exposure without being the same as holding the underlying asset. They add funding, basis, collateral, liquidation, and counterparty risks. A chart view can hide these contract-specific mechanics.', 'Learn order types and market structure using historical data or paper trading first. A chart pattern or indicator is a way to describe past data, not a reliable prediction of future prices.'] },
    ],
    concepts: [
      { term: 'Spread', definition: 'The difference between the best visible bid and ask.' },
      { term: 'Slippage', definition: 'The difference between an expected and actual fill price.' },
      { term: 'Market capitalization', definition: 'A quoted price multiplied by a stated supply measure; definitions vary.' },
    ],
    exercise: { title: 'Simulate an order-book walk', steps: ['Choose a liquid market and record the best bid, best ask, and spread.', 'Estimate the fill for a hypothetical order larger than the top displayed size.', 'Repeat during a quieter and a busier period, noting how depth and slippage differ.'] },
    resources: [
      { title: 'TradingView charting', url: 'https://www.tradingview.com/chart/' },
      { title: 'CoinGecko market data', url: 'https://www.coingecko.com/' },
    ],
    newsKeywords: ['market', 'price', 'bitcoin', 'ethereum', 'exchange', 'etf'],
  },
  research: {
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Notes being written in a research notebook',
    sections: [
      { title: 'Start with primary sources', paragraphs: ['Read the protocol documentation, white paper, governance forum, and token contract information. Find out who can upgrade the code, pause functions, mint tokens, or change key parameters.', 'Separate claims from evidence. A project page may describe intended utility; contract code, governance records, audited disclosures, and independently sourced network data provide different kinds of evidence. Each source also has limits.'] },
      { title: 'Study supply and incentives', paragraphs: ['Check circulating, total, and maximum supply definitions. Vesting and unlock schedules can change available supply. Token utility, governance rights, fee capture, and incentive emissions differ substantially between projects.', 'Fundamental analysis asks about design, adoption, incentives, and dependencies. On-chain analysis studies public activity and flows. Technical analysis describes price and volume history. None independently establishes future performance.'] },
      { title: 'Write a falsifiable thesis', paragraphs: ['A useful research note distinguishes observations, assumptions, and conclusions. State what evidence supports the thesis, what would contradict it, and which data source might be incomplete or biased.', 'Compare multiple independent sources and record when data was collected. Avoid treating social popularity, exchange listings, or a high total-value-locked figure as proof of sustainable demand.'] },
    ],
    concepts: [
      { term: 'Tokenomics', definition: 'The design of token supply, distribution, utility, incentives, and governance.' },
      { term: 'Unlock', definition: 'A scheduled change that makes previously restricted tokens transferable.' },
      { term: 'Falsifiable thesis', definition: 'A claim paired with observable evidence that could disprove it.' },
    ],
    exercise: { title: 'Create a one-page research note', steps: ['Use the project’s official documentation and at least two independent data sources.', 'List circulating supply, upcoming unlocks, governance controls, and key dependencies.', 'Write one observation, one uncertainty, and one piece of evidence that would change your conclusion.'] },
    resources: [
      { title: 'DefiLlama analytics', url: 'https://defillama.com/' },
      { title: 'Ethereum.org developer documentation', url: 'https://ethereum.org/en/developers/docs/' },
    ],
    newsKeywords: ['regulation', 'etf', 'token', 'governance', 'crypto', 'sec'],
  },
  risk: {
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Calculator and financial paperwork used for planning',
    sections: [
      { title: 'Define risk before an idea', paragraphs: ['A risk plan states what could go wrong, what evidence would invalidate a thesis, and what maximum loss is acceptable. Position sizing should follow the risk limit, not excitement about a possible gain.', 'Crypto assets can gap, become illiquid, or move while an exchange or network is unavailable. Stop orders may not fill at their trigger price. Leverage can make small price changes cause liquidation and losses beyond what a learner expects.'] },
      { title: 'Practice without capital', paragraphs: ['Paper trading can teach order mechanics, record keeping, and whether a process is repeatable. It does not reproduce emotional pressure, real liquidity, fees, or actual fills, so simulated results should not be mistaken for evidence of future returns.', 'Keep a journal that records the original hypothesis, time horizon, invalidation conditions, simulated costs, and what happened. Review a series of decisions rather than selecting only memorable wins.'] },
      { title: 'Protect accounts and personal data', paragraphs: ['Use unique passwords, strong multi-factor authentication, and withdrawal protections. Verify domains and addresses independently. Never install remote-access software or disclose recovery phrases at the request of an online contact.', 'Consider custody, jurisdiction, counterparty, smart-contract, bridge, oracle, and stablecoin risks separately. Diversification does not remove systemic risks or guarantee a positive outcome.'] },
    ],
    concepts: [
      { term: 'Drawdown', definition: 'A decline from a previous account or asset value peak to a later low.' },
      { term: 'Liquidation', definition: 'Forced closure of a leveraged position when collateral no longer meets requirements.' },
      { term: 'Counterparty risk', definition: 'The possibility that a service or other party cannot meet its obligations.' },
    ],
    exercise: { title: 'Write a paper-trading risk plan', steps: ['Set a hypothetical maximum loss and a time horizon before recording an entry.', 'Write what observation would invalidate the idea and how you would exit in a simulated scenario.', 'Include fees, slippage, outages, and the possibility that an order does not fill.'] },
    resources: [
      { title: 'CFTC: customer advisories', url: 'https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/index.htm' },
      { title: 'SEC Investor.gov: crypto asset risks', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/crypto-asset' },
    ],
    newsKeywords: ['hack', 'exploit', 'security', 'breach', 'freeze', 'exchange', 'stablecoin'],
  },
  'advanced-markets': {
    image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Financial market screens and data visualization',
    sections: [
      { title: 'Derivatives add new variables', paragraphs: ['Perpetual swaps do not expire like dated futures and commonly use funding payments to keep their price near an index. Funding can be positive or negative; it reflects positioning and venue rules, not a dependable forecast.', 'Open interest counts outstanding derivative contracts. It can rise while price rises or falls, and can decline during position closures. Interpret it with venue, instrument, volume, and liquidation data in view.'] },
      { title: 'Basis, options, and execution', paragraphs: ['Basis is the difference between a futures price and its reference spot price. Options introduce expiry, strike, implied volatility, and nonlinear exposure. Each venue may calculate indexes, margins, and liquidation rules differently.', 'Order-book snapshots can omit hidden liquidity and may change faster than data is collected. Historical candles do not include every fee, funding payment, or execution constraint.'] },
      { title: 'Test analysis methods carefully', paragraphs: ['Backtests can overfit parameters to past data. Watch for look-ahead bias, survivorship bias, missing delisted assets, incorrect timezone boundaries, and costs that were excluded.', 'Treat a model output as a conditional estimate with assumptions, not as a certainty. Validate with out-of-sample periods and paper trading, and document when the method is no longer applicable.'] },
    ],
    concepts: [
      { term: 'Funding rate', definition: 'A periodic payment between perpetual-contract positions under a venue’s rules.' },
      { term: 'Open interest', definition: 'The number or value of outstanding derivative contracts, depending on the data provider.' },
      { term: 'Look-ahead bias', definition: 'Using information in a backtest that would not have been available at decision time.' },
    ],
    exercise: { title: 'Audit a derivatives chart', steps: ['Compare funding and open interest from two providers for the same contract and timestamp.', 'Check each provider’s unit, venue coverage, update frequency, and contract type.', 'Write at least two explanations for the same observed change before forming an interpretation.'] },
    resources: [
      { title: 'CoinGlass derivatives data', url: 'https://www.coinglass.com/' },
      { title: 'CFTC futures market education', url: 'https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/index.htm' },
    ],
    newsKeywords: ['futures', 'derivatives', 'funding', 'liquidation', 'bitcoin', 'ethereum', 'market'],
  },
  'advanced-onchain': {
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Source code displayed on a developer screen',
    sections: [
      { title: 'Analyze the full protocol system', paragraphs: ['A decentralized application includes more than its main contract. Interfaces, admin keys, oracles, bridges, keepers, governance, and underlying chains can all be dependencies or failure points.', 'An audit is a time-bounded review of particular code and assumptions. Check its scope, commit hash, unresolved findings, and whether the deployed bytecode matches the reviewed version. An audit is not a guarantee.'] },
      { title: 'Interpret DeFi metrics with care', paragraphs: ['Total value locked is a snapshot whose definition varies across providers and protocols. It may include borrowed assets, incentives, or duplicated collateral. Compare methodology, asset prices, and contract coverage before drawing conclusions.', 'Inspect how collateral is valued, when liquidations occur, who can change parameters, and how oracle updates work. Bridges and composed protocols add dependencies that may fail independently.'] },
      { title: 'Read contracts and governance', paragraphs: ['Use public explorers and verified source code to inspect permissions, upgrade patterns, pause controls, and token approvals. Read governance proposals and execution records, not only forum summaries.', 'Advanced analysis combines source review with incident history, economic assumptions, and threat models. Unverified code or a high user count alone cannot establish protocol safety.'] },
    ],
    concepts: [
      { term: 'Oracle', definition: 'A mechanism that supplies external data to a smart contract.' },
      { term: 'Upgrade authority', definition: 'A key or governance process able to change a deployed contract’s behavior.' },
      { term: 'Composability risk', definition: 'Risk that one protocol inherits failures from contracts or assets it depends on.' },
    ],
    exercise: { title: 'Map an application’s dependencies', steps: ['Choose a protocol and find its official contracts and documentation.', 'List the oracle, bridge, collateral, admin roles, and external services it relies on.', 'Review one audit scope and one governance or incident record; note what each does not cover.'] },
    resources: [
      { title: 'DefiLlama protocol dashboards', url: 'https://defillama.com/' },
      { title: 'Ethereum.org smart-contract documentation', url: 'https://ethereum.org/en/developers/docs/smart-contracts/' },
    ],
    newsKeywords: ['defi', 'protocol', 'bridge', 'contract', 'exploit', 'chain', 'lending'],
  },
}

export default function LearningLesson({ lessonId }: { lessonId: string }) {
  const stageIndex = stages.findIndex((item) => item.id === lessonId)
  const stage = stages[stageIndex]
  const detail = lessonDetails[lessonId]
  const [headlines, setHeadlines] = useState<NewsItem[]>([])
  const [newsSource, setNewsSource] = useState('')

  useEffect(() => {
    if (!stage || !detail) return
    document.title = `${stage.title} | Cryptocurrency.Wiki Learning Guide`
    if (!detail.newsKeywords?.length) return

    let cancelled = false
    fetch('/api/news')
      .then((response) => { if (!response.ok) throw new Error('News unavailable'); return response.json() as Promise<{ source?: string; items?: NewsItem[] }> })
      .then((result) => {
        if (cancelled) return
        const matching = (result.items ?? []).filter((item) => detail.newsKeywords?.some((keyword) => `${item.title} ${item.source ?? ''}`.toLowerCase().includes(keyword)))
        setHeadlines(matching.slice(0, 3))
        setNewsSource(result.source ?? 'Crypto news')
      })
      .catch(() => { if (!cancelled) setHeadlines([]) })
    return () => { cancelled = true }
  }, [stage, detail])

  if (!stage || !detail) {
    return <div className="lesson-shell"><header className="guide-topbar"><a className="wordmark" href="/">cryptocurrency.wiki</a></header><main className="lesson-main"><h1>Lesson not found</h1><a href="/learn">Return to the learning guide</a></main></div>
  }

  const previous = stages[stageIndex - 1]
  const next = stages[stageIndex + 1]

  return <div className="lesson-shell">
    <header className="guide-topbar"><a className="wordmark" href="/" aria-label="Cryptocurrency.Wiki home"><span className="brand-mark">cw</span><span>cryptocurrency<span className="wordmark-light">.wiki</span></span></a><a className="guide-return" href="/learn"><ArrowLeft size={15} /> All learning stages</a></header>
    <main className="lesson-main">
      <nav className="lesson-breadcrumb" aria-label="Breadcrumb"><a href="/learn">Learning guide</a><span>/</span><span>{stage.title}</span></nav>
      <section className="lesson-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(16, 37, 29, .94), rgba(17, 39, 30, .70)), url('${detail.image}')` }}>
        <span className="guide-eyebrow">STAGE {String(stageIndex + 1).padStart(2, '0')} · {stage.level}</span>
        <h1>{stage.title}</h1>
        <p>{stage.summary}</p>
      </section>
      <div className="lesson-layout">
        <article className="lesson-content">
          {detail.sections.map((section) => <section className="lesson-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
          <section className="lesson-concepts"><h2>Key concepts</h2><dl>{detail.concepts.map((concept) => <div key={concept.term}><dt>{concept.term}</dt><dd>{concept.definition}</dd></div>)}</dl></section>
          <section className="lesson-exercise"><span className="guide-eyebrow">PRACTICE WITHOUT RISKING FUNDS</span><h2>{detail.exercise.title}</h2><ol>{detail.exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="lesson-checkpoint"><strong>Check your understanding:</strong> {stage.checkpoint}</p></section>
          {headlines.length > 0 && <section className="lesson-news"><div className="lesson-news-heading"><div><span className="guide-eyebrow">RELATED INDUSTRY COVERAGE</span><h2>Recent reporting</h2></div><span>{newsSource}</span></div>{headlines.map((item) => <a href={item.link} target="_blank" rel="noreferrer" key={item.link}><span>{item.title}</span><ExternalLink size={14} /></a>)}</section>}
          <section className="lesson-resources"><h2>Further reading</h2>{detail.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}>{resource.title}<ExternalLink size={14} /></a>)}</section>
        </article>
        <aside className="lesson-aside"><span className="guide-eyebrow">ROADMAP</span><p>{stage.summary}</p><div className="lesson-aside-progress">STAGE {stageIndex + 1} OF {stages.length}</div><a className="lesson-outline-link" href="/learn">View all stages <ArrowRight size={14} /></a></aside>
      </div>
      <nav className="lesson-pagination" aria-label="Lesson navigation">{previous ? <a href={`/learn/${previous.id}`}><ArrowLeft size={15} /><span><small>PREVIOUS</small><strong>{previous.title}</strong></span></a> : <span />}{next ? <a href={`/learn/${next.id}`}><span><small>NEXT</small><strong>{next.title}</strong></span><ArrowRight size={15} /></a> : <a href="/learn"><span><small>FINISHED THE PATH?</small><strong>Return to all stages</strong></span><ArrowRight size={15} /></a>}</nav>
      <footer className="guide-footer"><a href="/">Cryptocurrency.Wiki</a><span>Independent educational resource · Not financial advice</span></footer>
    </main>
  </div>
}
