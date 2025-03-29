/**
 * Target to channel mapping
 * Maps physical targets to content channels
 */
import targetMappings from '@/config/targetMappings.json';

export function getChannel(target: string): string {
  return (targetMappings as Record<string, string>)[target] || 'default-channel';
}