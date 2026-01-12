/**
 * Offline tile caching utilities
 * Handles tile requests with offline-first approach
 */

import type maplibregl from 'maplibre-gl'
import { getCachedTile } from './db'

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Transform request for MapLibre to use offline cache
 * This intercepts tile requests - service worker handles caching
 */
export function transformRequest(): { url?: string } | undefined {
  // Let tiles go through normally
  // The service worker CacheFirst strategy will handle offline caching
  // If a tile is in the cache, it will be served even when offline
  return undefined
}

/**
 * Setup tile caching by intercepting tile loads
 * This is primarily for tracking - service worker does the actual caching
 */
export function setupTileCaching(map: maplibregl.Map): void {
  // MapLibre will automatically use cached tiles from the service worker
  // when offline. The CacheFirst strategy in the service worker ensures
  // cached tiles are served even when offline.
  
  // We can listen for load events to track caching
  map.on('sourcedata', (e) => {
    if (e.isSourceLoaded && e.sourceId) {
      // Source loaded successfully
      // Tiles are being served from cache if offline
    }
  })
}

/**
 * Pre-cache tiles for a specific area
 * Useful for downloading map data before going offline
 */
export async function precacheArea(
  bounds: { north: number; south: number; east: number; west: number },
  zoomLevels: number[] = [10, 11, 12, 13, 14],
  tileBaseUrl: string
): Promise<number> {
  let cachedCount = 0
  
  for (const zoom of zoomLevels) {
    const tiles = calculateTilesInBounds(bounds, zoom)
    
    for (const tile of tiles) {
      const url = tileBaseUrl
        .replace('{z}', zoom.toString())
        .replace('{x}', tile.x.toString())
        .replace('{y}', tile.y.toString())
      
      try {
        // Check if already cached
        const cached = await getCachedTile(url)
        if (cached) {
          cachedCount++
          continue
        }
        
        // Fetch and cache - service worker handles caching automatically
        const response = await fetch(url)
        if (response.ok) {
          // Tile is automatically cached by service worker
          cachedCount++
        }
      } catch (error) {
        console.warn(`Failed to cache tile ${url}:`, error)
      }
    }
  }
  
  return cachedCount
}

/**
 * Calculate tile coordinates for a bounding box
 */
function calculateTilesInBounds(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number
): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = []
  
  const northTile = lat2tile(bounds.north, zoom)
  const southTile = lat2tile(bounds.south, zoom)
  const westTile = lon2tile(bounds.west, zoom)
  const eastTile = lon2tile(bounds.east, zoom)
  
  for (let x = westTile; x <= eastTile; x++) {
    for (let y = northTile; y <= southTile; y++) {
      tiles.push({ x, y })
    }
  }
  
  return tiles
}

function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
}

function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  )
}
