// ─── OrionX Express Backend with Always-On Sentinel & Telegram Bot ───────────────
// Responsibilities:
//   - Always-On background sentinel daemon (24/7 position & yield telemetry)
//   - Interactive Telegram Bot (command dispatcher & push notification alerts)
//   - Deep AI protocol reasoning engine (multi-dimensional risk scoring)
//   - Proxy BaseScan API calls (uses server-side API key, avoids browser rate limits)
//   - Cache DeFi Llama yields (60s TTL — avoid hammering free API)
//   - CORS-safe relay for Base RPC calls requiring higher rate limits

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  startTelegramPolling,
  handleTelegramUpdate,
  getSubscribers,
  bindWalletToChat,
  unbindWallet,
  updatePreferences,
  sendAlertToWallet
} from './telegramBot.js';
import {
  startSentinelDaemon,
  getDaemonLogs,
  getDaemonStatus
} from './sentinelDaemon.js';
import { generateDeepAiReasoning } from './aiReasoning.js';

const app  = express();
const PORT = process.env.PORT || 3001;

const DEV_ORIGINS  = ['http://localhost:5173', 'http://localhost:4173'];
const PROD_ORIGINS = process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : [];
const ALL_ORIGINS  = [...DEV_ORIGINS, ...PROD_ORIGINS];

app.use(cors({
  origin: (origin, cb) => {
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
app.get('/health', (_, res) => res.json({
  ok: true,
  name: 'OrionX Always-On Sentinel API',
  uptime: Math.floor(process.uptime()),
  ts: new Date().toISOString()
}));

// ── 1. Telegram Sentinel REST Endpoints ───────────────────────────────────────

// GET /api/telegram/status
app.get('/api/telegram/status', (_, res) => {
  const daemon = getDaemonStatus();
  const subs = getSubscribers();
  res.json({
    ok: true,
    botConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'OrionXSentinelBot',
    subscribersCount: Object.keys(subs).length,
    daemon,
  });
});

// POST /api/telegram/webhook (for production webhook mode)
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await handleTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/telegram/bind
app.post('/api/telegram/bind', (req, res) => {
  const { chatId, walletAddress, username } = req.body;
  if (!chatId || !walletAddress) {
    return res.status(400).json({ error: 'chatId and walletAddress required' });
  }
  const result = bindWalletToChat(chatId, walletAddress, username);
  res.json({ ok: true, subscription: result });
});

// GET /api/telegram/subscribers
app.get('/api/telegram/subscribers', (_, res) => {
  res.json({ ok: true, subscribers: getSubscribers() });
});

// GET /api/telegram/preferences/:wallet
app.get('/api/telegram/preferences/:wallet', (req, res) => {
  const norm = req.params.wallet.toLowerCase();
  const subs = Object.values(getSubscribers()).filter(s => s.walletAddress === norm);
  if (!subs.length) {
    return res.json({ ok: true, isBound: false });
  }
  res.json({ ok: true, isBound: true, subscriptions: subs });
});

// POST /api/telegram/preferences
app.post('/api/telegram/preferences', (req, res) => {
  const { chatId, preferences } = req.body;
  if (!chatId || !preferences) {
    return res.status(400).json({ error: 'chatId and preferences required' });
  }
  const updated = updatePreferences(chatId, preferences);
  res.json({ ok: true, subscriber: updated });
});

// POST /api/telegram/test-alert
app.post('/api/telegram/test-alert', async (req, res) => {
  const { walletAddress, type = 'liquidation', message = 'Test Sentinel Alert from OrionX Web' } = req.body;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

  await sendAlertToWallet(walletAddress, {
    type,
    title: 'Test Sentinel Push Notification',
    message,
    actionUrl: 'http://localhost:5173',
  });
  res.json({ ok: true, message: 'Alert dispatched to bound Telegram chats' });
});

// ── 2. Always-On Daemon Telemetry Logs ────────────────────────────────────────
// GET /api/daemon/logs
app.get('/api/daemon/logs', (_, res) => {
  res.json({
    ok: true,
    status: getDaemonStatus(),
    logs: getDaemonLogs(),
  });
});

import { auditProtocolOnChain } from './onChainAuditor.js';

// ── 3. Deep AI Protocol Reasoning API ─────────────────────────────────────────
// POST /api/ai/audit
app.post('/api/ai/audit', (req, res) => {
  const protocolData = req.body;
  const reasoning = generateDeepAiReasoning(protocolData);
  res.json({ ok: true, reasoning });
});

// POST /api/ai/audit-full (Full on-chain + BaseScan V2 + DeFi Llama analysis)
app.post('/api/ai/audit-full', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address required' });
  try {
    const result = await auditProtocolOnChain(address);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 4. BaseScan V2 proxy ───────────────────────────────────────────────────────
app.get('/api/basescan/source/:address', async (req, res) => {
  const { address } = req.params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }

  const keyParam = BASESCAN_KEY ? `&apikey=${BASESCAN_KEY}` : '';
  const urls = [
    `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getsourcecode&address=${address}${keyParam}`,
    `https://api.basescan.org/api?module=contract&action=getsourcecode&address=${address}${keyParam}`,
  ];

  for (const url of urls) {
    try {
      const upstream = await fetch(url);
      if (upstream.ok) {
        const data = await upstream.json();
        if (data.status === '1' && data.result?.[0]?.SourceCode) {
          return res.json(data);
        }
      }
    } catch {}
  }

  res.json({ status: '0', message: 'No source code found', result: [] });
});

app.get('/api/basescan/abi/:address', async (req, res) => {
  const { address } = req.params;
  const keyParam = BASESCAN_KEY ? `&apikey=${BASESCAN_KEY}` : '';
  const urls = [
    `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getabi&address=${address}${keyParam}`,
    `https://api.basescan.org/api?module=contract&action=getabi&address=${address}${keyParam}`,
  ];

  for (const url of urls) {
    try {
      const upstream = await fetch(url);
      if (upstream.ok) {
        const data = await upstream.json();
        if (data.status === '1') return res.json(data);
      }
    } catch {}
  }
  res.json({ status: '0', message: 'ABI not found', result: '' });
});

// ── 5. Base RPC proxy ─────────────────────────────────────────────────────────
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

// ── 6. DeFi Llama yields ──────────────────────────────────────────────────────
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

// ── Start Server & Launch Always-On Background Daemon ─────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ======================================================`);
  console.log(`  OrionX Backend & Always-On Sentinel Running at http://localhost:${PORT}`);
  console.log(`  BaseScan API key: ${BASESCAN_KEY ? '✓ configured' : '✗ not set (rate-limited)'}`);
  console.log(`  Base RPC: ${BASE_RPC}`);
  console.log(`  Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? '✓ Live Token Configured' : 'Local Mock Mode'}`);
  console.log(`  ======================================================\n`);

  // Start background services
  startTelegramPolling();
  startSentinelDaemon();
});
