// ─── OrionSentinel Express Backend ───────────────────────────────────────────
// Responsibilities:
//   - Proxy BaseScan API calls (uses server-side API key, avoids browser rate limits)
//   - Cache DeFi Llama yields (60s TTL — avoid hammering free API)
//   - Autonomous scan endpoint (can be called by a cron or webhook)
//   - CORS-safe relay for Base RPC calls requiring higher rate limits

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app  = express();
const PORT = process.env.PORT || 3001;

const DEV_ORIGINS  = ['http://localhost:5173', 'http://localhost:4173'];
const PROD_ORIGINS = process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : [];
const ALL_ORIGINS  = [...DEV_ORIGINS, ...PROD_ORIGINS];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and listed origins
    if (!origin || ALL_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Simple in-memory cache ────────────────────────────────────────────────────
const cache = new Map();
function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.value);
  return fn().then(val => {
    cache.set(key, { value: val, ts: Date.now() });
    return val;
  });
}

const BASE_RPC     = process.env.BASE_RPC_URL    || 'https://mainnet.base.org';
const BASESCAN_KEY = process.env.BASESCAN_API_KEY || '';
const BASESCAN_API = 'https://api.basescan.org/api';
const LLAMA_YIELDS = 'https://yields.llama.fi/pools';
const LLAMA_PROTO  = 'https://api.llama.fi/protocol';

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── 1. BaseScan proxy — source verification ───────────────────────────────────
// GET /api/basescan/source/:address
app.get('/api/basescan/source/:address', async (req, res) => {
  const { address } = req.params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }

  try {
    const keyParam = BASESCAN_KEY ? `&apikey=${BASESCAN_KEY}` : '';
    const url = `${BASESCAN_API}?module=contract&action=getsourcecode&address=${address}${keyParam}`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'BaseScan unavailable', detail: e.message });
  }
});

// ── 2. BaseScan proxy — contract ABI ──────────────────────────────────────────
// GET /api/basescan/abi/:address
app.get('/api/basescan/abi/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const keyParam = BASESCAN_KEY ? `&apikey=${BASESCAN_KEY}` : '';
    const url = `${BASESCAN_API}?module=contract&action=getabi&address=${address}${keyParam}`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'BaseScan unavailable', detail: e.message });
  }
});

// ── 3. Base RPC proxy (for higher-rate requests) ──────────────────────────────
// POST /api/rpc
app.post('/api/rpc', async (req, res) => {
  try {
    const upstream = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'RPC unavailable', detail: e.message });
  }
});

// ── 4. DeFi Llama yields (cached 60s) ─────────────────────────────────────────
// GET /api/yields?chain=Base
app.get('/api/yields', async (req, res) => {
  const chain = req.query.chain || 'Base';
  try {
    const pools = await cached(`yields_${chain}`, 60_000, async () => {
      const r = await fetch(LLAMA_YIELDS);
      const { data } = await r.json();
      return data.filter(p =>
        p.chain === chain && p.apy > 0 && p.tvlUsd > 50_000
      ).sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 50);
    });
    res.json({ ok: true, pools, cachedAt: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ error: 'DeFi Llama unavailable', detail: e.message });
  }
});

// ── 5. DeFi Llama protocol metadata (cached 5min) ────────────────────────────
// GET /api/protocol/:slug
app.get('/api/protocol/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const data = await cached(`protocol_${slug}`, 300_000, async () => {
      const r = await fetch(`${LLAMA_PROTO}/${slug}`);
      if (!r.ok) throw new Error(`DeFi Llama: ${r.status}`);
      return r.json();
    });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Protocol not found', detail: e.message });
  }
});

// ── 6. Agent scan status ──────────────────────────────────────────────────────
// This endpoint records the last agent scan result.
// Can be called by a cron or scheduled task to keep the agent running autonomously.
const agentState = { lastScan: null, alerts: [] };

app.get('/api/agent/state', (_, res) => {
  res.json(agentState);
});

app.post('/api/agent/scan-result', (req, res) => {
  agentState.lastScan = { ...req.body, receivedAt: new Date().toISOString() };
  // Extract alerts
  if (req.body.healthStatus?.level === 'critical' || req.body.healthStatus?.level === 'danger') {
    agentState.alerts.push({
      type: 'liquidation_risk',
      healthFactor: req.body.healthFactor,
      ts: new Date().toISOString(),
    });
    // Keep only last 20 alerts
    if (agentState.alerts.length > 20) agentState.alerts.shift();
  }
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  OrionSentinel backend running at http://localhost:${PORT}`);
  console.log(`  BaseScan API key: ${BASESCAN_KEY ? '✓ configured' : '✗ not set (rate-limited)'}`);
  console.log(`  Base RPC: ${BASE_RPC}\n`);
});
