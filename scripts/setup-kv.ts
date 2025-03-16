/**
 * Script to populate Upstash Redis with initial URL values
 * Run with: npx tsx scripts/setup-kv.ts
 */

import { setActiveUrl } from '../lib/kv';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const INITIAL_URLS = {
  'default': 'https://open.spotify.com/album/0hvT3yIEysuuvkK73vgdcW',
  'onedollarbill': 'https://hyperspace.digital/one',
  'twodollarbill': 'https://hyperspace.digital/two',
  'fivedollarbill': 'https://hyperspace.digital/five',
  'tendollarbill': 'https://hyperspace.digital/ten',
  'twentydollarbill': 'https://hyperspace.digital/twenty',
  'fiftydollarbill': 'https://hyperspace.digital/fifty',
  'hundreddollarbill': 'https://hyperspace.digital/hundred'
};

async function setup() {
  console.log('Setting up initial URLs in Upstash Redis...');

  try {
    const promises = Object.entries(INITIAL_URLS).map(async ([target, url]) => {
      const success = await setActiveUrl(target, url);
      console.log(`${target}: ${success ? 'Success' : 'Failed'}`);
      return success;
    });

    const results = await Promise.all(promises);
    const allSucceeded = results.every(Boolean);

    if (allSucceeded) {
      console.log('✅ All URLs set successfully');
    } else {
      console.error('❌ Some URLs failed to set');
    }
  } catch (error) {
    console.error('Error setting up Redis:', error);
  }
}

// Run the setup
setup(); 