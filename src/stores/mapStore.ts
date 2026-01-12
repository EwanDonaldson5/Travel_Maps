import { create } from 'zustand'
import type { Marker, Route } from '../types'

interface MapState {
  center: [number, number]
  zoom: number
  markers: Marker[]
  routes: Route[]
  activeMarkerId: string | null
  activeRouteId: string | null
  isRecordingRoute: boolean
  currentRoutePoints: [number, number][]
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setMarkers: (markers: Marker[]) => void
  addMarker: (marker: Marker) => void
  updateMarker: (id: string, updates: Partial<Marker>) => void
  removeMarker: (id: string) => void
  setRoutes: (routes: Route[]) => void
  addRoute: (route: Route) => void
  updateRoute: (id: string, updates: Partial<Route>) => void
  removeRoute: (id: string) => void
  setActiveMarkerId: (id: string | null) => void
  setActiveRouteId: (id: string | null) => void
  startRecordingRoute: () => void
  stopRecordingRoute: () => void
  addRoutePoint: (point: [number, number]) => void
  clearCurrentRoutePoints: () => void
}

export const useMapStore = create<MapState>((set) => ({
  center: [-1.5, 53.0], // Default to UK
  zoom: 10,
  markers: [],
  routes: [],
  activeMarkerId: null,
  activeRouteId: null,
  isRecordingRoute: false,
  currentRoutePoints: [],
  
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  
  setMarkers: (markers) => set({ markers }),
  addMarker: (marker) => set((state) => ({ markers: [...state.markers, marker] })),
  updateMarker: (id, updates) => set((state) => ({
    markers: state.markers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  })),
  removeMarker: (id) => set((state) => ({
    markers: state.markers.filter((m) => m.id !== id),
    activeMarkerId: state.activeMarkerId === id ? null : state.activeMarkerId,
  })),
  
  setRoutes: (routes) => set({ routes }),
  addRoute: (route) => set((state) => ({ routes: [...state.routes, route] })),
  updateRoute: (id, updates) => set((state) => ({
    routes: state.routes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),
  removeRoute: (id) => set((state) => ({
    routes: state.routes.filter((r) => r.id !== id),
    activeRouteId: state.activeRouteId === id ? null : state.activeRouteId,
  })),
  
  setActiveMarkerId: (id) => set({ activeMarkerId: id }),
  setActiveRouteId: (id) => set({ activeRouteId: id }),
  
  startRecordingRoute: () => set({ isRecordingRoute: true, currentRoutePoints: [] }),
  stopRecordingRoute: () => set({ isRecordingRoute: false }),
  addRoutePoint: (point) => set((state) => ({
    currentRoutePoints: [...state.currentRoutePoints, point],
  })),
  clearCurrentRoutePoints: () => set({ currentRoutePoints: [] }),
}))
