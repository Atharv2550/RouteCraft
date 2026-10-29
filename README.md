# RouteCraft — Complete MERN Stack Trip Planning & Collaboration Platform

> **"Craft your perfect itinerary."**

RouteCraft is a smart, modern, full-stack travel planning and group collaboration platform designed for solo explorers, families, and travel squads. It enables travelers to discover global destinations, structure day-wise itineraries, organize reservations, optimize routes with deterministic heuristics, collaborate in real time with role-based permissions, and manage group expenses with fair debt settlements.

---

## 🌟 Key Highlights & Modules

### 1. 🧭 Destination Catalog & Personal Wishlist
- Curated catalog of global cities with geographic coordinates, recommended durations, average daily budgets, and high-res imagery.
- Multi-criteria filtering by name, region, and category (Culture, Food, Nature, Shopping, Architecture).
- Save places to personal wishlists and link candidate destinations directly into active trip plans.

### 2. 📅 Day-Wise Itinerary Architecture
- Auto-generates calendar days matching trip start and end date ranges.
- Drag-and-drop / chronological activity scheduling with start and end times, duration, categories, and estimated costs.
- Schedule overlap detection warns users of conflicting time slots.
- Direct external links to Google Maps coordinates for effortless navigation.

### 3. ⚡ Rule-Based Route Optimization (No AI/ML)
- Deterministic **Nearest Neighbor** heuristic enhanced with **2-Opt** local search to minimize total travel distance and transit fatigue.
- Respects fixed-time bookings (locked flights, trains, or timed museum admissions).
- Side-by-side proposal preview displaying distance saved (km) and estimated travel time saved (min) before user applies changes.

### 4. 💡 Smart Planning Suggestions (No AI/ML)
- Explainable rule-based insights:
  - Overcrowded days (> 5 scheduled activities or > 10 hours of duration).
  - High travel gap alerts (> 25 km between sequential activities).
  - Cross-day proximity suggestions (identifies nearby attractions scheduled on different days).
  - Budget overrun warnings (actual spending or planned activities exceeding target trip budget).
  - Missing coordinate alerts that limit route visualization.

### 5. 👥 Group Collaboration & Role-Based Permissions
- Roles: **Owner** (full control & cascade deletion), **Editor** (itinerary, expense, and poll updates), and **Viewer** (read-only access).
- Secure, time-limited invitation links with token validation.
- Real-time live synchronization using **Socket.IO** rooms for comments, votes, member joins, and itinerary updates.
- Destination Voting polls with real-time percentage consensus meters.
- Complete activity history audit log tracking who added, edited, or moved items.

### 6. 💰 Budget Management & Expense Splitting
- Tracks target trip budget against actual recorded group expenses.
- Supports three splitting models:
  1. **Equal Split**: Integer minor units (cents) with remainder distribution to guarantee exact mathematical balance down to the penny.
  2. **Exact Amounts**: Custom amounts per participant with sum validation.
  3. **Percentages**: Percentage-based shares with 100% total verification.
- Real-time net balance calculations (+ to receive, - owed).
- **Minimizing Cash Flow Algorithm**: Computes minimal debt transfer recommendations between members.
- Record confirmed payments to settle balances in real time.

### 7. 🏨 Manual Reservation & Booking Ledger
- Organizes bookings across Hotels, Flights, Trains, Buses, Rental Cars, Restaurants, and Activities.
- Stores booking references, provider details, check-in times, and confirmation URLs.
- Automatic conflict detection flags overlapping hotel or flight reservations.

### 8. ☀️ Weather Integration
- Live 7-day weather forecasts for trip destinations via the Open-Meteo API.
- Graceful fallback: handles provider unavailability cleanly without crashing the trip interface.

### 9. 📄 Executive PDF Export
- Server-side streaming using **PDFKit**:
  - **Itinerary PDF**: Formatted day-by-day activity timelines, booking summaries, and notes.
  - **Expense Report PDF**: Spending category breakdowns, individual member contributions, net balances, and settlement recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Material UI (MUI v6), React Router v6, TanStack Query, React Hook Form, Zod, Leaflet, Recharts, date-fns, Socket.IO Client |
| **Backend** | Node.js (ES Modules), Express.js, MongoDB, Mongoose, Socket.IO, Zod, bcryptjs, jsonwebtoken, cookie-parser, helmet, morgan, PDFKit |
| **Testing** | Vitest, Supertest |
| **Database** | MongoDB (Local service or MongoDB Atlas) |

---

## 📂 Project Structure

