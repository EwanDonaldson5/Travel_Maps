# Travel Maps - Guide and Logbook

An offline-first Progressive Web App (PWA) for hunters, hikers, adventure travellers, and nature lovers. Plan trips, mark locations, and record experiences through maps, routes, markers, and a journal.

![Travel Maps - Guide and Logbook](./docs/screenshot.png)

## Features

### 🗺️ Interactive Maps
- **MapLibre GL JS** powered maps with OpenStreetMap and OpenTopoMap layers
- GPS location tracking with high accuracy
- Offline tile caching for use without internet

### 📍 Routes & Markers
- Create and save custom markers with different types (campsite, viewpoint, water, wildlife, danger, parking)
- Record routes by tapping points on the map
- All data saved locally with IndexedDB

### 📔 Adventure Journal
- Document your outdoor experiences with rich entries
- Track weather conditions and mood
- Link journal entries to markers and routes

### 📖 Outdoor Guides
- Essential guides for outdoor safety, navigation, wildlife awareness, and more
- Premium guides available with subscription

### 📱 PWA Features
- Install on Android & iOS home screen
- Install on Windows, macOS, and Linux desktop
- Works completely offline on all platforms
- Automatic background sync when online
- Push notifications (coming soon)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Maps**: MapLibre GL JS
- **State Management**: Zustand
- **Offline Storage**: IndexedDB (via idb)
- **PWA**: Workbox + vite-plugin-pwa
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **Payments**: Stripe Checkout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with navigation
│   └── Map/            # Map-related components
├── lib/                # Utilities and helpers
│   └── db.ts          # IndexedDB operations
├── pages/              # Page components
│   ├── MapView.tsx    # Main map view
│   ├── Journal.tsx    # Journal list
│   ├── JournalEntry.tsx
│   ├── Guides.tsx     # Guides list
│   ├── GuideDetail.tsx
│   └── Settings.tsx   # Settings & subscription
├── stores/             # Zustand state stores
│   ├── appStore.ts    # Global app state
│   └── mapStore.ts    # Map-specific state
├── types/              # TypeScript type definitions
├── App.tsx            # Main app component with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Configuration

### Stripe Integration

To enable payments, update the Stripe checkout URL in `src/pages/Settings.tsx`:

```typescript
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/YOUR_ACTUAL_PRICE_ID'
```

### Map Tiles

The app uses free OpenStreetMap and OpenTopoMap tiles by default. You can add additional tile sources in `src/components/Map/Map.tsx`.

## Offline Functionality

Travel Maps - Guide and Logbook is designed to work offline:

1. **Service Worker**: Caches app shell and static assets
2. **Tile Caching**: Map tiles are cached for offline use
3. **IndexedDB**: All user data (markers, routes, journal) stored locally
4. **Sync Queue**: Changes made offline are queued and synced when online

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+
- iOS Safari 14+
- Chrome for Android

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### PWA Development

The PWA features (service worker, manifest) are only active in production builds. To test:

```bash
npm run build
npm run preview
```

## Roadmap

### Milestone 1: Project Setup ✅
- [x] Mobile-first PWA setup
- [x] GPS location works
- [x] App installable as PWA

### Milestone 2: Routes, Markers & Offline Saving ✅
- [x] Create/save routes offline
- [x] Create/save markers offline
- [x] IndexedDB storage

### Milestone 3: Guide, Journal & Data Sync ✅
- [x] Guides work offline
- [x] Journal entries work offline
- [x] Subscription logic in place

### Milestone 4: Stabilisation & Handover
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Handover
