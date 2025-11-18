# Implementation Summary

**PickIt! Sports Betting Platform** - Complete Technical Overview

---

## 🎯 Project Overview

PickIt! is a premium sports betting intelligence platform that provides:

- **Arbitrage Detection** across multiple sportsbooks
- **AI-Powered Game Picks** with historical data analysis
- **Real-Time Odds Tracking** with line movement visualization
- **Personalized Watchlists** with custom alerts
- **Premium Analytics** for data-driven betting decisions

**Target Users:** Sports bettors seeking an edge through data and automation  
**Business Model:** Freemium SaaS with premium subscription ($19.99/month)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Web App    │  │  Mobile PWA  │  │  Push Notifications │  │
│  │  (React +    │  │  (Responsive │  │   (FCM Service      │  │
│  │   Vite)      │  │   Design)    │  │    Worker)          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘  │
│         │                 │                      │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          └─────────────────┴──────────────────────┘
                            │
          ┌─────────────────▼──────────────────┐
          │      FIREBASE PLATFORM             │
          │                                    │
          │  ┌──────────────────────────────┐ │
          │  │   Authentication (Google)    │ │
          │  └──────────────────────────────┘ │
          │                                    │
          │  ┌──────────────────────────────┐ │
          │  │   Firestore Database         │ │
          │  │   ┌──────────────────────┐   │ │
          │  │   │ users                │   │ │
          │  │   │ events (TTL)         │   │ │
          │  │   │ ├─ markets           │   │ │
          │  │   │ │  └─ books          │   │ │
          │  │   │ │     └─ snapshots   │   │ │
          │  │   │ arbTickets           │   │ │
          │  │   │ gameTickets          │   │ │
          │  │   │ articles (TTL)       │   │ │
          │  │   │ watchlists           │   │ │
          │  │   └──────────────────────┘   │ │
          │  └──────────────────────────────┘ │
          │                                    │
          │  ┌──────────────────────────────┐ │
          │  │   Cloud Functions            │ │
          │  │   - watchlist-monitor        │ │
          │  │   - fcm-token-save           │ │
          │  │   - user-init                │ │
          │  └──────────────────────────────┘ │
          │                                    │
          │  ┌──────────────────────────────┐ │
          │  │   FCM (Push Notifications)   │ │
          │  └──────────────────────────────┘ │
          └────────────────────────────────────┘
                     │           │
          ┌──────────┘           └──────────┐
          │                                 │
  ┌───────▼──────────┐           ┌──────────▼─────────┐
  │  ODDS INGESTOR   │           │  ARBITRAGE ENGINE  │
  │   (Cloud Run)    │           │    (Cloud Run)     │
  │                  │           │                    │
  │  - Fetch odds    │           │  - Scan events     │
  │  - Normalize     │───────────▶  - Detect arbs     │
  │  - Store to FB   │  Events   │  - Store tickets   │
  │  - Trigger arb   │           │  - Cloud Tasks     │
  └────────┬─────────┘           └────────────────────┘
           │
           │
  ┌────────▼─────────┐
  │   The Odds API   │
  │   (External)     │
  │                  │
  │  - Live odds     │
  │  - Multiple books│
  │  - 500 req/mo    │
  └──────────────────┘
