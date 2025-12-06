import crypto from 'crypto';

/**
 * Magic Link Token Structure
 * Format: {eventId}.{timestamp}.{signature}
 */

const MAGIC_LINK_SECRET = process.env.JWT_SECRET || 'supersecret';
const TOKEN_VALIDITY_HOURS = 48; // Magic links valid for 48 hours

export interface MagicLinkTokenData {
  eventId: string;
  timestamp: number;
}

/**
 * Generates a secure magic link token for chef event authentication
 * @param eventId - The chef event ID
 * @returns A signed token string
 */
export function generateMagicLinkToken(eventId: string): string {
  const timestamp = Date.now();
  const data = `${eventId}.${timestamp}`;

  // Create HMAC signature
  const signature = crypto.createHmac('sha256', MAGIC_LINK_SECRET).update(data).digest('hex');

  return `${data}.${signature}`;
}

/**
 * Verifies a magic link token and extracts the event ID
 * @param token - The magic link token to verify
 * @returns The event ID if valid, null otherwise
 */
export function verifyMagicLinkToken(token: string): string | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [eventId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return null;
    }

    // Check if token has expired
    const expiryTime = timestamp + TOKEN_VALIDITY_HOURS * 60 * 60 * 1000;
    if (Date.now() > expiryTime) {
      return null;
    }

    // Verify signature
    const data = `${eventId}.${timestamp}`;
    const expectedSignature = crypto.createHmac('sha256', MAGIC_LINK_SECRET).update(data).digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    return eventId;
  } catch (error) {
    return null;
  }
}

/**
 * Generates the full magic link URL for email
 * @param eventId - The chef event ID
 * @param baseUrl - The admin backend URL
 * @returns The complete magic link URL
 */
export function generateMagicLinkUrl(eventId: string, baseUrl: string): string {
  const token = generateMagicLinkToken(eventId);
  return `${baseUrl}/auth/magic-link/${token}`;
}
