// ─── OrionX Always-On Telegram Bot Sentinel ─────────────────────────────────────
// Features:
//   - Non-stop 24/7 wallet monitoring & push notifications
//   - Interactive commands: /start, /bind, /status, /yields, /incentives, /audit, /approvals, /settings
//   - Inline button menus for 1-tap navigation
//   - Deep AI protocol reasoning on any Base contract
//   - Automatic subscriber persistence in server/data/subscribers.json

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDeepAiReasoning } from './aiReasoning.js';
import { auditProtocolOnChain } from './onChainAuditor.js';
import { getRealWalletPositions, fetchLiveBaseYields, getRealIncentivesStatus } from './onChainPositions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_DIR   = path.join(__dirname, 'data');
const DB_FILE    = path.join(DATA_DIR, 'subscribers.json');
const LIVE_APP_URL = process.env.ALLOWED_ORIGIN || 'https://orionx-agent.vercel.app/';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch { /* ignore */ }
}

// ── Subscriber Store ──────────────────────────────────────────────────────────
function loadSubscribers() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[TelegramBot] Failed to read subscribers DB:', err.message);
  }
  return {};
}

function saveSubscribers(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[TelegramBot] Failed to save subscribers DB:', err.message);
  }
}

// In-memory subscriber registry
let subscribers = loadSubscribers();

export function getSubscribers() {
  return subscribers;
}

export function bindWalletToChat(chatId, walletAddress, username = '') {
  const normWallet = (walletAddress || '').toLowerCase();
  subscribers[chatId] = {
    chatId,
    username,
    walletAddress: normWallet,
    boundAt: new Date().toISOString(),
    preferences: {
      liquidationAlerts: true,
      yieldAlerts: true,
      incentiveAlerts: true,
      securityAlerts: true,
      healthThreshold: 1.5,
    },
  };
  saveSubscribers(subscribers);
  return subscribers[chatId];
}

export function unbindWallet(chatId) {
  if (subscribers[chatId]) {
    delete subscribers[chatId];
    saveSubscribers(subscribers);
    return true;
  }
  return false;
}

export function updatePreferences(chatId, newPrefs) {
  if (subscribers[chatId]) {
    subscribers[chatId].preferences = {
      ...subscribers[chatId].preferences,
      ...newPrefs,
    };
    saveSubscribers(subscribers);
    return subscribers[chatId];
  }
  return null;
}

