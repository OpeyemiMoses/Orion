import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet } from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'OrionX Sentinel Agent',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c046e7f22ec6866290076a5996e38b30',
  chains: [base, mainnet],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
  },
  ssr: false,
});