```

---

## 📦 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend Services

- **Firebase Authentication** - Google OAuth
- **Firestore** - NoSQL database with real-time sync
- **Firebase Functions** - Serverless background tasks
- **Firebase Cloud Messaging** - Push notifications
- **Cloud Run** - Container hosting for services
- **Cloud Tasks** - Async job queue

### External APIs

- **The Odds API** - Live sportsbook odds
- **Stripe** (planned) - Payment processing

### Development Tools

- **ESLint** - Code linting
- **Prettier** (implicit) - Code formatting
- **Jest** - Unit testing
- **Firebase Emulators** - Local development

---

## 📂 Project Structure

```
pickit/
├── web/                          # React web application
│   ├── public/
│   │   ├── firebase-messaging-sw.js  # FCM service worker
│   │   └── Background.jpeg           # Hero image
│   ├── source/
│   │   ├── components/              # React components
│   │   │   ├── admin/              # Admin-only components
│   │   │   ├── buttons/            # Reusable buttons
│   │   │   ├── dashboard/          # Pro dashboard components
│   │   │   ├── footer/             # Footer component
│   │   │   ├── free/               # Free picks components
│   │   │   ├── guards/             # Route guards (ProGuard, AdminGuard)
│   │   │   ├── layouts/            # Page layouts
│   │   │   ├── navigation/         # Navbar, Sidebar
│   │   │   ├── news/               # News/articles components
│   │   │   ├── notifications/      # Notification settings
│   │   │   ├── tickets/            # Ticket display components
│   │   │   └── watchlist/          # Watchlist components
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # Auth state management
│   │   │   ├── useUserPlan.ts      # User subscription status
│   │   │   ├── useWatchlist.ts     # Watchlist CRUD
│   │   │   ├── useEnrichedWatchlist.ts  # Watchlist with event data
│   │   │   ├── useEventOdds.ts     # Real-time odds fetching
│   │   │   ├── useUserTickets.ts   # Saved tickets management
│   │   │   └── useFreePicksPaginated.ts
│   │   ├── lib/                    # Core utilities
│   │   │   ├── firebase.ts         # Firebase config & FCM setup
│   │   │   ├── converters.ts       # Firestore data converters
│   │   │   ├── constants.ts        # App constants
│   │   │   ├── utils.ts            # Helper functions
│   │   │   ├── error-handler.ts    # Error handling utilities
│   │   │   └── common-types.ts     # Shared TypeScript types
│   │   ├── pages/                  # Route components
│   │   │   ├── Account.tsx         # User account page
│   │   │   ├── ProDashboard.tsx    # Premium dashboard
│   │   │   ├── BrowseEvents.tsx    # Event browser
│   │   │   ├── Watchlist.tsx       # Full watchlist page
│   │   │   ├── MyTickets.tsx       # Saved tickets page
│   │   │   ├── billing.tsx         # Billing & subscriptions
│   │   │   ├── FreePicks.tsx       # Free picks landing
│   │   │   └── [sport].tsx         # Sport-specific pages
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── events.ts           # Event & odds types
│   │   │   ├── watchlist.ts        # Watchlist types
│   │   │   └── tickets.ts          # Ticket types
│   │   ├── App.tsx                 # Root component with routing
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── functions/                     # Firebase Cloud Functions
│   ├── lib/
│   │   └── watchlist-monitor.js   # Odds change detection
│   ├── index.js                   # Function exports
│   └── package.json
│
├── services/
│   ├── odds-ingestor/             # Odds fetching service
│   │   ├── index.js               # Express server + API client
│   │   ├── firestore/
│   │   │   └── schemas/           # Firestore schema definitions
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── arbitrage-engine/          # Arb detection service
│       ├── index.js               # Express server + Cloud Tasks
│       ├── lib/
│       │   ├── config.js          # Environment configuration
│       │   ├── firestore.js       # Firestore queries
│       │   ├── oddsMath.js        # Arb calculations
│       │   ├── scanMoneyline.js   # Moneyline arbs
│       │   ├── scanSpread.js      # Spread arbs
│       │   └── scanTotal.js       # Totals arbs
│       ├── Dockerfile
│       └── package.json
│
├── __tests__/                     # Integration tests
│   ├── notifications.integration.test.js
│   └── watchlist-monitor.test.js
│
├── firestore.rules                # Security rules
├── firestore.indexes.json         # Composite indexes
├── firebase.json                  # Firebase configuration
├── .firebaserc                    # Firebase project aliases
└── README.md                      # Project documentation
```

---

## 🔗 Key Dependencies

### Web App

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "firebase": "^11.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "vite": "^6.x"
}
```

### Cloud Functions

```json
{
  "firebase-admin": "^12.x",
  "firebase-functions": "^6.x"
}
```

### Odds Ingestor

```json
{
  "express": "^4.x",
  "firebase-admin": "^12.x",
  "node-fetch": "^3.x",
  "@google-cloud/tasks": "^6.x"
}
```

### Arbitrage Engine

```json
{
  "express": "^4.x",
  "firebase-admin": "^12.x",
  "@google-cloud/tasks": "^6.x"
}
```

---

## 🔥 Firebase Collections Schema

### `users/{userId}`

```typescript
{
  email: string;
  username?: string;
  isPremium: boolean;
  isAdmin: boolean;
  fcmToken?: string;
  notificationsEnabled: boolean;
  createdAt: Timestamp;

  // Subcollection: savedTickets
  savedTickets/{ticketId}: {
    ticketId: string;
    ticketType: 'arb' | 'game';
    savedAt: Timestamp;
    notificationSent?: boolean;
  }
}
```

### `events/{eventId}`

```typescript
{
  sport: 'americanfootball_nfl' | 'basketball_nba' | 'icehockey_nhl' | 'baseball_mlb';
  teams: { home: string; away: string };
  startTime: Timestamp;
  lastOddsUpdate?: Timestamp;
  expiresAt: Timestamp; // TTL field (7 days)

  // Embedded markets (for performance)
  markets?: {
    [bookId: string]: {
      moneyline?: {
        home?: { priceAmerican?: number; priceDecimal?: number };
        away?: { priceAmerican?: number; priceDecimal?: number };
        lastUpdate: Timestamp;
      };
      spread?: {
        home?: { priceAmerican?: number; priceDecimal?: number; point?: number };
        away?: { priceAmerican?: number; priceDecimal?: number; point?: number };
        lastUpdate: Timestamp;
      };
      totals?: {
        over?: { priceAmerican?: number; priceDecimal?: number; point?: number };
        under?: { priceAmerican?: number; priceDecimal?: number; point?: number };
        lastUpdate: Timestamp;
      };
    }
  };

  // Subcollection: markets/{marketId}/books/{bookId}/snapshots/{timestamp}
  // (for line movement history)
}
```

