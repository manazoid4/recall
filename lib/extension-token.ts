/**
 * Extension API tokens — long-lived JWTs for Chrome extension auth.
 * Signed with KEY_ENCRYPTION_SECRET, type claim = "extension".
 * Expire after 365 days. Users can revoke by generating a new token.
 */
import { SignJWT, jwtVerify } from 'jose';

const ISSUER = 'recall-extension';
const AUDIENCE = 'recall-api';
const EXPIRY = '365d';

function getSecret(): Uint8Array {
  const raw = process.env.KEY_ENCRYPTION_SECRET;
  if (!raw) throw new Error('KEY_ENCRYPTION_SECRET not set');
  return new TextEncoder().encode(raw.padEnd(32, '0').slice(0, 32));
}

export interface ExtensionTokenPayload {
  userId: string;
  type: 'extension';
}

export async function signExtensionToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: 'extension' } satisfies ExtensionTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifyExtensionToken(
  token: string
): Promise<ExtensionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.type !== 'extension' || typeof payload.userId !== 'string') {
      return null;
    }
    return { userId: payload.userId as string, type: 'extension' };
  } catch {
    return null;
  }
}
