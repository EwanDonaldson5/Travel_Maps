import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Marker, Route, JournalEntry, SyncQueueItem } from '../types'

interface LivingstoneDB extends DBSchema {
  markers: {
    key: string
    value: Marker
    indexes: { 'by-created': string; 'by-synced': number }
  }
  routes: {
    key: string
    value: Route
    indexes: { 'by-created': string; 'by-synced': number }
  }
  journal: {
    key: string
    value: JournalEntry
    indexes: { 'by-date': string; 'by-synced': number }
  }
  syncQueue: {
    key: string
    value: SyncQueueItem
    indexes: { 'by-timestamp': string }
  }
  tiles: {
    key: string
    value: {
      url: string
      data: ArrayBuffer
      timestamp: number
    }
  }
}

let db: IDBPDatabase<LivingstoneDB> | null = null

export async function initDatabase(): Promise<IDBPDatabase<LivingstoneDB>> {
  if (db) return db

  db = await openDB<LivingstoneDB>('livingstone-maps', 1, {
    upgrade(database) {
      // Markers store
      const markerStore = database.createObjectStore('markers', { keyPath: 'id' })
      markerStore.createIndex('by-created', 'createdAt')
      markerStore.createIndex('by-synced', 'synced')

      // Routes store
      const routeStore = database.createObjectStore('routes', { keyPath: 'id' })
      routeStore.createIndex('by-created', 'createdAt')
      routeStore.createIndex('by-synced', 'synced')

      // Journal store
      const journalStore = database.createObjectStore('journal', { keyPath: 'id' })
      journalStore.createIndex('by-date', 'date')
      journalStore.createIndex('by-synced', 'synced')

      // Sync queue store
      const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id' })
      syncStore.createIndex('by-timestamp', 'timestamp')

      // Tiles cache store
      database.createObjectStore('tiles', { keyPath: 'url' })
    },
  })

  return db
}

export function getDB(): IDBPDatabase<LivingstoneDB> {
  if (!db) throw new Error('Database not initialized')
  return db
}

// Marker operations
export async function saveMarker(marker: Marker): Promise<void> {
  const database = getDB()
  await database.put('markers', marker)
}

export async function getMarker(id: string): Promise<Marker | undefined> {
  const database = getDB()
  return database.get('markers', id)
}

export async function getAllMarkers(): Promise<Marker[]> {
  const database = getDB()
  return database.getAll('markers')
}

export async function deleteMarker(id: string): Promise<void> {
  const database = getDB()
  await database.delete('markers', id)
}

// Route operations
export async function saveRoute(route: Route): Promise<void> {
  const database = getDB()
  await database.put('routes', route)
}

export async function getRoute(id: string): Promise<Route | undefined> {
  const database = getDB()
  return database.get('routes', id)
}

export async function getAllRoutes(): Promise<Route[]> {
  const database = getDB()
  return database.getAll('routes')
}

export async function deleteRoute(id: string): Promise<void> {
  const database = getDB()
  await database.delete('routes', id)
}

// Journal operations
export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const database = getDB()
  await database.put('journal', entry)
}

export async function getJournalEntry(id: string): Promise<JournalEntry | undefined> {
  const database = getDB()
  return database.get('journal', id)
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const database = getDB()
  const entries = await database.getAll('journal')
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const database = getDB()
  await database.delete('journal', id)
}

// Sync queue operations
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const database = getDB()
  await database.put('syncQueue', item)
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const database = getDB()
  return database.getAllFromIndex('syncQueue', 'by-timestamp')
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = getDB()
  await database.delete('syncQueue', id)
}

export async function clearSyncQueue(): Promise<void> {
  const database = getDB()
  await database.clear('syncQueue')
}

// Tile caching
export async function cacheTile(url: string, data: ArrayBuffer): Promise<void> {
  const database = getDB()
  await database.put('tiles', { url, data, timestamp: Date.now() })
}

export async function getCachedTile(url: string): Promise<ArrayBuffer | undefined> {
  const database = getDB()
  const tile = await database.get('tiles', url)
  return tile?.data
}

// Get unsynced items count
export async function getUnsyncedCount(): Promise<number> {
  const database = getDB()
  const queue = await database.getAll('syncQueue')
  return queue.length
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
