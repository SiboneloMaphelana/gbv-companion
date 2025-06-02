import AsyncStorage from '@react-native-async-storage/async-storage';
import { securityManager } from './security';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  hash: string;
}

class CacheManager {
  private static instance: CacheManager;
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly CACHE_PREFIX = 'cache_';

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async initializeCache() {
    try {
      await this.cleanExpiredCache();
      await this.enforceMaxSize();
    } catch (error) {
      console.error('Cache initialization error:', error);
    }
  }

  async set<T>(
    key: string,
    data: T,
    expiryMs: number = this.DEFAULT_EXPIRY
  ): Promise<void> {
    try {
      const hash = await securityManager.generateHash(JSON.stringify(data));
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        hash,
      };

      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(item));

      // Update cache size after adding new item
      await this.enforceMaxSize();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const item = await AsyncStorage.getItem(cacheKey);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Verify data integrity
      const currentHash = await securityManager.generateHash(
        JSON.stringify(cacheItem.data)
      );
      if (currentHash !== cacheItem.hash) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  private async cleanExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (!item) continue;

        const cacheItem: CacheItem<any> = JSON.parse(item);
        if (Date.now() - cacheItem.timestamp > this.DEFAULT_EXPIRY) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  private async enforceMaxSize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

      let totalSize = 0;
      const items: { key: string; size: number; timestamp: number }[] = [];

      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (!item) continue;

        const size = new Blob([item]).size;
        const { timestamp } = JSON.parse(item) as CacheItem<any>;
        
        items.push({ key, size, timestamp });
        totalSize += size;
      }

      if (totalSize > this.MAX_CACHE_SIZE) {
        // Sort by timestamp (oldest first) and remove until under max size
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        while (totalSize > this.MAX_CACHE_SIZE && items.length > 0) {
          const item = items.shift()!;
          await AsyncStorage.removeItem(item.key);
          totalSize -= item.size;
        }
      }
    } catch (error) {
      console.error('Cache size enforcement error:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const cacheManager = CacheManager.getInstance(); 