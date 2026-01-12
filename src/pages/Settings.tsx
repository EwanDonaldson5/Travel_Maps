import { useState } from 'react'
import { 
  User, 
  CreditCard, 
  Download, 
  Trash2, 
  Info,
  ExternalLink,
  Check,
  Loader2,
  WifiOff,
  Database
} from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import styles from './Settings.module.css'

// Stripe configuration - replace with your actual Stripe price ID and checkout URL
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_YOUR_PRICE_ID' // Replace with actual Stripe checkout link

export default function Settings() {
  const { 
    isOnline, 
    isPremium, 
    userEmail, 
    setUserEmail, 
    setPremium,
    pendingSync 
  } = useAppStore()
  
  const [email, setEmail] = useState(userEmail || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleSubscribe = () => {
    if (!email.trim()) {
      alert('Please enter your email address first')
      return
    }
    
    // Save email before redirecting to Stripe
    setUserEmail(email)
    
    // Open Stripe Checkout with prefilled email
    const checkoutUrl = `${STRIPE_CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`
    window.open(checkoutUrl, '_blank')
  }

  const handleRestorePurchase = async () => {
    if (!email.trim()) {
      alert('Please enter the email you used for your subscription')
      return
    }
    
    setIsLoading(true)
    
    // In production, this would call your backend to verify the subscription
    // For demo purposes, we'll simulate a check
    try {
      // Simulated API call - replace with actual verification
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // For demo: check if email contains "premium" to simulate a valid subscription
      if (email.toLowerCase().includes('premium')) {
        setPremium(true)
        setUserEmail(email)
        alert('Subscription restored successfully!')
      } else {
        alert('No active subscription found for this email')
      }
    } catch (error) {
      alert('Failed to verify subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true)
      return
    }
    
    try {
      // Clear IndexedDB
      const databases = await indexedDB.databases()
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name)
        }
      }
      
      // Clear localStorage
      localStorage.clear()
      
      // Reload the app
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear data:', error)
      alert('Failed to clear data. Please try again.')
    }
  }

  const handleExportData = async () => {
    try {
      // Get all data from IndexedDB
      const { getAllMarkers, getAllRoutes, getAllJournalEntries } = await import('../lib/db')
      
      const [markers, routes, journal] = await Promise.all([
        getAllMarkers(),
        getAllRoutes(),
        getAllJournalEntries(),
      ])
      
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        markers,
        routes,
        journal,
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `livingstone-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
      </header>

      {/* Connection Status */}
      <div className={styles.statusBar}>
        <div className={`${styles.statusItem} ${isOnline ? styles.online : styles.offline}`}>
          {isOnline ? <Check size={16} /> : <WifiOff size={16} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {pendingSync > 0 && (
          <div className={styles.statusItem}>
            <Database size={16} />
            <span>{pendingSync} pending sync</span>
          </div>
        )}
      </div>

      {/* Subscription Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Subscription</h2>
        
        <div className={`${styles.card} ${isPremium ? styles.premiumCard : ''}`}>
          {isPremium ? (
            <div className={styles.premiumBadge}>
              <Check size={20} />
              <div>
                <h3>Premium Active</h3>
                <p>{userEmail}</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.planInfo}>
                <h3>Livingstone Premium</h3>
                <p className={styles.price}>£4.99<span>/month</span></p>
                <ul className={styles.features}>
                  <li><Check size={16} /> All premium guides</li>
                  <li><Check size={16} /> Cloud backup & sync</li>
                  <li><Check size={16} /> Priority support</li>
                  <li><Check size={16} /> Advanced map layers</li>
                </ul>
              </div>
              
              <div className={styles.subscribeForm}>
                <div className={styles.inputGroup}>
                  <User size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <button 
                  className={styles.subscribeButton}
                  onClick={handleSubscribe}
                >
                  <CreditCard size={18} />
                  Subscribe with Stripe
                  <ExternalLink size={14} />
                </button>
                
                <button 
                  className={styles.restoreButton}
                  onClick={handleRestorePurchase}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={16} className={styles.spinner} />
                  ) : null}
                  Restore Purchase
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Data Management */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Management</h2>
        
        <div className={styles.card}>
          <button className={styles.actionButton} onClick={handleExportData}>
            <Download size={20} />
            <div>
              <span>Export Data</span>
              <p>Download all your markers, routes, and journal entries</p>
            </div>
          </button>
          
          <div className={styles.divider} />
          
          <button 
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={handleClearData}
          >
            <Trash2 size={20} />
            <div>
              <span>{showClearConfirm ? 'Tap again to confirm' : 'Clear All Data'}</span>
              <p>Delete all local data and reset the app</p>
            </div>
          </button>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        
        <div className={styles.card}>
          <div className={styles.aboutInfo}>
            <Info size={20} />
            <div>
              <h3>Livingstone Maps</h3>
              <p>Version 1.0.0</p>
              <p className={styles.copyright}>© 2026 Livingstone. All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Notice */}
      <div className={styles.offlineNotice}>
        <WifiOff size={16} />
        <p>
          Livingstone works offline. Your data is stored locally and will sync when you're back online.
        </p>
      </div>
    </div>
  )
}
