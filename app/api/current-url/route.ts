import { NextResponse } from 'next/server';
import { getActiveUrl } from '@/lib/kv';

/**
 * API endpoint to get the current active URL for a target
 * Uses Vercel KV for fast access to active URLs
 */
export async function GET(request: Request) {
  try {
    // Get target from query parameters
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'default';
    
    // Get the active URL from KV store
    const activeUrl = await getActiveUrl(target);
    
    // Return the URL with CORS headers
    return NextResponse.json(
      { url: activeUrl }, 
      { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'max-age=60' // Cache for 1 minute
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