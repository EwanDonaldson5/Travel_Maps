import { useState, useEffect } from 'react'
import { X, Edit2, Trash2 } from 'lucide-react'
import { useMapStore } from '../../stores/mapStore'
import { getRoute, saveRoute, deleteRoute as deleteRouteFromDb } from '../../lib/db'
import type { Route } from '../../types'
import styles from './MarkerPopup.module.css'

interface RoutePopupProps {
  routeId: string
  onClose: () => void
}

export default function RoutePopup({ routeId, onClose }: RoutePopupProps) {
  const [route, setRoute] = useState<Route | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  const { updateRoute, removeRoute } = useMapStore()

  useEffect(() => {
    getRoute(routeId).then((r) => {
      if (r) {
        setRoute(r)
        setEditName(r.name)
        setEditDescription(r.description || '')
      }
    })
  }, [routeId])

  const handleSave = async () => {
    if (!route) return
    
    const updated: Route = {
      ...route,
      name: editName,
      description: editDescription,
      updatedAt: new Date().toISOString(),
      synced: false,
    }
    
    await saveRoute(updated)
    updateRoute(routeId, updated)
    setRoute(updated)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!route) return
    if (!confirm('Delete this route?')) return
    
    await deleteRouteFromDb(routeId)
    removeRoute(routeId)
    onClose()
  }

  if (!route) {
    return (
      <div className={styles.popup}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.emoji}>🛤️</span>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={styles.editInput}
              autoFocus
            />
          ) : (
            <h3>{route.name}</h3>
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
          route.description && (
            <p className={styles.description}>{route.description}</p>
          )
        )}
        
        <div className={styles.meta}>
          <span className={styles.type}>{route.points.length} points</span>
          <span 
            className={styles.type} 
            style={{ backgroundColor: route.color, color: '#fff' }}
          >
            Route
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
