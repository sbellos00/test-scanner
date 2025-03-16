/**
 * API client for HyperSpace Scanner
 */

/**
 * Fetches the active URL for a given target from the API
 * @param target - The target image identifier
 * @returns The active URL for the target
 */
export async function fetchActiveUrl(target: string): Promise<string> {
  try {
    // Use relative URL for API requests in the browser
    const response = await fetch(`/api/current-url?target=${target}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error fetching active URL:', error);
    return 'https://hyperspace.digital/error';
  }
} 