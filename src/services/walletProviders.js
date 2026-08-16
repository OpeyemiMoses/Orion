// ─── Strict Multi-Wallet Provider Resolver ──────────────────────────────────
// Prevents wallet hijacking (e.g. OKX impersonating MetaMask/Coinbase or vice-versa)

let eip6963Providers = [];

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (event) => {
    const { info, provider } = event.detail || {};
    if (info && provider) {
      if (!eip6963Providers.some(p => p.info.uuid === info.uuid)) {
        eip6963Providers.push({ info, provider });
      }
    }
  });

  window.dispatchEvent(new Event('eip6963:requestProvider'));
}

export function getDiscoveredWallets() {
  const result = [...eip6963Providers];

  if (typeof window !== 'undefined') {
    const eth = window.ethereum;
    const providers = Array.isArray(eth?.providers) ? eth.providers : (eth ? [eth] : []);

    // 1. Check OKX
    const hasOkx = !!window.okxwallet || providers.some(p => p.isOkxWallet || p.isOKExWallet);
    if (hasOkx && !result.some(w => w.info?.name?.toLowerCase().includes('okx'))) {
      result.push({
        info: { name: 'OKX Wallet', rdns: 'com.okex.wallet', uuid: 'okx-wallet' },
        provider: window.okxwallet || providers.find(p => p.isOkxWallet || p.isOKExWallet),
      });
    }

    // 2. Check MetaMask (Must NOT be OKX, Coinbase, Rabby, or Phantom)
    const trueMetaMask = providers.find(p => p.isMetaMask && !p.isOkxWallet && !p.isOKExWallet && !p.isCoinbaseWallet && !p.isRabby && !p.isPhantom) ||
                         (eth?.isMetaMask && !eth?.isOkxWallet && !eth?.isOKExWallet && !eth?.isCoinbaseWallet && !eth?.isRabby && !eth?.isPhantom ? eth : null);
    if (trueMetaMask && !result.some(w => w.info?.name?.toLowerCase().includes('metamask'))) {
      result.push({
        info: { name: 'MetaMask', rdns: 'io.metamask', uuid: 'metamask' },
        provider: trueMetaMask,
      });
    }

    // 3. Check Coinbase Wallet
    const cb = window.coinbaseWalletExtension || providers.find(p => p.isCoinbaseWallet) || (eth?.isCoinbaseWallet ? eth : null);
    if (cb && !result.some(w => w.info?.name?.toLowerCase().includes('coinbase'))) {
      result.push({
        info: { name: 'Coinbase Wallet', rdns: 'com.coinbase.wallet', uuid: 'coinbase' },
        provider: cb,
      });
    }

    // 4. Check Rabby
    const rabby = window.rabby || providers.find(p => p.isRabby) || (eth?.isRabby ? eth : null);
    if (rabby && !result.some(w => w.info?.name?.toLowerCase().includes('rabby'))) {
      result.push({
        info: { name: 'Rabby Wallet', rdns: 'io.rabby', uuid: 'rabby' },
        provider: rabby,
      });
    }

    // 5. Check Phantom
    const phantom = window.phantom?.ethereum || providers.find(p => p.isPhantom) || (eth?.isPhantom ? eth : null);
    if (phantom && !result.some(w => w.info?.name?.toLowerCase().includes('phantom'))) {
      result.push({
        info: { name: 'Phantom', rdns: 'app.phantom', uuid: 'phantom' },
        provider: phantom,
      });
    }
  }

  return result;
}

// ── Resolve specific wallet WITHOUT fallback to random providers ─────────────
export function findProvider(targetWalletName = '') {
  if (typeof window === 'undefined') return null;

  const target = targetWalletName.toLowerCase().trim();
  const eth = window.ethereum;
  const providers = Array.isArray(eth?.providers) ? eth.providers : (eth ? [eth] : []);

  // 1. EIP-6963 matching
  for (const item of eip6963Providers) {
    if (item.info?.name?.toLowerCase().includes(target)) {
      return { provider: item.provider, name: item.info.name };
    }
  }

  // 2. Strict per-wallet matching
  if (target.includes('okx')) {
    const p = window.okxwallet || providers.find(p => p.isOkxWallet || p.isOKExWallet);
    if (p) return { provider: p, name: 'OKX Wallet' };
    return null;
  }

  if (target.includes('metamask')) {
    const p = providers.find(p => p.isMetaMask && !p.isOkxWallet && !p.isOKExWallet && !p.isCoinbaseWallet && !p.isRabby && !p.isPhantom) ||
              (eth?.isMetaMask && !eth?.isOkxWallet && !eth?.isOKExWallet && !eth?.isCoinbaseWallet && !eth?.isRabby && !eth?.isPhantom ? eth : null);
    if (p) return { provider: p, name: 'MetaMask' };
    return null;
  }

  if (target.includes('coinbase')) {
    const p = window.coinbaseWalletExtension || providers.find(p => p.isCoinbaseWallet) || (eth?.isCoinbaseWallet ? eth : null);
    if (p) return { provider: p, name: 'Coinbase Wallet' };
    return null;
  }

  if (target.includes('rabby')) {
    const p = window.rabby || providers.find(p => p.isRabby) || (eth?.isRabby ? eth : null);
    if (p) return { provider: p, name: 'Rabby Wallet' };
    return null;
  }

  if (target.includes('phantom')) {
    const p = window.phantom?.ethereum || providers.find(p => p.isPhantom) || (eth?.isPhantom ? eth : null);
    if (p) return { provider: p, name: 'Phantom' };
    return null;
  }

  if (target.includes('rainbow')) {
    const p = window.rainbow || providers.find(p => p.isRainbow) || (eth?.isRainbow ? eth : null);
    if (p) return { provider: p, name: 'Rainbow' };
    return null;
  }

  return null;
}
