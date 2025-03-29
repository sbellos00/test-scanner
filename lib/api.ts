/**
 * API client for HyperSpace Scanner
 */

/**
 * Interface for target URL data structure
 */
interface TargetUrlData {
  url: string;
  introVideo?: string;
}

/**
 * Fetches the active URL data for a given target from the API
 * @param target - The target image identifier
 * @returns The active URL data for the target
 */
export async function fetchActiveUrl(target: string): Promise<TargetUrlData> {
  try {
    // Use relative URL for API requests in the browser
    const response = await fetch(`/api/current-url?target=${target}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Return the complete data object
    return await response.json();
  } catch (error) {
    console.error('Error fetching active URL:', error);
    return { url: 'https://hyperspace.digital/error' };
  }
} 