import { NextResponse } from 'next/server';
import { getActiveUrl } from '@/lib/kv';
import { getChannel } from '@/lib/mappings';

export async function GET(request: Request) {
  try {
    // Check the referer header to ensure it's coming from our app
    const referer = request.headers.get('referer');
    const allowedDomains = [
      'scanhyper.space',
      'www.scanhyper.space',
      'test-scanner-rho.vercel.app',
      'tv-2-0.vercel.app',
      'localhost:3000' // For local development
    ];
    
    const isValidReferer = referer && 
      allowedDomains.some(domain => referer.includes(domain));
    
    if (!isValidReferer) {
      return NextResponse.json(
        { error: 'wah gwan delilah, pay my respects to your padre por favooooor, muchacho cholocato, me gusto me ninia' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'default';

    const channel = getChannel(target);
    const activeUrlData = await getActiveUrl(channel);

    // Return the complete data object with both url and introVideo (if present)
    return NextResponse.json(
      activeUrlData,
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
      { url: 'https://hyperspace.digital/error' },
      { status: 500 }
    );
  }
}