import { NextResponse } from 'next/server';
import { getActiveUrl } from '@/lib/kv';

/**
 * Target to channel mapping
 * Maps physical targets to content channels
 */
const targetToChannelMap: Record<string, string> = {
  // Scanner app targets (dollar bills)
  'onedollarbill': 'channel-one-dollar',
  'twodollarbill': 'channel-two-dollar',
  'fivedollarbill': 'channel-five-dollar',
  'tendollarbill': 'channel-ten-dollar',
  'twentydollarbill': 'channel-twenty-dollar',
  'fiftydollarbill': 'channel-fifty-dollar',
  'hundreddollarbill': 'channel-hundred-dollar',
  
  // TV Beta targets
  'hyperspace-labs': 'hyperspace-channel',
  'calendar-plaisio': 'music-channel',
  'mamba-mentality': 'motivation-channel',
  
  // Default fallback
  'default': 'default-channel'
};

/**
 * API endpoint to get the current active URL for a target
 * Uses Vercel KV for fast access to active URLs
 */
export async function GET(request: Request) {
  try {
    // Get target from query parameters
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'default';
    
    // Map target to channel
    const channel = targetToChannelMap[target] || 'default-channel';
    
    // Get the active URL from KV store using the channel as identifier
    const activeUrl = await getActiveUrl(channel);
    
    // Return the URL with CORS headers
    return NextResponse.json(
      { url: activeUrl }, 
      { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching current URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URL', url: 'https://hyperspace.digital/error' }, 
      { status: 500 }
    );
  }
} 