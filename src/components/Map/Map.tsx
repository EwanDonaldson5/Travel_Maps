import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '../../stores/mapStore'
import { useAppStore } from '../../stores/appStore'
import { getAllMarkers, getAllRoutes } from '../../lib/db'
import { setupTileCaching } from '../../lib/mapTileCache'
import MapControls from './MapControls'
import MarkerPopup from './MarkerPopup'
import { WifiOff } from 'lucide-react'
import styles from './Map.module.css'

// Free tile sources
const TILE_SOURCES = {
  osm: {
    name: 'OpenStreetMap',
    style: {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster' as const,
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  topo: {
    name: 'Topographic',
    style: {
      version: 8 as const,
      sources: {
        topo: {
          type: 'raster' as const,
          tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenTopoMap contributors',
        },
      },
      layers: [
        {
          id: 'topo-tiles',
          type: 'raster' as const,
          source: 'topo',
          minzoom: 0,
          maxzoom: 17,
        },
      ],
    },
  },
}

interface MapProps {
  onMapReady?: (map: maplibregl.Map) => void
}

export default function Map({ onMapReady }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeStyle, setActiveStyle] = useState<'osm' | 'topo'>('osm')
  const recordingRef = useRef({ isRecordingRoute: false, addRoutePoint: null as any })
  
  const { 
    center, 
    zoom, 
    markers, 
    routes,
    setMarkers, 
    setRoutes,
    setCenter, 
    setZoom,
    activeMarkerId,
    setActiveMarkerId,
    isRecordingRoute,
    currentRoutePoints,
    addRoutePoint,
  } = useMapStore()
  
  const isDbReady = useAppStore((state) => state.isDbReady)
  const isOnline = useAppStore((state) => state.isOnline)

  // Update recording ref when values change
  useEffect(() => {
    recordingRef.current.isRecordingRoute = isRecordingRoute
    recordingRef.current.addRoutePoint = addRoutePoint
  }, [isRecordingRoute, addRoutePoint])

  // Load data from IndexedDB
  useEffect(() => {
    if (!isDbReady) return
    
    const loadData = async () => {
      const [loadedMarkers, loadedRoutes] = await Promise.all([
        getAllMarkers(),
        getAllRoutes(),
      ])
      setMarkers(loadedMarkers)
      setRoutes(loadedRoutes)
    }
    
    loadData()
  }, [isDbReady, setMarkers, setRoutes])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const container = mapContainer.current
    
    // Ensure container has dimensions before initializing
    const initMap = () => {
      if (!container || map.current) return

      map.current = new maplibregl.Map({
        container: container,
        style: TILE_SOURCES[activeStyle].style,
        center: center,
        zoom: zoom,
        attributionControl: false,
      })

      map.current.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-left'
      )

      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'bottom-right'
      )

      map.current.on('load', () => {
        setIsLoading(false)
        // Setup offline tile caching
        if (map.current) {
          setupTileCaching(map.current)
        }
        if (onMapReady && map.current) {
          onMapReady(map.current)
        }
      })

      map.current.on('moveend', () => {
        if (map.current) {
          const newCenter = map.current.getCenter()
          setCenter([newCenter.lng, newCenter.lat])
          setZoom(map.current.getZoom())
        }
      })

      // Handle route recording clicks
      map.current.on('click', (e) => {
        if (recordingRef.current.isRecordingRoute && recordingRef.current.addRoutePoint) {
          recordingRef.current.addRoutePoint([e.lngLat.lng, e.lngLat.lat])
        }
      })
    }

    // Check if container has dimensions, otherwise wait
    if (container.offsetWidth === 0 && container.offsetHeight === 0) {
      // Use ResizeObserver to wait for dimensions
      const resizeObserver = new ResizeObserver(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          initMap()
          resizeObserver.disconnect()
        }
      })
      resizeObserver.observe(container)
      
      // Fallback timeout
      const timeout = setTimeout(() => {
        resizeObserver.disconnect()
        if (!map.current && (container.offsetWidth > 0 || container.offsetHeight > 0)) {
          initMap()
        }
      }, 500)

      return () => {
        clearTimeout(timeout)
        resizeObserver.disconnect()
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } else {
      initMap()
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map style
  const handleStyleChange = useCallback((style: 'osm' | 'topo') => {
    if (!map.current) return
    setActiveStyle(style)
    map.current.setStyle(TILE_SOURCES[style].style)
  }, [])

  // Render markers on map
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div')
      el.className = styles.marker
      el.style.backgroundColor = markerData.color || getMarkerColor(markerData.type)
      el.innerHTML = getMarkerIcon(markerData.type)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(markerData.coordinates)
        .addTo(map.current!)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setActiveMarkerId(markerData.id)
      })

      markersRef.current[markerData.id] = marker
    })
  }, [markers, setActiveMarkerId])

  // Render routes on map
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return

    // Remove existing route layers and sources
    routes.forEach((route) => {
      if (map.current?.getLayer(`route-${route.id}`)) {
        map.current.removeLayer(`route-${route.id}`)
      }
      if (map.current?.getSource(`route-${route.id}`)) {
        map.current.removeSource(`route-${route.id}`)
      }
    })

    // Add route lines
    routes.forEach((route) => {
      if (route.points.length < 2) return

      map.current!.addSource(`route-${route.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.points.map((p) => p.coordinates),
          },
        },
      })

      map.current!.addLayer({
        id: `route-${route.id}`,
        type: 'line',
        source: `route-${route.id}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': route.color,
          'line-width': 4,
          'line-opacity': 0.8,
        },
      })
    })
  }, [routes])

  // Render current recording route
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return

    const sourceId = 'current-route'
    const layerId = 'current-route-line'

    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    if (currentRoutePoints.length >= 2) {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: currentRoutePoints,
          },
        },
      })

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#c9a227',
          'line-width': 4,
          'line-opacity': 0.9,
          'line-dasharray': [2, 2],
        },
      })
    }
  }, [currentRoutePoints])

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>Loading map...</span>
        </div>
      )}
      
      {!isOnline && !isLoading && (
        <div className={styles.offlineBanner}>
          <WifiOff size={16} />
          <span>Offline mode - using cached tiles</span>
        </div>
      )}
      
      <div ref={mapContainer} className={styles.map} />
      
      <MapControls 
        activeStyle={activeStyle}
        onStyleChange={handleStyleChange}
        map={map.current}
      />
      
      {activeMarkerId && (
        <MarkerPopup 
          markerId={activeMarkerId} 
          onClose={() => setActiveMarkerId(null)} 
        />
      )}
    </div>
  )
}

function getMarkerColor(type: string): string {
  const colors: Record<string, string> = {
    campsite: '#4a9d6e',
    viewpoint: '#6b8cce',
    water: '#5bb5d6',
    wildlife: '#d4a03a',
    danger: '#c45c5c',
    parking: '#8b7355',
    custom: '#c9a227',
  }
  return colors[type] || colors.custom
}

function getMarkerIcon(type: string): string {
  const icons: Record<string, string> = {
    campsite: '⛺',
    viewpoint: '👁',
    water: '💧',
    wildlife: '🦌',
    danger: '⚠️',
    parking: '🅿️',
    custom: '📍',
  }
  return icons[type] || icons.custom
}
