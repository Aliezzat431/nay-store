import crypto from 'crypto';

export const KASHIER_CONFIG = {
  merchantId: process.env.NEXT_PUBLIC_KASHIER_MERCHANT_ID || '',
  secretKey: process.env.KASHIER_SECRET_KEY || '',
  mode: process.env.KASHIER_MODE || 'test', // 'test' or 'live'
  currency: 'EGP',
};

/**
 * Generates Kashier HMAC Signature for secure client-side checkout
 */
export function generateKashierSignature(orderId: string, amount: number): string {
  if (!KASHIER_CONFIG.secretKey) {
    throw new Error('KASHIER_SECRET_KEY is not defined in environment variables');
  }

  // Kashier signature format: orderId + amount + currency
  const message = `${orderId}${amount.toFixed(2)}${KASHIER_CONFIG.currency}`;
  
  return crypto
    .createHmac('sha256', KASHIER_CONFIG.secretKey)
    .update(message)
    .digest('hex');
}

export const PLATFORM_FEE_PERCENT = 0.05; // 5% platform fee