```
RouteCraft/
├── client/                     # Vite React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Navbar, Sidebar, AppShell, Footer, EmptyState, Notifications
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── features/trips/     # ItineraryTab, TripMapTab, BudgetTab, ReservationsTab, CollaborationTab, WeatherTab
│   │   ├── lib/                # axios.js, socket.js
│   │   ├── pages/              # Landing, Features, Destinations, Dashboard, Trips, TripDetail, Profile, Wishlist
│   │   ├── routes/             # AppRoutes, ProtectedRoute
│   │   ├── theme/              # theme.js (MUI palette, light/dark mode)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express Node.js Backend
│   ├── src/
│   │   ├── config/             # env.js, db.js
│   │   ├── controllers/        # auth, trip, itinerary, expense, settlement, reservation, member, vote, comment, weather, export, dashboard
│   │   ├── middleware/         # auth, tripAuth, validate, errorHandler
│   │   ├── models/             # User, Trip, ItineraryDay, ItineraryItem, Expense, Settlement, Reservation, Member, Vote, Comment, Log
│   │   ├── routes/             # REST endpoints under /api/v1
│   │   ├── seeds/              # seed.js (destinations, demo users, sample trip)
│   │   ├── services/           # optimizationService, smartSuggestionService, weatherService, pdfService, socketService
│   │   ├── utils/              # moneyMath, distance, logger, jwt
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server bootstrap & Socket.IO
│   ├── tests/                  # moneyMath.test.js, optimization.test.js, authAndTrips.test.js
│   └── package.json
├── package.json                # Root workspace scripts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or v20+ (tested on v22)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 2. Environment Configuration
Ensure `.env` files are present in `server/` and `client/`:
```bash
# Server environment (server/.env)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/routecraft
CLIENT_URL=http://localhost:5173
JWT_SECRET=super-secret-routecraft-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
COOKIE_SECRET=super-secret-cookie-secret-key

# Client environment (client/.env)
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Sample Database
Populate 12 global destinations, 2 demo accounts, and a sample 5-day Japan trip with activities, expenses, bookings, and team discussions:
```bash
npm run seed
```

**Pre-seeded Demo Accounts:**
- **Trip Owner**: `demo@routecraft.com` / `password123` (Sarah Jenkins)
- **Companion**: `alex@routecraft.com` / `password123` (Alex Rivera)

---

## 💻 Running the Application

### Option A: Run Both Simultaneously
Open two terminal windows:
```bash
# Terminal 1: Backend API & Socket Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Vite App (Port 5173)
npm run dev:client
```

### Option B: Build & Test
```bash
# Run all automated tests (Server & Client)
npm test

# Production build of frontend
npm run build
```

---

## 🧪 Automated Test Verification

RouteCraft includes 14 unit and integration tests across:
- `moneyMath.test.js`: Integer cent conversions, equal splits with remainder distribution, percentage splits, net balance calculation, and optimal settlement transfer generation.
- `optimization.test.js`: Geodesic Haversine distance, Nearest Neighbor + 2-Opt route improvement, and preservation of fixed-time bookings.
- `authAndTrips.test.js`: User registration, session login, JWT authentication, trip creation with auto-generated days, and role permission enforcement.
- `app.test.jsx`: Client-side money and date calculations.

Run tests:
```bash
npm test
```

---

## 🌐 API Route Summary (`/api/v1`)

| Group | Method | Endpoint | Access |
|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | Public |
| | `POST` | `/auth/login` | Public |
| | `POST` | `/auth/logout` | Public |
| | `GET` | `/auth/me` | Authenticated |
| **Profile** | `GET` | `/users/me` | Authenticated |
| | `PATCH` | `/users/me` | Authenticated |
| | `PATCH` | `/users/me/password` | Authenticated |
| | `GET/POST` | `/users/me/wishlist` | Authenticated |
| **Destinations**| `GET` | `/destinations` | Public |
| | `GET` | `/destinations/:id` | Public |
| **Trips** | `GET/POST`| `/trips` | Authenticated |
| | `GET/PATCH/DELETE` | `/trips/:tripId` | Owner / Editor / Viewer |
| | `POST` | `/trips/:tripId/duplicate` | Owner / Editor / Viewer |
| **Itinerary** | `GET` | `/trips/:tripId/itinerary` | Trip Member |
| | `POST` | `/trips/:tripId/itinerary/items` | Owner / Editor |
| | `PATCH/DELETE` | `/trips/:tripId/itinerary/items/:itemId` | Owner / Editor |
| | `POST` | `/trips/:tripId/itinerary/optimize` | Owner / Editor |
| | `POST` | `/trips/:tripId/itinerary/apply-optimize` | Owner / Editor |
| **Expenses** | `GET/POST`| `/trips/:tripId/expenses` | Trip Member |
| | `POST` | `/trips/:tripId/settlements` | Owner / Editor |
| **Bookings** | `GET/POST`| `/trips/:tripId/reservations` | Trip Member |
| **Collaboration**| `POST` | `/trips/:tripId/invitations` | Owner / Editor |
| | `POST` | `/invitations/:token/accept` | Authenticated |
| | `GET/POST`| `/trips/:tripId/votes` | Trip Member |
| | `GET/POST`| `/trips/:tripId/comments` | Trip Member |
| **Export** | `GET` | `/trips/:tripId/export/itinerary.pdf` | Trip Member |
| | `GET` | `/trips/:tripId/export/expenses.pdf` | Trip Member |
| **Dashboard** | `GET` | `/dashboard/summary` | Authenticated |

---

## 🔒 Security Best Practices Implemented
- **Password Protection**: Passwords hashed using bcrypt (10 rounds).
- **Session Handling**: HttpOnly, SameSite cookie tokens paired with Bearer token compatibility.
- **Strict Authorization**: Middleware verifies MongoDB trip membership before allowing room joins or record mutations. Viewers cannot modify items even with direct API calls.
- **Input Sanitization**: Zod validation on every input payload, rejecting invalid schemas and non-http URLs.
- **Financial Precision**: Money stored internally as integer cents (minor units) to eliminate floating-point rounding bugs.

---

© RouteCraft Team. Craft your perfect itinerary.

