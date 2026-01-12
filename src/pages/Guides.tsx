import { Link } from 'react-router-dom'
import { 
  Shield, 
  Compass, 
  TreePine, 
  Tent, 
  CloudSun, 
  Backpack,
  Lock,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import type { Guide } from '../types'
import styles from './Guides.module.css'

// Static guides data (in a real app, this could come from a CMS or API)
const guides: Guide[] = [
  {
    id: 'outdoor-safety',
    title: 'Outdoor Safety Essentials',
    category: 'safety',
    summary: 'Essential safety tips for any outdoor adventure',
    content: '',
    icon: 'shield',
    isPremium: false,
  },
  {
    id: 'navigation-basics',
    title: 'Navigation Without GPS',
    category: 'navigation',
    summary: 'Learn to navigate using maps, compass, and natural signs',
    content: '',
    icon: 'compass',
    isPremium: false,
  },
  {
    id: 'wildlife-awareness',
    title: 'Wildlife Awareness',
    category: 'wildlife',
    summary: 'How to safely observe and coexist with wildlife',
    content: '',
    icon: 'tree',
    isPremium: false,
  },
  {
    id: 'leave-no-trace',
    title: 'Leave No Trace Principles',
    category: 'camping',
    summary: 'Minimize your impact on the environment',
    content: '',
    icon: 'tent',
    isPremium: false,
  },
  {
    id: 'weather-reading',
    title: 'Reading Weather Signs',
    category: 'weather',
    summary: 'Predict weather changes using natural indicators',
    content: '',
    icon: 'cloud',
    isPremium: true,
  },
  {
    id: 'gear-essentials',
    title: 'Gear Essentials Guide',
    category: 'gear',
    summary: 'What to pack for different outdoor activities',
    content: '',
    icon: 'backpack',
    isPremium: true,
  },
  {
    id: 'emergency-shelter',
    title: 'Emergency Shelter Building',
    category: 'safety',
    summary: 'Build emergency shelters with natural materials',
    content: '',
    icon: 'tent',
    isPremium: true,
  },
  {
    id: 'water-finding',
    title: 'Finding & Purifying Water',
    category: 'safety',
    summary: 'Locate and make water safe to drink in the wild',
    content: '',
    icon: 'shield',
    isPremium: true,
  },
]

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield size={24} />,
  compass: <Compass size={24} />,
  tree: <TreePine size={24} />,
  tent: <Tent size={24} />,
  cloud: <CloudSun size={24} />,
  backpack: <Backpack size={24} />,
}

const categoryColors: Record<string, string> = {
  safety: '#c45c5c',
  navigation: '#6b8cce',
  wildlife: '#d4a03a',
  camping: '#4a9d6e',
  weather: '#5bb5d6',
  gear: '#8b7355',
}

export default function Guides() {
  const isPremium = useAppStore((state) => state.isPremium)
  
  const freeGuides = guides.filter((g) => !g.isPremium)
  const premiumGuides = guides.filter((g) => g.isPremium)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Guides</h1>
        <p className={styles.subtitle}>Expert tips for outdoor adventures</p>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Free Guides</h2>
        <div className={styles.guideList}>
          {freeGuides.map((guide, index) => (
            <Link 
              key={guide.id} 
              to={`/guides/${guide.id}`}
              className={styles.guideCard}
              style={{ 
                animationDelay: `${index * 50}ms`,
                '--category-color': categoryColors[guide.category],
              } as React.CSSProperties}
            >
              <div className={styles.guideIcon}>
                {iconMap[guide.icon]}
              </div>
              <div className={styles.guideContent}>
                <h3>{guide.title}</h3>
                <p>{guide.summary}</p>
                <span className={styles.category}>{guide.category}</span>
              </div>
              <ChevronRight size={20} className={styles.chevron} />
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Premium Guides</h2>
          {!isPremium && (
            <Link to="/settings" className={styles.upgradeLink}>
              Upgrade
            </Link>
          )}
        </div>
        <div className={styles.guideList}>
          {premiumGuides.map((guide, index) => (
            <Link 
              key={guide.id} 
              to={isPremium ? `/guides/${guide.id}` : '/settings'}
              className={`${styles.guideCard} ${!isPremium ? styles.locked : ''}`}
              style={{ 
                animationDelay: `${(freeGuides.length + index) * 50}ms`,
                '--category-color': categoryColors[guide.category],
              } as React.CSSProperties}
            >
              <div className={styles.guideIcon}>
                {iconMap[guide.icon]}
              </div>
              <div className={styles.guideContent}>
                <h3>{guide.title}</h3>
                <p>{guide.summary}</p>
                <span className={styles.category}>{guide.category}</span>
              </div>
              {!isPremium ? (
                <Lock size={20} className={styles.lockIcon} />
              ) : (
                <ChevronRight size={20} className={styles.chevron} />
              )}
            </Link>
          ))}
        </div>
      </div>

      {!isPremium && (
        <div className={styles.premiumBanner}>
          <div className={styles.bannerContent}>
            <h3>Unlock All Guides</h3>
            <p>Get access to premium content with a subscription</p>
          </div>
          <Link to="/settings" className={styles.bannerButton}>
            Subscribe
          </Link>
        </div>
      )}
    </div>
  )
}
