import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react'
import { getAllJournalEntries, saveJournalEntry, generateId } from '../lib/db'
import type { JournalEntry } from '../types'
import styles from './Journal.module.css'

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const data = await getAllJournalEntries()
      setEntries(data)
    } catch (error) {
      console.error('Failed to load journal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewEntry = async () => {
    const now = new Date()
    const entry: JournalEntry = {
      id: generateId(),
      title: '',
      content: '',
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      synced: false,
    }
    
    await saveJournalEntry(entry)
    navigate(`/journal/${entry.id}`)
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.date)
    const monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!groups[monthYear]) {
      groups[monthYear] = []
    }
    groups[monthYear].push(entry)
    return groups
  }, {} as Record<string, JournalEntry[]>)

  const weatherIcons: Record<string, React.ReactNode> = {
    sunny: <Sun size={16} />,
    cloudy: <Cloud size={16} />,
    rainy: <CloudRain size={16} />,
    snowy: <Snowflake size={16} />,
  }

  const moodColors: Record<string, string> = {
    great: '#4a9d6e',
    good: '#6bc48e',
    okay: '#d4a03a',
    challenging: '#c45c5c',
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Journal</h1>
        <p className={styles.subtitle}>Record your adventures</p>
      </header>

      {isLoading ? (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonMeta} />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📔</div>
          <h2>No entries yet</h2>
          <p>Start documenting your outdoor adventures</p>
          <button className={styles.emptyButton} onClick={handleNewEntry}>
            <Plus size={20} />
            Create First Entry
          </button>
        </div>
      ) : (
        <div className={styles.entries}>
          {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className={styles.group}>
              <h2 className={styles.groupTitle}>{monthYear}</h2>
              <div className={styles.entryList}>
                {monthEntries.map((entry, index) => (
                  <Link 
                    key={entry.id} 
                    to={`/journal/${entry.id}`}
                    className={styles.entryCard}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={styles.entryHeader}>
                      <div className={styles.entryDate}>
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {entry.mood && (
                        <div 
                          className={styles.mood}
                          style={{ backgroundColor: moodColors[entry.mood] }}
                        />
                      )}
                    </div>
                    
                    <h3 className={styles.entryTitle}>
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    
                    {entry.content && (
                      <p className={styles.entryPreview}>
                        {entry.content.slice(0, 100)}
                        {entry.content.length > 100 ? '...' : ''}
                      </p>
                    )}
                    
                    <div className={styles.entryMeta}>
                      {entry.location && (
                        <span className={styles.metaItem}>
                          <MapPin size={14} />
                          {entry.location.name}
                        </span>
                      )}
                      {entry.weather && weatherIcons[entry.weather] && (
                        <span className={styles.metaItem}>
                          {weatherIcons[entry.weather]}
                        </span>
                      )}
                      {entry.photos && entry.photos.length > 0 && (
                        <span className={styles.metaItem}>
                          📷 {entry.photos.length}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className={styles.fab} onClick={handleNewEntry}>
        <Plus size={24} />
      </button>
    </div>
  )
}
