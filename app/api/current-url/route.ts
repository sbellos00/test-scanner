import { NextResponse } from 'next/server';

// This is a temporary implementation until the database 
// integration is complete. In the future, this would 
// fetch from a cached database value updated every 30 minutes.
export async function GET(request: Request) {
  try {
    // Include the target parameter in URL
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'default';
    
    // Simulate different URLs for different targets
    // This will be replaced with actual database lookups
    const targetUrls: Record<string, string> = {
      'default': 'https://open.spotify.com/album/0hvT3yIEysuuvkK73vgdcW',
      'onedollarbill': 'https://hyperspace.digital/one',
      'twodollarbill': 'https://hyperspace.digital/two',
      'fivedollarbill': 'https://hyperspace.digital/five',
      'tendollarbill': 'https://hyperspace.digital/ten',
      'twentydollarbill': 'https://hyperspace.digital/twenty',
      'fiftydollarbill': 'https://hyperspace.digital/fifty',
      'hundreddollarbill': 'https://hyperspace.digital/hundred'
    };

    // Get the active URL for the target
    const activeUrl = targetUrls[target] || targetUrls['default'];
    
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