### `arbTickets/{arbId}`

```typescript
{
  eventId: string;
  marketId: string; // 'h2h', 'spreads', 'totals'
  legs: Array<{
    bookId: string;
    side: string; // 'home', 'away', 'over', 'under'
    priceDecimal: number;
    stake: number;
  }>;
  margin: number; // Guaranteed profit %
  createdAt: Timestamp;
  settleDate?: Timestamp;
  serverSettled: boolean; // False = premium only, True = public
}
```

### `gameTickets/{ticketId}`

```typescript
{
  sportsbook: string;
  league: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selectionTeam?: string;
  selectionSide?: string;
  oddsAmerican: number;
  description?: string;
  pickType?: string;
  pickPublishDate: Timestamp;
  settleDate?: Timestamp;
  serverSettled: boolean; // False = premium only, True = public
}
```

### `watchlists/{userId}`

```typescript
{
  games: Array<{
    id: string; // Event ID
    league: string;
    teams: { home: string; away: string };
    startTime: Timestamp;
    addedAt: Timestamp;
  }>;
  teams: Array<{
    id: string;
    name: string;
    league: string;
    addedAt: Timestamp;
  }>;
  markets: Array<{
    eventId: string;
    marketType: string;
    alertThreshold?: number;
    addedAt: Timestamp;
  }>;
}
```

### `articles/{articleId}`

```typescript
{
  title: string;
  slug: string;
  content: string;
  sport?: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  expiresAt: Timestamp; // TTL field
}
```

---

## 🚀 Deployment Guide

### Prerequisites

1. **Firebase Project** - Create at console.firebase.google.com
2. **Google Cloud Project** - Same as Firebase project
3. **The Odds API Key** - Get from theoddsapi.com
4. **Service Accounts** - For Cloud Run authentication

### Step 1: Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting

# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Step 2: Web App Deployment

```bash
cd web

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
EOF

# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Step 3: Odds Ingestor Deployment

```bash
cd services/odds-ingestor

# Build container
gcloud builds submit --tag gcr.io/[PROJECT_ID]/odds-ingestor

# Deploy to Cloud Run
gcloud run deploy odds-ingestor \
  --image gcr.io/[PROJECT_ID]/odds-ingestor \
  --platform managed \
  --region us-central1 \
  --set-env-vars ODDS_API_KEY=[YOUR_KEY],ODDS_SPORTS=americanfootball_nfl,basketball_nba \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300s

# Set up Cloud Scheduler to trigger every hour
gcloud scheduler jobs create http odds-fetch-hourly \
  --schedule="0 * * * *" \
  --uri="[ODDS_INGESTOR_URL]/fetch" \
  --http-method=POST \
  --location=us-central1
```

### Step 4: Arbitrage Engine Deployment

```bash
cd services/arbitrage-engine

# Build container
gcloud builds submit --tag gcr.io/[PROJECT_ID]/arbitrage-engine

# Create Cloud Tasks queue
gcloud tasks queues create arb-scan-queue \
  --location=us-central1

# Deploy to Cloud Run
gcloud run deploy arbitrage-engine \
  --image gcr.io/[PROJECT_ID]/arbitrage-engine \
  --platform managed \
  --region us-central1 \
  --set-env-vars PROJECT_ID=[PROJECT_ID],QUEUE_ID=arb-scan-queue \
  --no-allow-unauthenticated \
  --memory 1Gi \
  --timeout 900s

# Set up Cloud Scheduler to trigger after odds fetch
gcloud scheduler jobs create http arb-scan-trigger \
  --schedule="15 * * * *" \
  --uri="[ARB_ENGINE_URL]/trigger" \
  --http-method=POST \
  --oidc-service-account-email=[SERVICE_ACCOUNT] \
  --location=us-central1
```

### Step 5: FCM Setup

```bash
# Generate VAPID key in Firebase Console:
# Project Settings > Cloud Messaging > Web Push Certificates

# Add to web/.env:
VITE_FIREBASE_VAPID_KEY=[YOUR_VAPID_KEY]
```

---

## 🧪 Testing

### Run Unit Tests

```bash
# Frontend tests (if configured)
cd web
npm test

# Functions tests
cd functions
npm test
```

### Run Integration Tests

```bash
# Firebase emulators
firebase emulators:start

