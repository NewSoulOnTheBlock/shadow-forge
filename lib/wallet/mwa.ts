'use client';

// =============================================================================
// Solana wallet sign-in (Wallet Standard + Solana Mobile Wallet Adapter).
// -----------------------------------------------------------------------------
// We register the Mobile Wallet Adapter as a Wallet Standard wallet (so it shows
// up alongside desktop extension wallets like Phantom/Solflare), enumerate all
// Solana wallets, and run a connect -> signMessage flow. The signed message is
// verified server-side in /api/auth/verify. All imports are dynamic so nothing
// touches `window` during SSR.
// =============================================================================
import type { Wallet, WalletAccount } from '@wallet-standard/base';

const CONNECT = 'standard:connect';
const SIGN_MESSAGE = 'solana:signMessage';

let registered = false;

async function ensureRegistered(): Promise<void> {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  const {
    registerMwa,
    createDefaultAuthorizationCache,
    createDefaultChainSelector,
    createDefaultWalletNotFoundHandler,
  } = await import('@solana-mobile/wallet-standard-mobile');

  registerMwa({
    appIdentity: {
      name: 'Legend of Ki',
      uri: window.location.origin,
      icon: 'favicon.svg',
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ['solana:mainnet'],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  });
}

export interface UiWallet {
  name: string;
  icon: string;
  wallet: Wallet;
}

function isSolanaSignInWallet(w: Wallet): boolean {
  return CONNECT in w.features && SIGN_MESSAGE in w.features;
}

/** All wallets that can connect + sign a message (desktop extensions + MWA). */
export async function listWallets(): Promise<UiWallet[]> {
  await ensureRegistered();
  const { getWallets } = await import('@wallet-standard/app');
  return getWallets()
    .get()
    .filter(isSolanaSignInWallet)
    .map((w) => ({ name: w.name, icon: w.icon, wallet: w }));
}

/** Subscribe to wallet registration changes (extensions register asynchronously). */
export async function onWalletsChange(cb: () => void): Promise<() => void> {
  await ensureRegistered();
  const { getWallets } = await import('@wallet-standard/app');
  const wallets = getWallets();
  const offReg = wallets.on('register', cb);
  const offUnreg = wallets.on('unregister', cb);
  return () => {
    offReg();
    offUnreg();
  };
}

/** Connect a wallet, build the sign-in message for the connected address, and sign it once. */
export async function connectAndSign(
  wallet: Wallet,
  getMessage: (address: string) => Promise<string> | string,
): Promise<{ address: string; signature: string }> {
  type ConnectFeature = { connect: () => Promise<{ accounts: readonly WalletAccount[] }> };
  type SignFeature = {
    signMessage: (input: { account: WalletAccount; message: Uint8Array }) => Promise<
      readonly { signedMessage: Uint8Array; signature: Uint8Array }[]
    >;
  };

  const connectFeature = wallet.features[CONNECT] as ConnectFeature;
  const { accounts } = await connectFeature.connect();
  const account = accounts[0] ?? wallet.accounts[0];
  if (!account) throw new Error('No wallet account was authorized.');

  const message = await getMessage(account.address);
  const signFeature = wallet.features[SIGN_MESSAGE] as SignFeature;
  const results = await signFeature.signMessage({
    account,
    message: new TextEncoder().encode(message),
  });
  const signatureBytes = results[0]?.signature;
  if (!signatureBytes) throw new Error('Wallet did not return a signature.');

  let binary = '';
  for (const b of signatureBytes) binary += String.fromCharCode(b);
  return { address: account.address, signature: btoa(binary) };
}