// ── Telegram Bot API Client ───────────────────────────────────────────────────
function getBotToken() {
  return (process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

function getApiUrl(method) {
  const token = getBotToken();
  return token ? `https://api.telegram.org/bot${token}/${method}` : '';
}

async function tgRequest(method, body = {}) {
  const url = getApiUrl(method);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn(`[TelegramBot] API Error (${method}):`, err.message);
    return null;
  }
}

export async function sendTelegramMessage(chatId, text, inlineKeyboard = null) {
  const token = getBotToken();
  if (!token) {
    console.log(`[TelegramBot Mock] Would send to ${chatId}:\n${text}`);
    return { ok: true, mock: true };
  }

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (inlineKeyboard) {
    payload.reply_markup = { inline_keyboard: inlineKeyboard };
  }

  const res = await tgRequest('sendMessage', payload);
  if (!res?.ok) {
    console.warn(`[TelegramBot] Send failed to ${chatId}:`, res?.description);
  }
  return res;
}

// ── Alert Dispatcher to Bound Wallet Subscribers ──────────────────────────────
export async function sendAlertToWallet(walletAddress, { type, title, message, actionUrl }) {
  const norm = (walletAddress || '').toLowerCase();
  const matched = Object.values(subscribers).filter(s => s.walletAddress === norm);
  if (!matched.length) return;

  for (const sub of matched) {
    const prefs = sub.preferences || {};
    if (type === 'liquidation' && prefs.liquidationAlerts === false) continue;
    if (type === 'yield'       && prefs.yieldAlerts === false) continue;
    if (type === 'incentive'   && prefs.incentiveAlerts === false) continue;
    if (type === 'security'    && prefs.securityAlerts === false) continue;

    const alertHtml = `
<b>🚨 ORIONX SENTINEL ALERT: ${title.toUpperCase()}</b>

${message}

<b>Wallet:</b> <code>${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</code>
<b>Network:</b> Base Mainnet (Chain ID 8453)
<b>Time:</b> ${new Date().toLocaleTimeString()} UTC
    `.trim();

    const keyboard = [
      [{ text: '🛡️ Open OrionX', url: actionUrl || LIVE_APP_URL }],
      [{ text: '📊 Check Position Status', callback_data: 'cmd_status' }],
    ];

    await sendTelegramMessage(sub.chatId, alertHtml, keyboard);
  }
}

// In-memory conversation state session tracker
const userSessions = {};

// ── Main Menu Keyboard ────────────────────────────────────────────────────────
function getMainMenuKeyboard() {
  return [
    [
      { text: '📊 My Positions & Health', callback_data: 'cmd_status' },
      { text: '🚀 Top Base Yields', callback_data: 'cmd_yields' },
    ],
    [
      { text: '🎁 Active Incentives', callback_data: 'cmd_incentives' },
      { text: '🛡️ Protocol & Token Auditor', callback_data: 'cmd_audit_prompt' },
    ],
    [
      { text: '⚙️ Alert Settings', callback_data: 'cmd_settings' },
      { text: '🔗 Bind Base Wallet', callback_data: 'cmd_bind_prompt' },
    ],
  ];
}

// ── Command Handlers ──────────────────────────────────────────────────────────
export async function handleTelegramUpdate(update) {
  if (!update) return;

  // Handle Callback Queries (Inline button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data;

    if (data === 'cmd_status') {
      await handleStatusCommand(chatId);
    } else if (data === 'cmd_yields') {
      await handleYieldsCommand(chatId);
    } else if (data === 'cmd_incentives') {
      await handleIncentivesCommand(chatId);
    } else if (data === 'cmd_audit_prompt') {
      userSessions[chatId] = { awaiting: 'audit_address' };
      await sendTelegramMessage(
        chatId,
        '🔍 <b>Protocol & Token Auditor (Base Mainnet)</b>\n\nPlease reply with any Base smart contract or token address to audit live (e.g. USDC <code>0x833589fcd6edb6e08f4c7c32d4f71b54bda02913</code>, AERO <code>0x940181a94a35a4569e4529a3cdfb74e38fd98631</code>, or Aerodrome Router <code>0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43</code>).'
      );
    } else if (data === 'cmd_bind_prompt') {
      userSessions[chatId] = { awaiting: 'bind_address' };
      await sendTelegramMessage(
        chatId,
        '🔗 <b>Connect Your Base Wallet</b>\n\nPlease reply with your Base wallet address (e.g. <code>0x1234567890abcdef1234567890abcdef12345678</code>).'
      );
    } else if (data === 'cmd_settings') {
      await handleSettingsCommand(chatId);
    } else if (data.startsWith('action_bind_')) {
      const addr = data.replace('action_bind_', '');
      bindWalletToChat(chatId, addr);
      await sendTelegramMessage(chatId, `✅ <b>Wallet Bound:</b> <code>${addr}</code>\n\nAlways-On background sentinel is now active for this address!`, getMainMenuKeyboard());
    } else if (data.startsWith('action_audit_')) {
      const addr = data.replace('action_audit_', '');
      await handleAuditCommand(chatId, addr);
    }

    // Acknowledge callback query
    await tgRequest('answerCallbackQuery', { callback_query_id: cb.id });
    return;
  }

  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();
  const username = message.from?.username || message.from?.first_name || '';

  // 1. Check if user is in an active session (e.g. awaiting an address)
  const session = userSessions[chatId];
  if (session && !text.startsWith('/')) {
    const isAddr = /^0x[a-fA-F0-9]{40}$/.test(text);

    if (session.awaiting === 'bind_address') {
      if (isAddr) {
        delete userSessions[chatId];
        bindWalletToChat(chatId, text, username);
        const confirmation = `
<b>✅ Wallet Successfully Bound to OrionX Sentinel!</b>

<b>Bound Address:</b> <code>${text}</code>
<b>Monitoring Status:</b> 🟢 <b>ALWAYS ON (24/7 Background Sentinel)</b>

You will now receive instant push alerts for liquidations, yields, and incentive rewards.
        `.trim();
        await sendTelegramMessage(chatId, confirmation, getMainMenuKeyboard());
        return;
      } else {
        await sendTelegramMessage(chatId, '❌ <b>Invalid Address Format.</b>\n\nPlease reply with a valid 42-character Base wallet address starting with <code>0x</code>.');
        return;
      }
    }

    if (session.awaiting === 'audit_address') {
      if (isAddr) {
        delete userSessions[chatId];
        await handleAuditCommand(chatId, text);
        return;
      } else {
        await sendTelegramMessage(chatId, '❌ <b>Invalid Address Format.</b>\n\nPlease reply with a valid 42-character Base contract address starting with <code>0x</code>.');
        return;
      }
    }
  }

  // 2. Direct Address Input (User pasted a raw 0x... address)
  if (/^0x[a-fA-F0-9]{40}$/.test(text)) {
    const keyboard = [
      [
        { text: '🔗 Bind as My Wallet', callback_data: `action_bind_${text}` },
        { text: '🛡️ Run Deep AI Audit', callback_data: `action_audit_${text}` },
      ],
    ];
    await sendTelegramMessage(
      chatId,
      `📍 <b>Detected Base Address:</b> <code>${text}</code>\n\nWhat would you like OrionX to do?`,
      keyboard
    );
    return;
  }

  // 3. /start command
  if (text.startsWith('/start')) {
    delete userSessions[chatId];
    const parts = text.split(' ');
    if (parts.length > 1 && parts[1].startsWith('bind_')) {
      const wallet = parts[1].replace('bind_', '');
      bindWalletToChat(chatId, wallet, username);
      const welcome = `
<b>✅ Wallet Successfully Bound to OrionX Sentinel!</b>

<b>Bound Address:</b> <code>${wallet}</code>
<b>Monitoring Status:</b> 🟢 <b>ALWAYS ON (24/7 Background Sentinel)</b>

You will now receive instant push alerts for:
• Liquidation risks (Health Factor &lt; 1.50)
• High-yield Base reallocations (&gt;3% net gain)
• Active ecosystem incentive qualification gaps
• Malicious token spenders & protocol proxy upgrades
      `.trim();
      await sendTelegramMessage(chatId, welcome, getMainMenuKeyboard());
      return;
    }

    const sub = subscribers[chatId];
    const greeting = `
<b>🛡️ Welcome to OrionX Always-On Sentinel</b>

The autonomous capital co-pilot natively built for Base Mainnet.

${sub ? `<b>Bound Wallet:</b> <code>${sub.walletAddress}</code> (Active 24/7)` : '⚠️ <b>No wallet bound yet.</b> Use <code>/bind</code> or click below to link your Base wallet.'}

<b>Available Commands:</b>
• <code>/bind &lt;address&gt;</code> — Link your Base wallet
• <code>/status</code> — View live lending positions & aggregate Health Factor
• <code>/yields</code> — Top Base pool yields with net-gain calculations
• <code>/incentives</code> — Check Base reward qualification gaps
• <code>/audit &lt;address&gt;</code> — Deep AI protocol risk & solvency reasoning
• <code>/settings</code> — Configure alert thresholds
    `.trim();

    await sendTelegramMessage(chatId, greeting, getMainMenuKeyboard());
    return;
  }

  // 4. /bind command
  if (text.startsWith('/bind')) {
    const parts = text.split(' ');
    const wallet = parts[1];

    if (!wallet) {
      // Prompt user for their wallet address
      userSessions[chatId] = { awaiting: 'bind_address' };
      await sendTelegramMessage(
        chatId,
        '🔗 <b>Connect Your Base Wallet</b>\n\nPlease reply with your Base wallet address (e.g. <code>0x1234567890abcdef1234567890abcdef12345678</code>).'
      );
      return;
    }

    if (!wallet.startsWith('0x') || wallet.length !== 42) {
      await sendTelegramMessage(chatId, '❌ <b>Invalid Wallet Address.</b>\n\nUsage: <code>/bind 0x1234567890abcdef1234567890abcdef12345678</code>');
      return;
    }

    delete userSessions[chatId];
    bindWalletToChat(chatId, wallet, username);
    await sendTelegramMessage(chatId, `✅ <b>Wallet Bound:</b> <code>${wallet}</code>\n\nAlways-On background monitoring is now active!`, getMainMenuKeyboard());
    return;
  }

  // 5. /audit command
  if (text.startsWith('/audit')) {
    const parts = text.split(' ');
    const targetAddr = parts[1];

    if (!targetAddr) {
      // Prompt user for contract address
      userSessions[chatId] = { awaiting: 'audit_address' };
      await sendTelegramMessage(
        chatId,
        '🔍 <b>Protocol & Token Auditor (Base Mainnet)</b>\n\nPlease reply with any Base smart contract or token address to audit live (e.g. USDC <code>0x833589fcd6edb6e08f4c7c32d4f71b54bda02913</code>, AERO <code>0x940181a94a35a4569e4529a3cdfb74e38fd98631</code>, or Aerodrome Router <code>0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43</code>).'
      );
      return;
    }

    if (!targetAddr.startsWith('0x') || targetAddr.length !== 42) {
      await sendTelegramMessage(chatId, '❌ <b>Invalid Contract Address.</b>\n\nUsage: <code>/audit 0xContractAddress</code>');
      return;
    }

    delete userSessions[chatId];
    await handleAuditCommand(chatId, targetAddr);
    return;
  }

  // 6. /status or /shield
  if (text.startsWith('/status') || text.startsWith('/shield')) {
    await handleStatusCommand(chatId);
    return;
  }

  // 7. /yields
  if (text.startsWith('/yields')) {
    await handleYieldsCommand(chatId);
    return;
  }

  // 8. /incentives
  if (text.startsWith('/incentives')) {
    await handleIncentivesCommand(chatId);
    return;
  }

  // 9. /settings
  if (text.startsWith('/settings')) {
    await handleSettingsCommand(chatId);
    return;
  }

  // 10. /unbind
  if (text.startsWith('/unbind')) {
    unbindWallet(chatId);
    delete userSessions[chatId];
    await sendTelegramMessage(chatId, '🔌 <b>Wallet Unbound.</b> Background notifications disabled for this chat.', getMainMenuKeyboard());
    return;
  }

  // Default fallback response
  await sendTelegramMessage(chatId, '🤖 <b>OrionX Sentinel Command Menu:</b>', getMainMenuKeyboard());
}

