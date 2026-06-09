import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
// const AUTH_TAG_LENGTH = 16; // GCM auth tag length (used by crypto.createCipheriv)

function getKey(): Buffer {
  const secret = process.env.KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('KEY_ENCRYPTION_SECRET not configured');
  }
  // Derive a 32-byte key from the secret
  return crypto.scryptSync(secret, 'saved-brain-salt', KEY_LENGTH);
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Check if a string is already encrypted (has the format)
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts[0].length === IV_LENGTH * 2;
}

// Encrypt all API keys in a config object
export function encryptKeys(config: Record<string, string>): Record<string, string> {
  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
      if (value && !isEncrypted(value)) {
        encrypted[key] = encrypt(value);
      } else {
        encrypted[key] = value;
      }
    } else {
      encrypted[key] = value;
    }
  }
  return encrypted;
}

// Decrypt all API keys in a config object
export function decryptKeys(config: Record<string, string>): Record<string, string> {
  const decrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
      if (value && isEncrypted(value)) {
        try {
          decrypted[key] = decrypt(value);
        } catch {
          decrypted[key] = value; // Keep as-is if decryption fails
        }
      } else {
        decrypted[key] = value;
      }
    } else {
      decrypted[key] = value;
    }
  }
  return decrypted;
}
