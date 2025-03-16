import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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
 * Get the active URL for a target from Redis
 * @param target - Target identifier
 * @returns Active URL for the target or default URL if not found
 */
export async function getActiveUrl(target: string): Promise<string> {
  try {
    const activeUrl = await redis.get<string>(`active_url:${target}`);
    
    // Return the active URL if found, or a default URL if not
    return activeUrl || 'https://hyperspace.digital/default';
  } catch (error) {
    console.error('Error fetching from Redis:', error);
    return 'https://hyperspace.digital/error';
  }
}

/**
 * Set the active URL for a target in Redis
 * @param target - Target identifier
 * @param url - URL to set as active
 * @param expirationSeconds - Optional TTL in seconds
 * @returns True if successful, false otherwise
 */
export async function setActiveUrl(
  target: string, 
  url: string, 
  expirationSeconds?: number
): Promise<boolean> {
  try {
    if (expirationSeconds) {
      // Set with expiration
      await redis.set(`active_url:${target}`, url, { ex: expirationSeconds });
    } else {
      // Set without expiration
      await redis.set(`active_url:${target}`, url);
    }
    return true;
  } catch (error) {
    console.error('Error setting Redis value:', error);
    return false;
  }
} 