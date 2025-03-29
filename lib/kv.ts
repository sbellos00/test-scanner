import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Interface for target URL data structure
 */
interface TargetUrlData {
  url: string;
  introVideo?: string;
}

/**
 * Upstash Redis utilities for HyperSpace Scanner
 */

// Debug environment variables
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.warn('[Upstash Redis] Environment variables missing. URL or token not found.');
}

// Initialize Redis from explicit environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

/**
 * Get the active URL data for a target from Redis
 * @param target - Target identifier
 * @returns Active URL data for the target or default values if not found
 */
export async function getActiveUrl(target: string): Promise<TargetUrlData> {
  try {
    const activeUrlData = await redis.get<TargetUrlData>(`active_url:${target}`);
    
    if (activeUrlData) {
      return activeUrlData;
    }
    
    // For backward compatibility - if we find a string instead of an object
    const legacyUrl = await redis.get<string>(`active_url:${target}`);
    if (typeof legacyUrl === 'string') {
      return { url: legacyUrl };
    }
    
    // Return default if nothing found
    return { url: 'https://hyperspace.digital/default' };
  } catch (error) {
    console.error('Error fetching from Redis:', error);
    return { url: 'https://hyperspace.digital/error' };
  }
}

/**
 * Set the active URL data for a target in Redis
 * IMPORTANT! This is only for the set-up kv script that is used for migration/set-up purposes.
 * We NEVER use this function during our normal operations.
 * @param target - Target identifier
 * @param urlData - URL data object or string URL
 * @param expirationSeconds - Optional TTL in seconds
 * @returns True if successful, false otherwise
 */
export async function setActiveUrl(
  target: string, 
  urlData: TargetUrlData | string, 
  expirationSeconds?: number
): Promise<boolean> {
  try {
    // Handle both string URLs (legacy) and new URL data objects
    const dataToStore: TargetUrlData = typeof urlData === 'string' 
      ? { url: urlData } 
      : urlData;
    
    if (expirationSeconds) {
      // Set with expiration
      await redis.set(`active_url:${target}`, dataToStore, { ex: expirationSeconds });
    } else {
      // Set without expiration
      await redis.set(`active_url:${target}`, dataToStore);
    }
    return true;
  } catch (error) {
    console.error('Error setting Redis value:', error);
    return false;
  }
} 