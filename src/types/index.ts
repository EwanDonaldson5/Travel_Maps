export type MarkerType = 'campsite' | 'viewpoint' | 'water' | 'wildlife' | 'danger' | 'parking' | 'custom'

export interface Marker {
  id: string
  name: string
  description?: string
  type: MarkerType
  coordinates: [number, number] // [lng, lat]
  color?: string
  icon?: string
  photos?: string[] // Base64 encoded images
  createdAt: string
  updatedAt: string
  synced: boolean
}

export interface RoutePoint {
  coordinates: [number, number]
  elevation?: number
  timestamp?: string
}

export interface Route {
  id: string
  name: string
  description?: string
  points: RoutePoint[]
  color: string
  distance?: number // in meters
  duration?: number // in seconds
  elevationGain?: number
  createdAt: string
  updatedAt: string
  synced: boolean
}

export interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  location?: {
    name: string
    coordinates: [number, number]
  }
  weather?: string
  mood?: 'great' | 'good' | 'okay' | 'challenging'
  photos?: string[] // Base64 encoded images
  markers?: string[] // Marker IDs
  routes?: string[] // Route IDs
  tags?: string[]
  createdAt: string
  updatedAt: string
  synced: boolean
}

export interface Guide {
  id: string
  title: string
  category: 'safety' | 'navigation' | 'wildlife' | 'camping' | 'weather' | 'gear'
  summary: string
  content: string
  icon: string
  isPremium: boolean
}

export interface SyncQueueItem {
  id: string
  type: 'marker' | 'route' | 'journal'
  action: 'create' | 'update' | 'delete'
  data: Marker | Route | JournalEntry | { id: string }
  timestamp: string
  retries: number
}
