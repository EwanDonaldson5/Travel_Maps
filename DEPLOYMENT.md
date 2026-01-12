# Livingstone Maps - Deployment & Architecture Guide

## 🚀 Deployment Options

### Static Hosting (Recommended)

Since this is a **Progressive Web App (PWA)**, it can be deployed to any static hosting service. All you need to do is:

1. **Build the app:**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with all production files.

2. **Deploy the `dist/` folder** to any static hosting service:

   **Recommended Services:**
   - **Vercel** (easiest, free tier available)
     ```bash
     npm install -g vercel
     vercel --prod
     ```
   
   - **Netlify** (free tier, drag-and-drop deployment)
     - Drag `dist/` folder to Netlify dashboard
   
   - **GitHub Pages**
     - Upload `dist/` contents to `gh-pages` branch
   
   - **Cloudflare Pages** (free tier)
     - Connect GitHub repo, set build command: `npm run build`
     - Set output directory: `dist`
   
   - **AWS S3 + CloudFront** (requires AWS account)
   
   - **Firebase Hosting** (free tier)
     ```bash
     npm install -g firebase-tools
     firebase init hosting
     firebase deploy
     ```

### Requirements

- **HTTPS is mandatory** for PWA/service workers to work
- All hosting services above provide HTTPS automatically
- Domain name (optional, but recommended)

### Example: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build the app
npm run build

# 3. Deploy
cd dist
vercel --prod
```

Your app will be live at: `https://your-app.vercel.app`

---

## 📱 How Users Access on Mobile

### Step 1: User visits your website
Users open their mobile browser (Safari on iOS, Chrome on Android) and navigate to your URL:
- `https://livingstonemaps.com` (example)
- Or whatever domain you set up

### Step 2: Browser prompts to "Install App"
When users visit your PWA:
- **Android (Chrome)**: Shows "Add to Home Screen" banner automatically
- **iOS (Safari)**: User taps Share button → "Add to Home Screen"

### Step 3: App appears on home screen
- Installed app launches in standalone mode (no browser UI)
- Works just like a native app
- Can be opened offline (after first load)

### Step 4: Using the app
- Users can now open it like any other app
- First launch needs internet to load app shell
- Subsequent launches work offline

---

## 🔌 How Offline Works

### Architecture Overview

```
┌────────────────────────────────────────────────┐
│  Browser/Device                                │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Service Worker (SW)                     │  │
│  │  - Caches app code (JS/CSS/HTML)         │  │
│  │  - Caches map tiles (up to 1000)         │  │
│  │  - Intercepts network requests           │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  IndexedDB (Browser Database)            │  │
│  │  - Stores markers                        │  │
│  │  - Stores routes                         │  │
│  │  - Stores journal entries                │  │
│  │  - Stores sync queue                     │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  LocalStorage                            │  │
│  │  - Stores app preferences                │  │
│  │  - Stores subscription status            │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Offline Flow

1. **First Visit (Online Required):**
   - Service Worker registers and caches app shell
   - User browses map → tiles are cached automatically
   - User creates markers/routes → saved to IndexedDB
   - Journal entries → saved to IndexedDB

2. **Subsequent Visits (Can be Offline):**
   - App loads from Service Worker cache
   - Previously viewed map tiles load from cache
   - All markers/routes/journal load from IndexedDB
   - User can create new data → saved locally
   - When back online → changes sync (if backend exists)

3. **What Works Offline:**
   - ✅ Viewing previously loaded map areas
   - ✅ Creating/editing markers
   - ✅ Creating/editing routes
   - ✅ Creating/editing journal entries
   - ✅ Viewing guides (they're static content)
   - ✅ All app features

4. **What Doesn't Work Offline:**
   - ❌ Viewing new map areas (not cached yet)
   - ❌ Stripe subscription checkout (requires internet)
   - ❌ Restoring subscription (requires backend)

---

## 👥 How User Data is Stored (Current Implementation)

### ⚠️ **IMPORTANT: No User Authentication Yet**

Currently, **all data is stored locally on each device** with **no user accounts or cloud sync**.

### Current Storage Model

```
Each Device = Separate "User"
├── IndexedDB: "livingstone-maps"
│   ├── markers (all markers for this device)
│   ├── routes (all routes for this device)
│   ├── journal (all journal entries for this device)
│   ├── syncQueue (pending sync operations)
│   └── tiles (cached map tiles)
│
└── LocalStorage: "livingstone-app"
    ├── isPremium (subscription status)
    ├── userEmail (email for subscription)
    └── subscriptionId (Stripe subscription ID)
