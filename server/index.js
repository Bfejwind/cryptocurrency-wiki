import 'dotenv/config'
import express from 'express'
import Parser from 'rss-parser'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const parser = new Parser()
const port = Number(process.env.PORT || 8787)
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

app.get('/api/status', (_request, response) => {
  response.json({ ok: true })
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

if (existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist))
  app.get(/^\/(?!api\/).*/, (_request, response) => response.sendFile(path.join(dist, 'index.html')))
}

app.listen(port, '0.0.0.0', () => console.log(`CryptoLoot.Wiki API listening on http://localhost:${port}`))
