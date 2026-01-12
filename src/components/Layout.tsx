import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Map, BookOpen, Compass, Settings, WifiOff, CloudOff } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import styles from './Layout.module.css'

export default function Layout() {
  const location = useLocation()
  const isOnline = useAppStore((state) => state.isOnline)
  const pendingSync = useAppStore((state) => state.pendingSync)
  
  const isMapView = location.pathname === '/'

  return (
    <div className={styles.layout}>
      {/* Offline indicator */}
      {!isOnline && (
        <div className={styles.offlineBanner}>
          <WifiOff size={16} />
          <span>You're offline - changes saved locally</span>
        </div>
      )}
      
      {/* Pending sync indicator */}
      {isOnline && pendingSync > 0 && (
        <div className={styles.syncBanner}>
          <CloudOff size={16} />
          <span>{pendingSync} item{pendingSync > 1 ? 's' : ''} waiting to sync</span>
        </div>
      )}

      {/* Main content */}
      <main className={`${styles.main} ${isMapView ? styles.mapView : ''}`}>
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className={styles.nav}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Map size={24} />
          <span>Map</span>
        </NavLink>
        
        <NavLink 
          to="/journal" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <BookOpen size={24} />
          <span>Journal</span>
        </NavLink>
        
        <NavLink 
          to="/guides" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Compass size={24} />
          <span>Guides</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  )
}
