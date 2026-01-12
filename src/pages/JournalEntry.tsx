import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Trash2, 
  MapPin, 
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Smile,
  Meh,
  Frown,
  Heart
} from 'lucide-react'
import { getJournalEntry, saveJournalEntry, deleteJournalEntry } from '../lib/db'
import type { JournalEntry as JournalEntryType } from '../types'
import styles from './JournalEntry.module.css'

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<JournalEntryType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    
    getJournalEntry(id).then((data) => {
      if (data) {
        setEntry(data)
      } else {
        navigate('/journal')
      }
      setIsLoading(false)
    })
  }, [id, navigate])

  const saveEntry = useCallback(async (updates: Partial<JournalEntryType>) => {
    if (!entry) return
    
    setIsSaving(true)
    const updated: JournalEntryType = {
      ...entry,
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: false,
    }
    
    await saveJournalEntry(updated)
    setEntry(updated)
    setIsSaving(false)
  }, [entry])

  const handleDelete = async () => {
    if (!entry) return
    if (!confirm('Delete this journal entry?')) return
    
    await deleteJournalEntry(entry.id)
    navigate('/journal')
  }

  const weatherOptions = [
    { value: 'sunny', icon: <Sun size={20} />, label: 'Sunny' },
    { value: 'cloudy', icon: <Cloud size={20} />, label: 'Cloudy' },
    { value: 'rainy', icon: <CloudRain size={20} />, label: 'Rainy' },
    { value: 'snowy', icon: <Snowflake size={20} />, label: 'Snowy' },
  ]

  const moodOptions = [
    { value: 'great', icon: <Heart size={20} />, label: 'Great', color: '#4a9d6e' },
    { value: 'good', icon: <Smile size={20} />, label: 'Good', color: '#6bc48e' },
    { value: 'okay', icon: <Meh size={20} />, label: 'Okay', color: '#d4a03a' },
    { value: 'challenging', icon: <Frown size={20} />, label: 'Tough', color: '#c45c5c' },
  ]

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonContent} />
        </div>
      </div>
    )
  }

  if (!entry) return null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/journal')}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerActions}>
          {isSaving && <span className={styles.savingIndicator}>Saving...</span>}
          <button className={styles.deleteButton} onClick={handleDelete}>
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.dateRow}>
          <Calendar size={16} />
          <input
            type="date"
            value={entry.date}
            onChange={(e) => saveEntry({ date: e.target.value })}
            className={styles.dateInput}
          />
        </div>

        <input
          type="text"
          value={entry.title}
          onChange={(e) => saveEntry({ title: e.target.value })}
          placeholder="Entry title..."
          className={styles.titleInput}
        />

        <textarea
          value={entry.content}
          onChange={(e) => saveEntry({ content: e.target.value })}
          placeholder="Write about your adventure..."
          className={styles.contentInput}
        />

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Weather</h3>
          <div className={styles.optionGrid}>
            {weatherOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.optionButton} ${entry.weather === option.value ? styles.selected : ''}`}
                onClick={() => saveEntry({ weather: entry.weather === option.value ? undefined : option.value })}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Mood</h3>
          <div className={styles.optionGrid}>
            {moodOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.optionButton} ${entry.mood === option.value ? styles.selected : ''}`}
                style={{ 
                  '--option-color': option.color 
                } as React.CSSProperties}
                onClick={() => saveEntry({ 
                  mood: entry.mood === option.value ? undefined : option.value as JournalEntryType['mood']
                })}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {entry.location && (
          <div className={styles.locationBadge}>
            <MapPin size={16} />
            <span>{entry.location.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