```

### Data Isolation

- **No separation between users**
- Each device has its own isolated database
- Data never leaves the device (unless exported manually)
- No cloud sync or backup (unless you add backend)
- If user clears browser data → all data is lost
- If user switches devices → data doesn't transfer

### Example Scenario

**User on Phone A:**
- Creates 10 markers
- Saves 5 routes
- Writes 20 journal entries
- → All stored locally on Phone A

**Same user on Phone B:**
- Sees empty app
- No markers, routes, or journal entries
- → Phone B has separate, empty database

---

## 🔄 Adding Multi-User Support (Future Enhancement)

To support multiple users with cloud sync, you'd need to add:

### 1. Backend API Server

**Options:**
- **Firebase** (Firestore + Authentication) - easiest
- **Supabase** (PostgreSQL + Auth) - good free tier
- **Custom backend** (Node.js + PostgreSQL/MongoDB)

### 2. User Authentication

- Email/password login
- Or OAuth (Google, Apple, etc.)
- Generate unique user IDs

### 3. Data Sync

```typescript
// Example sync flow
async function syncToCloud(userId: string) {
  // Get unsynced items from IndexedDB
  const unsynced = await getUnsyncedItems()
  
  // Send to backend API
  await fetch(`https://api.livingstonemaps.com/sync`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      userId,
      markers: unsynced.markers,
      routes: unsynced.routes,
      journal: unsynced.journal
    })
  })
}
```

### 4. Updated Database Schema

```typescript
// Add userId to all data
interface Marker {
  id: string
  userId: string  // ← Add this
  name: string
  // ... rest
}
```

---

## 📊 Current vs. Multi-User Comparison

| Feature | Current (Local Only) | With Backend (Multi-User) |
|---------|---------------------|---------------------------|
| **Storage** | IndexedDB (device only) | IndexedDB + Cloud Database |
| **User Accounts** | ❌ None | ✅ Email/OAuth login |
| **Data Sync** | ❌ None | ✅ Automatic sync when online |
| **Cross-Device** | ❌ No | ✅ Yes (same account = same data) |
| **Backup** | ❌ Manual export only | ✅ Automatic cloud backup |
| **Data Loss Risk** | ⚠️ High (clear data = lost) | ✅ Low (cloud backup) |
| **Implementation** | ✅ Done | ⚠️ Requires backend work |

---

## 🔐 Privacy & Security Considerations

### Current Model (Local Only)

**Pros:**
- ✅ Complete privacy (data never leaves device)
- ✅ Works offline 100%
- ✅ No server costs
- ✅ GDPR-friendly (no data collection)

**Cons:**
- ⚠️ Data lost if device is lost/damaged
- ⚠️ No backup (unless manually exported)
- ⚠️ Can't use on multiple devices

### Recommendations

For MVP, the current local-only model is **perfectly acceptable** because:
1. Hunters/hikers often want **privacy** (don't want location data in cloud)
2. Offline-first is **the core feature**
3. Simple to deploy (no backend needed)
4. Lower costs (no database/server fees)

You can add cloud sync later if users request it.

---

## 📝 Summary

**Deployment:**
1. Run `npm run build`
2. Upload `dist/` folder to static hosting (Vercel/Netlify/etc.)
3. Users visit your URL → install PWA → works offline

**Mobile Access:**
- Users visit URL in browser
- Browser prompts "Add to Home Screen"
- App installs and works like native app

**Offline:**
- Service Worker caches app code + map tiles
- IndexedDB stores all user data locally
- Everything works offline after first visit

**User Data:**
- Currently: **Local only, per device**
- No user accounts or cloud sync
- Each device has isolated data
- Data export available in Settings

---

## 🎯 Next Steps

1. **Build and deploy:**
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

2. **Test PWA installation:**
   - Visit deployed URL on mobile
   - Install as PWA
   - Test offline mode

3. **Optional: Add backend** (if you want multi-user sync)
   - Set up Firebase/Supabase
   - Add authentication
   - Implement sync API