# Run integration tests
npm test -- __tests__/notifications.integration.test.js
```

### Manual Testing Checklist

- [ ] Sign up with Google OAuth
- [ ] Browse events and add to watchlist
- [ ] Save an arb ticket
- [ ] Enable notifications and test FCM
- [ ] Verify premium features are gated
- [ ] Test admin dashboard (if admin)
- [ ] Check billing page displays correctly

---

## 📈 Monitoring & Logs

### Firebase Console

- **Authentication:** Monitor sign-ups and active users
- **Firestore:** Track reads/writes, monitor costs
- **Functions:** View execution logs and errors
- **Cloud Messaging:** Track notification delivery

### Google Cloud Console

- **Cloud Run:** Monitor service health, logs, and metrics
- **Cloud Tasks:** Track queue depth and execution rate
- **Logs Explorer:** Search across all services

### Key Metrics to Watch

- Firestore document reads (cost optimization)
- Odds API requests remaining (rate limiting)
- Notification delivery rate
- Arb detection success rate
- User churn rate

---

## 💰 Cost Estimates (Monthly)

### Firebase (Spark - Free Tier)

- Authentication: Free (unlimited)
- Firestore: ~$5-15 (depends on reads)
- Functions: ~$0-5 (2M invocations free)
- Hosting: Free (10GB transfer)
- FCM: Free

### Google Cloud

- Cloud Run (2 services): ~$10-30
- Cloud Tasks: ~$0.40 (1M tasks free)
- Cloud Scheduler: ~$0.30 (3 jobs)

### External APIs

- The Odds API: $0 (500 requests/mo free) or $69/mo (10K req)

**Total Estimated Cost:** $15-50/month (depends on usage)

---

## 🔐 Security Considerations

### Implemented

✅ Firestore security rules with role-based access  
✅ Premium content gating  
✅ HTTPS-only connections  
✅ Environment variable management  
✅ Service account authentication for Cloud Run

### Recommended Enhancements

- [ ] Rate limiting on API endpoints
- [ ] IP whitelisting for admin functions
- [ ] Audit logging for sensitive operations
- [ ] PCI compliance for Stripe integration
- [ ] GDPR compliance (data export/deletion)

---

## 🎓 How to Use the Final Product

### For Standard (Free) Users

1. **Sign Up:** Visit pickit.app, click "Sign In", auth with Google
2. **Browse Free Picks:** Go to Free Picks page, view public game picks
3. **View Articles:** Read sports news and analysis
4. **Upgrade Prompt:** See premium features with upgrade CTA

### For Premium Users

1. **Access Dashboard:** Navigate to Pro Dashboard via navbar
2. **Create Watchlist:**
   - Go to "Browse Events"
   - Find upcoming games
   - Click "Add to Watchlist"
3. **Set Alerts:**
   - Open Notification Settings in Account page
   - Enable push notifications
   - Browser will prompt for permission
4. **View Arb Opportunities:**
   - Navigate to sport pages (NFL, NBA, etc.)
   - Arb tickets are visible with margin %
5. **Save Tickets:**
   - Click "Save" on any ticket
   - View saved tickets in "My Tickets"
6. **Receive Notifications:**
   - Get alerted when watchlist game odds change significantly
   - Get notified 1 hour before game starts
   - Receive ticket result notifications

### For Admins

1. **Access Admin Panel:** Click "Admin" in navbar
2. **Manage Users:** View user roles, grant/revoke premium access
3. **Create Tickets:** Use ticket form to publish new picks
4. **Manage Articles:** Create and publish news articles

---

## 📞 Support & Maintenance

### Common Issues

**Issue:** Notifications not working  
**Solution:** Check VAPID key is configured, service worker is registered, FCM token saved to Firestore

**Issue:** Odds not updating  
**Solution:** Check Cloud Scheduler jobs are running, odds-ingestor logs for API errors

**Issue:** Arbs not detected  
**Solution:** Verify arbitrage-engine is processing Cloud Tasks, check ARB_MIN_EDGE threshold

**Issue:** Premium features accessible to free users  
**Solution:** Check Firestore security rules deployed, verify isPremium flag on user document

### Maintenance Tasks

- **Weekly:** Review error logs, check API quota usage
- **Monthly:** Optimize Firestore queries, clean up expired TTL documents
- **Quarterly:** Review security rules, update dependencies
- **Annually:** Renew API keys, audit costs

---

## 🎯 Next Steps

Once deployed, focus on:

1. **User Acquisition:** SEO, content marketing, social media
2. **Feature Refinement:** Based on user feedback and analytics
3. **Performance:** Optimize for Core Web Vitals
4. **Scaling:** Monitor costs, optimize queries as user base grows
5. **Phase 3+:** Implement enhanced features per roadmap

---

**Last Updated:** November 16, 2025  
**Maintainer:** PickIt! Development Team  
**Questions?** Refer to README.md or project documentation
