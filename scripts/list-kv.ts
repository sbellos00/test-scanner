/**
 * Script to list all keys and values in Upstash Redis
 * Run with: npx tsx scripts/list-kv.ts
 */

import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Environment variables:');
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL);
console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? '***[exists]***' : 'undefined');

// Initialize Redis from explicit environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

async function listAll() {
  console.log('Fetching all keys from Upstash Redis...');

  try {
    // Get all keys matching active_url:*
    const keys = await redis.keys('active_url:*');
    
    if (keys.length === 0) {
      console.log('No active URLs found in the database.');
      return;
    }

    console.log(`Found ${keys.length} active URLs:`);
    
    // Get values for all keys
    for (const key of keys) {
      const value = await redis.get(key);
      const target = key.replace('active_url:', '');
      console.log(`- ${target}: ${value}`);
    }
  } catch (error) {
    console.error('Error fetching from Redis:', error);
  }
}

// Run the listing function
listAll(); 