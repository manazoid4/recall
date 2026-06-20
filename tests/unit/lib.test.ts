import { describe, it, expect } from 'vitest';
import { checkEntitlements } from '../../lib/entitlements';
import { encrypt, decrypt, isEncrypted } from '../../lib/encryption';
import { cosineSimilarity } from '../../lib/semantic-search';

describe('Encryption', () => {
  it('should encrypt and decrypt a string', () => {
    const original = 'test-api-key-12345';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(isEncrypted(encrypted)).toBe(true);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should detect non-encrypted strings', () => {
    expect(isEncrypted('plain text')).toBe(false);
    expect(isEncrypted('')).toBe(false);
  });
});

describe('Cosine Similarity', () => {
  it('should return 1 for identical vectors', () => {
    const a = [1, 0, 0];
    const b = [1, 0, 0];
    expect(cosineSimilarity(a, b)).toBe(1);
  });

  it('should return 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('should throw on dimension mismatch', () => {
    const a = [1, 0];
    const b = [1, 0, 0];
    expect(() => cosineSimilarity(a, b)).toThrow();
  });
});

describe('Entitlements', () => {
  it('should allow anonymous users', async () => {
    const result = await checkEntitlements(null, 'create_item');
    expect(result.allowed).toBe(true);
  });

  it('should allow anonymous users to use features', async () => {
    const result = await checkEntitlements(null, 'use_feature', 'basic_search');
    expect(result.allowed).toBe(true);
  });
});
