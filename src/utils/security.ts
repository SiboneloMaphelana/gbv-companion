import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { APP_CONFIG } from '../config/app.config';

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