import { useState, useEffect } from 'react'
import { X, Edit2, Trash2, Navigation } from 'lucide-react'
import { useMapStore } from '../../stores/mapStore'
import { getMarker, saveMarker, deleteMarker as deleteMarkerFromDb } from '../../lib/db'
import type { Marker } from '../../types'
import styles from './MarkerPopup.module.css'

interface MarkerPopupProps {
  markerId: string
  onClose: () => void
}

export default function MarkerPopup({ markerId, onClose }: MarkerPopupProps) {
  const [marker, setMarker] = useState<Marker | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  const { updateMarker, removeMarker } = useMapStore()

  useEffect(() => {
    getMarker(markerId).then((m) => {
      if (m) {
        setMarker(m)
        setEditName(m.name)
        setEditDescription(m.description || '')
      }
    })
  }, [markerId])

  const handleSave = async () => {
    if (!marker) return
    
    const updated: Marker = {
      ...marker,
      name: editName,
      description: editDescription,
      updatedAt: new Date().toISOString(),
      synced: false,
    }
    
    await saveMarker(updated)
    updateMarker(markerId, updated)
    setMarker(updated)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!marker) return
    if (!confirm('Delete this marker?')) return
    
    await deleteMarkerFromDb(markerId)
    removeMarker(markerId)
    onClose()
  }

  const handleNavigate = () => {
    if (!marker) return
    const [lng, lat] = marker.coordinates
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  if (!marker) {
    return (
      <div className={styles.popup}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  const markerEmojis: Record<string, string> = {
    campsite: '⛺',
    viewpoint: '👁',
    water: '💧',
    wildlife: '🦌',
    danger: '⚠️',
    parking: '🅿️',
    custom: '📍',
  }

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.emoji}>{markerEmojis[marker.type]}</span>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={styles.editInput}
              autoFocus
            />
          ) : (
            <h3>{marker.name}</h3>
          )}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className={styles.content}>
        {isEditing ? (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add a description..."
            className={styles.editTextarea}
            rows={3}
          />
        ) : (
          marker.description && (
            <p className={styles.description}>{marker.description}</p>
          )
        )}
        
        <div className={styles.meta}>
          <span className={styles.type}>{marker.type}</span>
          <span className={styles.coords}>
            {marker.coordinates[1].toFixed(5)}, {marker.coordinates[0].toFixed(5)}
          </span>
        </div>
      </div>
      
      <div className={styles.actions}>
        {isEditing ? (
          <>
            <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </>
        ) : (
          <>
            <button className={styles.actionButton} onClick={handleNavigate}>
              <Navigation size={18} />
              Navigate
            </button>
            <button className={styles.actionButton} onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit
            </button>
            <button className={`${styles.actionButton} ${styles.danger}`} onClick={handleDelete}>
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
