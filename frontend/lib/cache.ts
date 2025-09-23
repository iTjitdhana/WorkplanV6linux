// Client-side caching utilities
import { debugLog } from './config';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Set cache with TTL (time to live)
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };
    
    this.cache.set(key, item);
    debugLog(`Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  // Get cache if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      debugLog(`Cache MISS: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      debugLog(`Cache EXPIRED: ${key}`);
      return null;
    }

    debugLog(`Cache HIT: ${key}`);
    return item.data;
  }

  // Check if cache exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Clear specific cache
  delete(key: string): void {
    this.cache.delete(key);
    debugLog(`Cache DELETE: ${key}`);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    debugLog('Cache CLEAR: All items cleared');
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    const total = this.cache.size;
    let expired = 0;
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expired++;
      }
    });

    return {
      total,
      expired,
      active: total - expired
    };
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      debugLog(`Cache CLEANUP: Removed ${keysToDelete.length} expired items`);
    }
  }
}

// Global cache instance
export const clientCache = new ClientCache();

// Cache keys constants
export const CACHE_KEYS = {
  USERS: 'users',
  MACHINES: 'machines',
  PRODUCTION_ROOMS: 'production_rooms',
  WORK_PLANS: (date?: string, page?: number) => 
    `work_plans${date ? `_${date}` : ''}${page ? `_page_${page}` : ''}`,
  WORK_PLAN_DRAFTS: 'work_plan_drafts',
  PROCESS_STEPS: (jobCode?: string) => 
    `process_steps${jobCode ? `_${jobCode}` : ''}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes - สำหรับข้อมูลที่เปลี่ยนบ่อย
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - สำหรับข้อมูลปกติ
  LONG: 15 * 60 * 1000,      // 15 minutes - สำหรับข้อมูลที่ไม่เปลี่ยนบ่อย
  VERY_LONG: 60 * 60 * 1000, // 1 hour - สำหรับข้อมูล master data
} as const;

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup();
  }, 5 * 60 * 1000);
}

export default clientCache;




