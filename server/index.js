import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import Parser from 'rss-parser'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const parser = new Parser()
const port = Number(process.env.PORT || 8787)
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const root = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(root, '../dist')
const sourceCache = new Map()

app.set('trust proxy', 1)

async function cachedSource(key, duration, load) {
  const current = sourceCache.get(key)
  if (current?.value && current.expiresAt > Date.now()) return current.value
  if (current?.pending) return current.pending

  const entry = { value: null, expiresAt: 0, pending: null }
  entry.pending = load()
    .then((value) => {
      entry.value = value
      entry.expiresAt = Date.now() + duration
      return value
    })
    .catch((error) => {
      sourceCache.delete(key)
      throw error
    })
    .finally(() => { entry.pending = null })
  sourceCache.set(key, entry)
  return entry.pending
}

const draftLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI draft limit reached. Try again later.' },
})

app.use(express.json({ limit: '100kb' }))

app.get('/api/status', (_request, response) => {
  response.json({ aiConfigured: Boolean(process.env.OPENAI_API_KEY), model })
})

app.get('/api/market', async (_request, response) => {
  try {
    const coins = await cachedSource('market', 60_000, async () => {
      const ids = ['btc-bitcoin', 'eth-ethereum', 'sol-solana', 'usdc-usd-coin']
      return Promise.all(ids.map(async (id) => {
        const upstream = await fetch(`https://api.coinpaprika.com/v1/tickers/${id}?quotes=USD`, { signal: AbortSignal.timeout(12000) })
        if (!upstream.ok) throw new Error(`CoinPaprika returned ${upstream.status} for ${id}`)
        const ticker = await upstream.json()
        const quote = ticker.quotes?.USD
        if (!quote) throw new Error(`CoinPaprika returned no USD quote for ${id}`)
        return { id: ticker.id, name: ticker.name, symbol: ticker.symbol.toLowerCase(), market_cap_rank: ticker.rank, current_price: quote.price, price_change_percentage_24h: quote.percent_change_24h ?? 0 }
      }))
    })
    response.json(coins)
  } catch (error) {
    console.error('Market feed error:', error instanceof Error ? error.message : error)
    response.status(502).json({ error: 'The market feed is temporarily unavailable.' })
  }
})

app.get('/api/news', async (_request, response) => {
  try {
    const result = await cachedSource('news', 5 * 60 * 1000, async () => {
      const feeds = [
        { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
      ]
      for (const feedSource of feeds) {
        try {
          const feed = await parser.parseURL(feedSource.url)
          const items = feed.items.slice(0, 8).flatMap((item) => item.title && item.link ? [{ title: item.title, link: item.link, author: item.creator || item.author, pubDate: item.isoDate || item.pubDate, source: feedSource.name }] : [])
          if (items.length) return { source: feedSource.name, items }
        } catch (error) {
          console.error(`${feedSource.name} feed error:`, error instanceof Error ? error.message : error)
        }
      }
      throw new Error('All news feeds are unavailable.')
    })
    response.json(result)
  } catch (error) {
    console.error('News feed error:', error instanceof Error ? error.message : error)
    response.status(502).json({ error: 'News feeds are temporarily unavailable.' })
  }
})

app.post('/api/draft', draftLimiter, async (request, response) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'AI is not configured. Add OPENAI_API_KEY to .env and restart the app.' })

  const articles = Array.isArray(request.body?.articles) ? request.body.articles : []
  const headlines = Array.isArray(request.body?.headlines) ? request.body.headlines : []
  if (!headlines.length) return response.status(400).json({ error: 'No source headlines were provided.' })

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are an independent cryptocurrency encyclopedia editor. Use only the supplied headlines. Never give financial advice or invent details. Return JSON with title (an existing article title), summary (a neutral proposed update under 70 words), and source (the supporting headline and link).' },
          { role: 'user', content: `Existing article titles: ${articles.map((article) => article.title).join(', ')}\nRecent source headlines:\n${headlines.slice(0, 8).map((item) => `${item.title} (${item.link})`).join('\n')}` },
        ],
      }),
    })
    if (!upstream.ok) {
      const detail = await upstream.json().catch(() => ({}))
      console.error('AI provider error:', upstream.status, detail.error?.message || '')
      return response.status(502).json({ error: 'The AI provider could not generate a draft.' })
    }
    const result = await upstream.json()
    const text = result.choices?.[0]?.message?.content
    if (!text) throw new Error('The AI provider returned an empty response.')
    response.json(JSON.parse(text))
  } catch (error) {
    console.error('AI draft error:', error instanceof Error ? error.message : error)
    response.status(502).json({ error: 'Could not generate a draft from the current sources.' })
  }
})

if (existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist))
  app.get(/^\/(?!api\/).*/, (_request, response) => response.sendFile(path.join(dist, 'index.html')))
}

app.listen(port, '0.0.0.0', () => console.log(`Cryptocurrency.Wiki API listening on http://localhost:${port}`))
