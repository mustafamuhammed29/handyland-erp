import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In development without an env var, we fallback to a deterministic dummy key so things don't crash, 
// but in production it MUST throw if not present.
const fallbackKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY || fallbackKey;
  
  if (hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  
  return Buffer.from(hexKey, 'hex');
}

export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

export function decrypt(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) return null;
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      // It might not be encrypted (legacy data or plaintext), return as is for backward compatibility during dev
      return encryptedData;
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedData; // Fallback to raw data if decryption fails
  }
}
