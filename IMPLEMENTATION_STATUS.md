# Implementation Status

**Project:** PickIt! - Premium Sports Betting Platform  
**Last Updated:** November 17, 2025

---

## [COMPLETED] Phase 0: Core Infrastructure

### Firebase & Authentication

- [x] Firebase project configuration
- [x] Google OAuth authentication
- [x] User role system (standard/premium/admin)
- [x] Firestore security rules with role-based access
- [x] TTL (Time-To-Live) for events and articles

### Database Collections

- [x] `users` - User profiles with role flags
- [x] `events` - Sports events with subcollections
  - [x] `events/{id}/markets/{marketId}` - Betting markets
  - [x] `events/{id}/markets/{marketId}/books/{bookId}` - Sportsbook odds
  - [x] Snapshots subcollection for line movement tracking
- [x] `arbTickets` - Arbitrage opportunities
- [x] `gameTickets` - Game picks and predictions
- [x] `articles` - Sports news content
- [x] `watchlists/{userId}` - User watchlist data
- [x] `users/{uid}/savedTickets` - Saved tickets subcollection

### Core Backend Services

- [x] **odds-ingestor** - The Odds API integration
  - Fetches odds from multiple sportsbooks
  - Normalizes data to Firestore schema
  - Supports both American & Decimal odds formats
  - Embedded markets structure for performance
- [x] **arbitrage-engine** - Arb detection service
  - Scans events for arbitrage opportunities
  - Moneyline, spread, and totals markets
  - Cloud Tasks integration for async processing
  - Configurable edge thresholds

### Firebase Functions

- [x] `watchlist-monitor` - Odds change detection & notifications
- [x] FCM token management
- [x] Notification rate limiting
- [x] User document initialization

---

## [COMPLETED] Phase 1: Core User Features

### Public Pages

- [x] Landing page with feature showcase
- [x] Sport-specific pages (NFL, NBA, MLB, NHL)
- [x] News/articles page with dynamic routing
- [x] About, Privacy, Terms of Service pages

### Authentication & Account

- [x] Sign in/sign up with Google OAuth
- [x] Account page with user profile
- [x] Subscription status display
- [x] Premium feature badges

### Free Picks System

- [x] Free picks page with league filtering
- [x] Pagination for picks
- [x] Server-settled vs live picks logic
- [x] Premium-gated advanced picks

### Tickets & Browsing

- [x] Arbitrage tickets display
- [x] Game tickets display
- [x] Ticket detail views
- [x] Save/unsave tickets functionality
- [x] My Tickets page with filtering

---

## [COMPLETED] Phase 2: Premium Features - Core

### Watchlist System

- [x] Add games to watchlist
- [x] Add teams to watchlist (structure ready)
- [x] Add specific markets to watchlist (structure ready)
- [x] Real-time watchlist updates
- [x] Remove watchlist items
- [x] Watchlist settings (notification preferences)
- [x] Dedicated watchlist page
- [x] Display odds for watchlisted games

### Events Browse

- [x] Browse upcoming events
- [x] League filtering
- [x] Date range filtering
- [x] Event detail view with odds
- [x] Event browser page with search

### Notifications (FCM)

- [x] Push notification infrastructure
- [x] FCM token storage and management
- [x] Notification settings UI
- [x] Enable/disable notifications toggle
- [x] Service worker for background notifications
- [x] Watchlist odds change notifications
- [x] Custom alert thresholds per user
- [x] Rate limiting (1 per hour per event)

### Pro Dashboard

- [x] Dashboard layout with sidebar
- [x] Quick stats cards
- [x] Watchlist preview (first game with full odds)
- [x] Odds comparison preview widget
- [x] Quick access links to all features
- [x] Pro route guards
- [x] Feature cards with navigation
- [x] Conditional rendering based on user role

---

## [IN PROGRESS] Phase 3: Premium Features - Enhanced

### Dashboard Enhancements

- [x] **Odds Comparison Table**
  - [x] Side-by-side odds from multiple books
  - [x] Best odds highlighting in yellow
  - [x] Live updates via Firebase
  - [x] American/Decimal format toggle
  - [x] Dashboard preview widget
  - [x] Full dedicated page with filters
  - [x] Sport and market type filtering
  - [x] Value difference indicators
  - [x] Pro user guard protection
- [ ] **Line Movement Charts**
  - Sparkline graphs for 24h movement
  - Historical odds data visualization
  - Trend indicators
- [x] **Watchlist Expansion**
  - [x] Full watchlist page with all items
  - [x] Add/remove games functionality
  - [x] Real-time odds display per game
  - [x] Settings for notifications
  - [ ] Bulk actions (remove multiple)
  - [ ] Advanced filtering
  - [ ] Sort options

### Alerts System

- [x] **Custom Alert Rules**
  - [x] Price threshold alerts
  - [x] Line movement alerts
  - [x] Arb opportunity alerts for watchlist items
- [x] **Alert Management UI**
  - [x] Create/edit/delete alert rules
  - [x] Alert history
  - [x] Snooze/mute options
- [x] **Enhanced Notifications**
  - [x] Game start reminders (1 hour before)
  - [x] Ticket result notifications
  - [x] **Resend Email Integration** (New)
    - [x] Email notifications for alerts
    - [x] HTML email templates

### Billing & Subscriptions

- [x] **Stripe Integration**
  - [x] Payment method management
  - [x] Subscription creation/cancellation
  - [x] Billing portal
- [x] **Billing Page**
  - [x] Current plan details
  - [x] Payment history
  - [x] Invoice downloads
  - [x] Upgrade/downgrade flows

---

## [PLANNED] Phase 4: Advanced Analytics

