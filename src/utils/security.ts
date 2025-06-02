import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../config/app.config';

class SecurityManager {
  private static instance: SecurityManager;
  private readonly ENCRYPTION_KEY = 'gbv_companion_key';

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getOrCreateKey();
      const iv = await Crypto.getRandomBytesAsync(16);
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      return `${encrypted}.${iv.join(',')}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encryptedData: string): Promise<string | null> {
    try {
      const [data, iv] = encryptedData.split('.');
      if (!data || !iv) return null;

      const key = await this.getOrCreateKey();
      const decrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + key
      );
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  private async getOrCreateKey(): Promise<string> {
    try {
      let key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      if (!key) {
        key = (await Crypto.getRandomBytesAsync(32)).join(',');
        await SecureStore.setItemAsync(this.ENCRYPTION_KEY, key);
      }
      return key;
    } catch (error) {
      console.error('Key generation error:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  async secureStore(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = await this.encryptData(value);
      await SecureStore.setItemAsync(key, encryptedValue);
    } catch (error) {
      console.error('Secure store error:', error);
      throw new Error('Failed to store data securely');
    }
  }

  async secureRetrieve(key: string): Promise<string | null> {
    try {
      const encryptedValue = await SecureStore.getItemAsync(key);
      if (!encryptedValue) return null;
      return this.decryptData(encryptedValue);
    } catch (error) {
      console.error('Secure retrieve error:', error);
      return null;
    }
  }

  async secureDelete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Secure delete error:', error);
      throw new Error('Failed to delete data');
    }
  }

  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters and limit length
    return input
      .replace(/[<>{}]/g, '')
      .replace(/[&]/g, 'and')
      .trim()
      .slice(0, 1000);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  }

  async generateHash(data: string): Promise<string> {
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
  }

  // Session management
  private readonly SESSION_KEY = 'active_session';
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  async createSession(userId: string): Promise<void> {
    const session = {
      userId,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    };
    await this.secureStore(this.SESSION_KEY, JSON.stringify(session));
  }

  async validateSession(): Promise<boolean> {
    const sessionData = await this.secureRetrieve(this.SESSION_KEY);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      if (Date.now() > session.expiresAt) {
        await this.secureDelete(this.SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async clearSession(): Promise<void> {
    await this.secureDelete(this.SESSION_KEY);
  }
}

export const securityManager = SecurityManager.getInstance();

/**
 * Encrypts and stores data securely
 */
export async function secureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error storing data:', error);
    throw new Error('Failed to store data securely');
  }
}

/**
 * Retrieves encrypted data
 */
export async function secureRetrieve(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw new Error('Failed to retrieve data');
  }
}

/**
 * Generates a secure hash of data
 */
export async function generateHash(data: string): Promise<string> {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    throw new Error('Failed to generate hash');
  }
}

/**
 * Clears all secure storage
 */
export async function clearSecureStorage(): Promise<void> {
  try {
    const keys = [
      APP_CONFIG.storageKeys.journalEntries,
      APP_CONFIG.storageKeys.emergencyContacts,
      APP_CONFIG.storageKeys.userPreferences,
    ];

    await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    throw new Error('Failed to clear secure storage');
  }
}

/**
 * Validates data safety
 */
export function validateDataSafety(data: any): boolean {
  // Add validation rules as needed
  return (
    data !== null &&
    typeof data !== 'undefined' &&
    !containsSensitiveData(data)
  );
}

/**
 * Checks for sensitive data patterns
 */
function containsSensitiveData(data: any): boolean {
  if (typeof data !== 'string') return false;

  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{16}\b/, // Credit card
    /password/i,
    /secret/i,
  ];

  return sensitivePatterns.some(pattern => pattern.test(data));
}

/**
 * Sanitizes data for safe storage
 */
export function sanitizeData(data: string): string {
  return data
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .trim();
}

/**
 * Generates a random secure key
 */
export async function generateSecureKey(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Buffer.from(randomBytes).toString('hex');
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): boolean {
  const minLength = APP_CONFIG.security.passwordMinLength;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
} 