// ── Sub-Command Implementations ───────────────────────────────────────────────

async function handleStatusCommand(chatId) {
  const sub = subscribers[chatId];
  if (!sub || !sub.walletAddress) {
    await sendTelegramMessage(chatId, '⚠️ <b>Please bind your wallet first:</b>\n<code>/bind 0xYourBaseWalletAddress</code>');
    return;
  }

  const wallet = sub.walletAddress;
  await sendTelegramMessage(chatId, `🔍 <i>Reading live on-chain telemetry for <code>${wallet.slice(0, 8)}...${wallet.slice(-6)}</code> from Base RPC...</i>`);

  const pos = await getRealWalletPositions(wallet);

  const hfDisplay = pos.totalDebtUSD > 0
    ? `${pos.healthFactor.toFixed(2)} (${pos.healthStatus})`
    : '∞ (No Active Debt — 100% Safe)';

  let marketsHtml = '';
  if (pos.activePositions.length > 0) {
    marketsHtml = pos.activePositions.map(p => {
      const col = `$${p.collateralUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const debt = `$${p.debtUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return `• <b>${escapeTg(p.protocol)}${p.market ? ` (${escapeTg(p.market)})` : ''}:</b> ${col} Collateral | ${debt} Debt`;
    }).join('\n');
  } else {
    marketsHtml = `• <b>Moonwell:</b> No active debt position
• <b>Compound III:</b> No active debt position
• <b>Aave V3:</b> No active debt position
• <b>Seamless Protocol:</b> No active debt position`;
  }

  const statusMsg = `
<b>📊 ORIONX SENTINEL — LIVE ON-CHAIN POSITION REPORT</b>

<b>Wallet:</b> <code>${wallet}</code>
<b>Network:</b> Base Mainnet (Chain ID 8453)
<b>Sentinel Status:</b> 🟢 ALWAYS ON (24/7 Daemon Telemetry Active)

<b>Wallet Balances:</b>
• <b>ETH:</b> ${pos.ethBalance.toFixed(4)} ETH (~$${(pos.ethBalance * 2800).toFixed(2)})
• <b>USDC:</b> $${pos.usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

<b>Lending Positions & Health:</b>
• <b>Aggregate Health Factor:</b> <code>${hfDisplay}</code>
• <b>Total Collateral:</b> $${pos.totalCollateralUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• <b>Total Borrowed:</b> $${pos.totalDebtUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

<b>Active Markets on Base:</b>
${marketsHtml}

<b>Sentinel Action:</b> ${pos.totalDebtUSD === 0 ? '🟢 No liquidation exposure. Capital is safe.' : pos.healthFactor >= 1.5 ? '🟢 Margins are healthy. No protective repay required.' : '⚠️ Low Health Factor. Protective repay recommended.'}
  `.trim();

  const keyboard = [
    [{ text: '🔄 Refresh Live Status', callback_data: 'cmd_status' }],
    [{ text: '🚀 View Yield Opportunities', callback_data: 'cmd_yields' }],
    [{ text: '🛡️ Open OrionX', url: LIVE_APP_URL }],
  ];

  await sendTelegramMessage(chatId, statusMsg, keyboard);
}

async function handleYieldsCommand(chatId) {
  await sendTelegramMessage(chatId, '🔍 <i>Scanning DeFi Llama API for live Base pool yields...</i>');

  const pools = await fetchLiveBaseYields();

  const poolRows = pools.map((p, idx) => {
    const tvlFormatted = p.tvlUSD >= 1e6 ? `$${(p.tvlUSD / 1e6).toFixed(1)}M` : `$${(p.tvlUSD / 1e3).toFixed(0)}k`;
    const typeTag = p.stablecoin ? ' [Stable]' : '';
    return `${idx + 1}. <b>${escapeTg(p.protocol)}:</b> ${escapeTg(p.symbol)} — <b>${p.apy}% APY</b> (TVL ${tvlFormatted})${typeTag}\n   • Base APY: ${p.apyBase}% | Reward APY: ${p.apyReward}%`;
  }).join('\n');

  const topPool = pools[0];
  const yieldsMsg = `
<b>🚀 ORIONX YIELD OPTIMIZER — BASE MAINNET</b>

Live yield ranking from <b>DeFi Llama</b> across Base pools (&gt;$100k TVL):

${poolRows}

💡 <b>Top Live Opportunity:</b>
<b>${escapeTg(topPool?.protocol)} ${escapeTg(topPool?.symbol)}</b> is currently generating <b>${topPool?.apy}% APY</b> with ${topPool?.tvlUSD >= 1e6 ? `$${(topPool?.tvlUSD / 1e6).toFixed(1)}M` : `$${(topPool?.tvlUSD / 1e3).toFixed(0)}k`} TVL liquidity depth.
  `.trim();

  const keyboard = [
    [{ text: '🔄 Refresh Live Yields', callback_data: 'cmd_yields' }],
    [{ text: '🛡️ Open OrionX', url: LIVE_APP_URL }],
    [{ text: '📊 Check Position Health', callback_data: 'cmd_status' }],
  ];

  await sendTelegramMessage(chatId, yieldsMsg, keyboard);
}

async function handleIncentivesCommand(chatId) {
  const sub = subscribers[chatId];
  const wallet = sub?.walletAddress;

  if (!wallet) {
    await sendTelegramMessage(chatId, '⚠️ <b>Please bind your wallet first to evaluate on-chain eligibility:</b>\n<code>/bind 0xYourBaseWalletAddress</code>');
    return;
  }

  await sendTelegramMessage(chatId, `🔍 <i>Evaluating on-chain criteria & activity for <code>${wallet.slice(0, 8)}...${wallet.slice(-6)}</code> on Base...</i>`);

  const inc = await getRealIncentivesStatus(wallet);

  const campaignRows = inc.campaigns.map((c, idx) => {
    const criteriaList = c.criteria.map(cr => `   ${cr.met ? '✓' : '✗'} ${escapeTg(cr.label)} (<code>${escapeTg(cr.detail)}</code>)`).join('\n');
    return `<b>${idx + 1}. ${escapeTg(c.name)}</b>\n• <b>Status:</b> ${c.status} (${c.metCount}/${c.totalCount} criteria met)\n• <b>Reward:</b> ${escapeTg(c.reward)}\n• <b>On-Chain Checks:</b>\n${criteriaList}`;
  }).join('\n\n');

  const incentivesMsg = `
<b>🎁 ORIONX INCENTIVE TRACKER — REAL ON-CHAIN AUDIT</b>

<b>Target Wallet:</b> <code>${wallet}</code>
<b>Activity Recorded:</b> ${inc.txCount} Base transactions
<b>Holdings:</b> ${inc.ethBalance.toFixed(4)} ETH | $${inc.usdcBalance.toFixed(2)} USDC | ${inc.aeroBalance.toFixed(2)} AERO | ${inc.veAeroBalance.toFixed(2)} veAERO

━━━━━━━━━━━━━━━━━━━
${campaignRows}

💡 <i>Criteria are verified directly via Base RPC reads.</i>
  `.trim();

  const keyboard = [
    [{ text: '🔄 Re-evaluate Eligibility', callback_data: 'cmd_incentives' }],
    [{ text: '🛡️ Open OrionX', url: LIVE_APP_URL }],
  ];

  await sendTelegramMessage(chatId, incentivesMsg, keyboard);
}

function escapeTg(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function handleAuditCommand(chatId, contractAddress) {
  await sendTelegramMessage(chatId, `🧠 <i>Querying Base Multi-RPC, BaseScan & DeFi Llama for <code>${contractAddress}</code>...</i>`);

  try {
    const result = await auditProtocolOnChain(contractAddress);

    if (result.isEOA) {
      const eoaMsg = `
⚠️ <b>Not a Base Contract / Unrecognized Address</b>

<b>Address:</b> <code>${result.address}</code>
<b>Network:</b> Base Mainnet (Chain ID 8453)
<b>Bytecode Size:</b> 0 bytes

<i>This address has no deployed smart contract or token bytecode found on Base Mainnet. OrionX only audits protocols and tokens natively deployed on Base.</i>
      `.trim();
      await sendTelegramMessage(chatId, eoaMsg, getMainMenuKeyboard());
      return;
    }

    const ai = result.deepAiReasoning;
    const nameDisplay = result.symbol ? `${result.name} (${result.symbol})` : result.name;

    const auditReport = `
<b>🧠 DEEP AI PROTOCOL & TOKEN AUDIT REPORT</b>
<b>Target:</b> <b>${escapeTg(nameDisplay)}</b>
<b>Address:</b> <code>${result.address}</code>
<b>Safety Score:</b> <b>${ai.score}/100 — Grade ${escapeTg(ai.grade)}</b>
<b>Risk Classification:</b> <b>${escapeTg(ai.riskLevel)}</b>
<b>Verified Bytecode:</b> ${result.isVerified ? `✅ Yes (${escapeTg(result.compiler || 'Solidity')})` : '⚠️ Unverified Source'}
<b>Proxy Pattern:</b> ${result.isProxy ? `⚡ Upgradeable (Impl: <code>${result.implementationAddress?.slice(0,10)}...</code>)` : '🔒 Immutable Bytecode'}
<b>Contract Size:</b> ${result.bytecodeSize.toLocaleString()} bytes

━━━━━━━━━━━━━━━━━━━
<b>1. Details & Architecture:</b>
• <b>Type:</b> ${escapeTg(ai.architecture.contractType)}
• <b>Governance:</b> ${escapeTg(ai.architecture.governanceControl)}
• <b>Timelock:</b> ${escapeTg(ai.architecture.timelockDelay)}
• <b>License:</b> ${escapeTg(result.licenseType || 'Open Source')}

━━━━━━━━━━━━━━━━━━━
<b>2. Health & Solvency:</b>
• <b>Status:</b> ${escapeTg(ai.healthMetrics.status)}
• <b>Solvency Ratio:</b> ${escapeTg(ai.healthMetrics.solvencyRatio)}
• <b>Bad Debt:</b> ${escapeTg(ai.healthMetrics.badDebtExposure)}
• <b>TVL Trajectory:</b> ${escapeTg(ai.healthMetrics.tvlTrajectory)}
• <b>Reported TVL:</b> ${escapeTg(result.tvl)}

━━━━━━━━━━━━━━━━━━━
<b>3. Price & Liquidity Depth:</b>
• <b>Stability:</b> ${escapeTg(ai.priceLiquidity.priceStability)}
• <b>DEX Depth:</b> ${escapeTg(ai.priceLiquidity.dexDepth)}
• <b>Slippage Model:</b> ${escapeTg(ai.priceLiquidity.slippageModel)}
• <b>Oracle Feeds:</b> ${escapeTg(ai.priceLiquidity.oracleSource)}

━━━━━━━━━━━━━━━━━━━
<b>4. Market Sentiment & Velocity:</b>
• <b>Sentiment:</b> ${escapeTg(ai.marketSentiment.sentimentScore)}
• <b>Volume/TVL Velocity:</b> ${escapeTg(ai.marketSentiment.volumeToTvlRatio)}
• <b>Whale Dispersion:</b> ${escapeTg(ai.marketSentiment.whaleConcentration)}

━━━━━━━━━━━━━━━━━━━
<b>5. Exploit Vector Assessment:</b>
${ai.exploitVectors.map(v => `• <b>${escapeTg(v.vector)}:</b> [${escapeTg(v.risk)} Risk] ${escapeTg(v.detail)}`).join('\n')}

━━━━━━━━━━━━━━━━━━━
<b>6. Critical "What to Watch":</b>
${ai.whatToWatch.map((w, idx) => `• <b>${idx + 1}.</b> ${escapeTg(w)}`).join('\n')}
    `.trim();

    const keyboard = [
      [
        { text: '🔍 View on BaseScan', url: `https://basescan.org/address/${result.address}` },
        { text: '🛡️ Open OrionX', url: LIVE_APP_URL },
      ],
    ];

    await sendTelegramMessage(chatId, auditReport, keyboard);
  } catch (err) {
    await sendTelegramMessage(chatId, `❌ <b>Audit Error:</b> ${escapeTg(err.message)}`);
  }
}

async function handleSettingsCommand(chatId) {
  const sub = subscribers[chatId];
  const prefs = sub?.preferences || {
    liquidationAlerts: true,
    yieldAlerts: true,
    incentiveAlerts: true,
    securityAlerts: true,
    healthThreshold: 1.5,
  };

  const settingsMsg = `
<b>⚙️ ORIONX SENTINEL ALERT SETTINGS</b>

<b>Telegram Chat ID:</b> <code>${chatId}</code>
<b>Bound Wallet:</b> ${sub ? `<code>${sub.walletAddress}</code>` : '<i>None (use /bind)</i>'}

<b>Active Push Notification Toggles:</b>
• Liquidation Shield Alerts: ${prefs.liquidationAlerts ? '🟢 ENABLED' : '🔴 DISABLED'} (Trigger &lt; ${prefs.healthThreshold} HF)
• High-Yield Reallocation Alerts: ${prefs.yieldAlerts ? '🟢 ENABLED' : '🔴 DISABLED'} (Trigger &gt; 3% gain)
• Incentive Qualification Alerts: ${prefs.incentiveAlerts ? '🟢 ENABLED' : '🔴 DISABLED'}
• Smart Contract Security Alerts: ${prefs.securityAlerts ? '🟢 ENABLED' : '🔴 DISABLED'}

To change settings, visit the <b>Telegram Sentinel</b> tab in the OrionX web application.
  `.trim();

  await sendTelegramMessage(chatId, settingsMsg, getMainMenuKeyboard());
}

// ── Long-Polling Telegram Runner for Development / Server ─────────────────────
let isPolling = false;
let lastUpdateId = 0;

export async function startTelegramPolling() {
  const token = getBotToken();
  if (!token) {
    console.log('  [TelegramBot] No TELEGRAM_BOT_TOKEN found in .env — running in local mock mode.');
    return;
  }

  if (isPolling) return;
  isPolling = true;

  // Clear any existing webhook so long polling works reliably
  try {
    await tgRequest('deleteWebhook');
  } catch { /* ignore */ }

  console.log('  [TelegramBot] ✓ Telegram Sentinel Bot polling active for @OrionXSentinelBot.');

  const poll = async () => {
    try {
      const payload = { timeout: 15 };
      if (lastUpdateId > 0) {
        payload.offset = lastUpdateId + 1;
      }

      const res = await tgRequest('getUpdates', payload);

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          console.log(`[TelegramBot Update #${update.update_id}] Received text:`, update.message?.text || update.callback_query?.data || '(event)');
          await handleTelegramUpdate(update);
        }
      }
    } catch (err) {
      console.warn('[TelegramBot] Polling loop exception:', err.message);
    }

    if (isPolling) {
      setTimeout(poll, 800);
    }
  };

  poll();
}

export function stopTelegramPolling() {
  isPolling = false;
}