### Picks Performance Tracking

- [ ] **User Pick History**
  - Log user picks manually or via import
  - Track win/loss record
  - ROI calculations
- [ ] **Performance Dashboard**
  - Win rate by sport/league
  - Profit/loss charts
  - Streak tracking
  - Comparative analytics

### Value Indicators

- [ ] **No-Vig / Fair Lines**
  - Calculate true probability
  - Highlight +EV bets
  - Show market efficiency
- [ ] **Consensus Lines**
  - Aggregate odds across books
  - Outlier detection
  - Pinnacle comparison

### Market Analysis

- [ ] **Hold/Overround Display**
  - Per-market vig calculation
  - Best books by hold %
  - Educational tooltips
- [ ] **Sharp vs Public**
  - Line movement direction
  - Money flow indicators
  - Steam moves detection

---

## [PLANNED] Phase 5: Mobile & UX Polish

### Mobile Optimization

- [ ] Responsive dashboard layouts
- [ ] Touch-optimized interactions
- [ ] Mobile navigation improvements
- [ ] PWA enhancements

### User Experience

- [ ] Onboarding flow for new users
- [ ] Interactive tutorials
- [ ] Keyboard shortcuts
- [ ] Dark mode refinements

### Performance

- [ ] Query optimization
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size reduction

---

## [FUTURE] Phase 6: Community & AI

### Community Features

- [ ] **Public Trends**
  - % of users watching/picking teams
  - Popular bets aggregation
  - Anonymized insights
- [ ] **User Notes**
  - Private annotations on games
  - Tag system
  - Search notes

### AI Insights

- [ ] **Personalized Feed**
  - AI-generated game previews
  - Relevant news from articles collection
  - Watchlist-based recommendations
- [ ] **Advanced Models**
  - ML-based pick suggestions
  - Injury impact analysis
  - Weather factor analysis

### Social

- [ ] Shareable picks/tickets
- [ ] Leaderboards (optional)
- [ ] Follow system

---

## Known Issues & Technical Debt

### High Priority

- [ ] Events fetching optimization (reduce read costs)
- [ ] Odds staleness handling (expired events cleanup)
- [ ] Error boundaries for better error handling
- [ ] Retry logic for failed API calls

### Medium Priority

- [ ] TypeScript strict mode cleanup
- [ ] Unused dependencies removal
- [ ] Component prop validation
- [ ] Accessibility improvements (ARIA labels, keyboard nav)

### Low Priority

- [ ] Code splitting optimization
- [ ] Legacy converter cleanup
- [ ] Consistent naming conventions
- [ ] Documentation updates

---

## Metrics & Monitoring

### Currently Tracked

- [x] Odds API usage (requests remaining)
- [x] Firebase function executions
- [x] Firestore read/write counts

### Needed

- [ ] User engagement metrics
- [ ] Conversion funnel tracking
- [ ] Error rate monitoring
- [ ] Performance metrics (Core Web Vitals)
- [ ] Notification delivery rates
- [ ] Arb detection success rate

---

## Environment Variables Required

### Web App (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
```

### Odds Ingestor

```
ODDS_API_KEY=
ODDS_SPORTS=icehockey_nhl,americanfootball_nfl,basketball_nba,baseball_mlb
ODDS_REGIONS=us
ODDS_MARKETS=h2h,spreads,totals
ODDS_FORMAT=american
ARB_ENGINE_URL=
```

### Arbitrage Engine

```
PROJECT_ID=
QUEUE_ID=arb-scan-queue
QUEUE_LOCATION=us-central1
SERVICE_URL=
KICKER_SA_EMAIL=
KICKER_BASE_URL=
KICKER_PATH=/scan
KICKER_AUDIENCE=
ARB_MIN_EDGE=0.005
ARB_BANK=100
EVENT_LIMIT=150
FUTURE_WINDOW_MS=172800000
```

### Firebase Functions

```
(Automatically inherits from Firebase project)
```

---

## Timeline Estimates

### Phase 3 (Enhanced Premium) - **2-4 weeks remaining**

- ~~Week 1-2: Odds comparison table + dashboard integration~~ ✅ COMPLETED
- Week 1-2: Line movement charts
- Week 2-3: Alert system enhancements
- Week 3-4: Billing integration + polish

### Phase 4 (Analytics) - **4-5 weeks**

- Week 1-2: Pick tracking infrastructure
- Week 3: Performance dashboard
- Week 4-5: Value indicators + market analysis

### Phase 5 (Mobile/UX) - **3-4 weeks**

- Week 1-2: Mobile responsive improvements
- Week 3: UX polish + onboarding
- Week 4: Performance optimization

### Phase 6 (Community/AI) - **6-8 weeks**

- Week 1-3: Community features
- Week 4-6: AI feed + insights
- Week 7-8: Social features + testing

---

## Success Criteria

### MVP (Phases 0-2)

- [x] Users can sign up and subscribe
- [x] Users can view free picks
- [x] Premium users can access arb tickets
- [x] Premium users can save tickets
- [x] Premium users can create watchlists
- [x] Basic notifications work

### Full Product (Phases 3-4)

- [x] Premium users see live odds comparisons
- [x] Users receive timely watchlist alerts
- [x] Custom alert thresholds per user
- [ ] Billing fully automated via Stripe
- [ ] Users can track pick performance
- [ ] Value betting tools available
- [ ] 95%+ uptime

### Mature Product (Phases 5-6)

- [ ] Mobile experience on par with desktop
- [ ] AI-powered personalization active
- [ ] Community features driving engagement
- [ ] <2s page load times
- [ ] > 90% positive user feedback
