import { useState } from 'react'
import { 
  Plus, 
  Route, 
  MapPin, 
  Layers, 
  Target,
  Square,
  Save,
  X
} from 'lucide-react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '../../stores/mapStore'
import { saveMarker, saveRoute, generateId } from '../../lib/db'
import type { Marker, Route as RouteType } from '../../types'
import styles from './MapControls.module.css'

interface MapControlsProps {
  activeStyle: 'osm' | 'topo'
  onStyleChange: (style: 'osm' | 'topo') => void
  map: maplibregl.Map | null
}

export default function MapControls({ activeStyle, onStyleChange, map }: MapControlsProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const [showMarkerForm, setShowMarkerForm] = useState(false)
  const [showRouteForm, setShowRouteForm] = useState(false)
  
  const {
    isRecordingRoute,
    currentRoutePoints,
    startRecordingRoute,
    stopRecordingRoute,
    clearCurrentRoutePoints,
    addMarker,
    addRoute,
    center,
  } = useMapStore()

  const handleAddMarker = async (markerData: Partial<Marker>) => {
    const now = new Date().toISOString()
    const marker: Marker = {
      id: generateId(),
      name: markerData.name || 'New Marker',
      description: markerData.description,
      type: markerData.type || 'custom',
      coordinates: [center[0], center[1]],
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
    
    await saveMarker(marker)
    addMarker(marker)
    setShowMarkerForm(false)
    setShowMenu(false)
  }

  const handleSaveRoute = async (routeData: { name: string; description?: string }) => {
    if (currentRoutePoints.length < 2) return
    
    const now = new Date().toISOString()
    const route: RouteType = {
      id: generateId(),
      name: routeData.name || 'New Route',
      description: routeData.description,
      points: currentRoutePoints.map((coords) => ({ coordinates: coords })),
      color: '#c9a227',
      createdAt: now,
      updatedAt: now,
      synced: false,
    }
    
    await saveRoute(route)
    addRoute(route)
    stopRecordingRoute()
    clearCurrentRoutePoints()
    setShowRouteForm(false)
  }

  const handleCenterOnLocation = () => {
    if (!map) return
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <>
      {/* Style toggle */}
      <div className={styles.styleControl}>
        <button 
          className={styles.controlButton}
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          aria-label="Change map style"
        >
          <Layers size={20} />
        </button>
        
        {showStyleMenu && (
          <div className={styles.styleMenu}>
            <button 
              className={`${styles.styleOption} ${activeStyle === 'osm' ? styles.active : ''}`}
              onClick={() => { onStyleChange('osm'); setShowStyleMenu(false) }}
            >
              Street
            </button>
            <button 
              className={`${styles.styleOption} ${activeStyle === 'topo' ? styles.active : ''}`}
              onClick={() => { onStyleChange('topo'); setShowStyleMenu(false) }}
            >
              Topo
            </button>
          </div>
        )}
      </div>

      {/* Center on location */}
      <button 
        className={`${styles.controlButton} ${styles.locationButton}`}
        onClick={handleCenterOnLocation}
        aria-label="Center on my location"
      >
        <Target size={20} />
      </button>

      {/* Recording indicator */}
      {isRecordingRoute && (
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingDot} />
          <span>Recording route ({currentRoutePoints.length} points)</span>
          <button 
            className={styles.stopButton}
            onClick={() => setShowRouteForm(true)}
          >
            <Square size={16} />
            Stop
          </button>
        </div>
      )}

      {/* Add button */}
      <div className={styles.addControl}>
        <button 
          className={`${styles.addButton} ${showMenu ? styles.active : ''}`}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Add marker or route"
        >
          <Plus size={24} className={showMenu ? styles.rotated : ''} />
        </button>
        
        {showMenu && (
          <div className={styles.addMenu}>
            <button 
              className={styles.menuItem}
              onClick={() => setShowMarkerForm(true)}
            >
              <MapPin size={20} />
              <span>Add Marker</span>
            </button>
            <button 
              className={styles.menuItem}
              onClick={() => { startRecordingRoute(); setShowMenu(false) }}
            >
              <Route size={20} />
              <span>Record Route</span>
            </button>
          </div>
        )}
      </div>

      {/* Marker form modal */}
      {showMarkerForm && (
        <MarkerFormModal 
          onSave={handleAddMarker}
          onClose={() => { setShowMarkerForm(false); setShowMenu(false) }}
        />
      )}

      {/* Route save form modal */}
      {showRouteForm && (
        <RouteFormModal
          pointCount={currentRoutePoints.length}
          onSave={handleSaveRoute}
          onDiscard={() => {
            stopRecordingRoute()
            clearCurrentRoutePoints()
            setShowRouteForm(false)
          }}
          onClose={() => setShowRouteForm(false)}
        />
      )}
    </>
  )
}

interface MarkerFormModalProps {
  onSave: (data: Partial<Marker>) => void
  onClose: () => void
}

function MarkerFormModal({ onSave, onClose }: MarkerFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<Marker['type']>('custom')

  const markerTypes: { value: Marker['type']; label: string; emoji: string }[] = [
    { value: 'campsite', label: 'Campsite', emoji: '⛺' },
    { value: 'viewpoint', label: 'Viewpoint', emoji: '👁' },
    { value: 'water', label: 'Water', emoji: '💧' },
    { value: 'wildlife', label: 'Wildlife', emoji: '🦌' },
    { value: 'danger', label: 'Danger', emoji: '⚠️' },
    { value: 'parking', label: 'Parking', emoji: '🅿️' },
    { value: 'custom', label: 'Custom', emoji: '📍' },
  ]

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Add Marker</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.field}>
            <label htmlFor="marker-name">Name</label>
            <input
              id="marker-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter marker name"
              autoFocus
            />
          </div>
          
          <div className={styles.field}>
            <label>Type</label>
            <div className={styles.typeGrid}>
              {markerTypes.map((t) => (
                <button
                  key={t.value}
                  className={`${styles.typeButton} ${type === t.value ? styles.selected : ''}`}
                  onClick={() => setType(t.value)}
                >
                  <span className={styles.typeEmoji}>{t.emoji}</span>
                  <span className={styles.typeLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="marker-desc">Description (optional)</label>
            <textarea
              id="marker-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this location..."
              rows={3}
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={() => onSave({ name, description, type })}
            disabled={!name.trim()}
          >
            <Save size={18} />
            Save Marker
          </button>
        </div>
      </div>
    </div>
  )
}

interface RouteFormModalProps {
  pointCount: number
  onSave: (data: { name: string; description?: string }) => void
  onDiscard: () => void
  onClose: () => void
}

function RouteFormModal({ pointCount, onSave, onDiscard, onClose }: RouteFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Save Route</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <p className={styles.routeInfo}>
            Route recorded with <strong>{pointCount}</strong> points
          </p>
          
          <div className={styles.field}>
            <label htmlFor="route-name">Name</label>
            <input
              id="route-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter route name"
              autoFocus
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="route-desc">Description (optional)</label>
            <textarea
              id="route-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this route..."
              rows={3}
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.discardButton} onClick={onDiscard}>
            Discard
          </button>
          <button 
            className={styles.saveButton}
            onClick={() => onSave({ name, description })}
            disabled={!name.trim()}
          >
            <Save size={18} />
            Save Route
          </button>
        </div>
      </div>
    </div>
  )
}
