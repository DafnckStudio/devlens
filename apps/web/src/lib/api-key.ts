import { randomBytes } from 'crypto';

/**
 * Generate a secure API key with prefix
 * Format: devlens_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (36 chars total)
 */
export function generateApiKey(prefix: string = 'devlens'): string {
  const randomPart = randomBytes(20).toString('hex');
  return `${prefix}_${randomPart}`;
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  return /^[a-z]+_[a-f0-9]{40}$/.test(apiKey);
}

/**
 * Mask API key for display (show first and last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 12) return '***';
  return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
}
