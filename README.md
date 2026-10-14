# TripMate AI — AI-Powered Travel Planner & Budget Manager

TripMate AI is an advanced, full-stack, responsive web application that serves as a personal travel companion and financial manager for group trips. It empowers travelers to plan itineraries, track categorized expenses with overspending alerts, compute fair debt settlements, curate road trip music playlists, discover hidden gems with AI, and play group games on the road.

---

## 🌟 Key Features

### 1. 📊 Smart Expense Tracker & Dynamic Budget Summary
- **Planned vs Actual Tracking**: Live 5-column comparison table:
  `Expense Category | Description | Planned Amount | Actual Spent | Remaining Balance`
- **Dynamic Recalculations**: Automatic re-computation on every add, edit, or delete — never using hardcoded totals.
- **Overspending Protection**: Displays positive balances in green and overspending in prominent red badges showing the exact amount exceeded instead of misleading negative savings.
- **Categorization**: Tracks `Food`, `Stay`, `Transport`, `Activities`, `Shopping`, `Miscellaneous`, and custom categories.
- **Receipt Scanning**: Use Gemini vision to suggest an expense description, amount, category, and date from a JPEG, PNG, or WebP receipt image (up to 5 MB). Suggestions can be reviewed before saving; receipt images are not stored by the app.
- **Visual Analytics**: Interactive Recharts Pie Charts (category share) and Bar Charts (budget targets vs actual spending).
- **Exporting**: One-click **CSV Expense Export** with formatted headers and payer info.

### 2. 🤖 AI Travel Budget Assistant & Place Discovery
- **Live Database Grounding**: Evaluates actual spending against planned thresholds without hallucinating or overriding user records.
- **Safe Daily Spending Cap**: Calculates remaining safe allowance per day for the remaining trip duration.
- **Overspending Alerts**: Pinpoints categories outpacing their planned allocation with targeted advice.
- **AI Place Discovery**: Recommends top attractions, shacks, heritage spots, opening hours, approximate costs, and Google Maps direct navigation links.
- **AI Day-Wise Itinerary Planner**: Generates complete morning, afternoon, and evening activities with travel times, meal spots, and budget alternatives.
- **Opt-In Trip Reminders**: Browser notifications can alert you 15 minutes before itinerary activities and when trip spending reaches 80% or exceeds the budget. Reminders run only while the trip is open in this browser and are stored as a per-user, per-trip browser preference.
- **Seamless Dual-Engine**: Connects to Google Gemini API (`GEMINI_API_KEY`) when provided, with a domain heuristic fallback for text-based recommendations when the key is absent. Receipt scanning requires Gemini.

### 3. 🤝 Shared Expense Settlement (Debt Minimization)
- **Peer Debt Splitting**: Equal or custom expense splits with companions.
- **Min-Cash-Flow Algorithm**: Greedy debt simplification algorithm that calculates individual net balances and minimizes total peer transactions.
- **Copy Payment Prompts**: Quickly copy `"Rahul pays ₹1,500 to Thanuja"` with one click.
- **Celebration Effects**: Confetti burst when group balances are settled!

### 4. 🗂️ Trip Folders & Dedicated Workspaces
- Organize trips by folders (e.g. *Goa Friends Trip 2027*, *Manali Adventure*, *Ooty Weekend*).
- Dedicated trip workspaces with tabs:
  - `Overview` — Financial health, duration countdown, companions
  - `Expenses` — Full transaction ledger, category targets, CSV export
  - `Settlements` — Simplified debt settlement paths
  - `Places` — Wishlist, visited markers, Google Maps links, AI Discovery
  - `Itinerary` — Day-by-day morning/afternoon/evening schedule
  - `Music` — Custom playlists & Spotify embedded playback
  - `Games` — Offline travel games & Random Picker
  - `Companions` — Trip attendees & emergency contact cards

### 5. 🎵 Music Companion & Embedded Playlists
- Create trip playlists by mood: `Road Trip`, `Party`, `Chill`, `Romantic`, `Telugu Hits`, `Hindi Hits`, `English Hits`.
- Direct Spotify playlist embed player integration.
- Custom track queue with song titles, artists, duration, and album art.

### 6. 🎲 Group Games Hub
- Curated library of road trip and party games:
  *Dumb Charades, Antakshari, 20 Questions, Never Have I Ever, Would You Rather, Scavenger Hunt, Travel Bingo*.
- Category filtering: `Party`, `Car Journey`, `Indoor`, `Outdoor`.
- **Random Game Picker**: Interactive animated roulette to pick games when the group can't decide!
- Add, favorite, and mark custom group games as played.

### 7. 👥 Travel Circle (Friends & Contacts)
- Centralized companion address book with phone, email, notes, and trips joined.
- **Emergency Contact Indicator**: Highlights designated emergency contacts with a shield badge for quick access during travel.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, Helmet, Morgan, Express Rate Limit, CORS, JSON Web Token (JWT), Bcrypt.js |
| **Database** | MongoDB with Mongoose ODM (Tested on MongoDB 8.x) |
| **AI Engine** | Google Gemini API integration with intelligent heuristic fallback |
| **Deployment Ready** | Vercel (Frontend), Render / Railway (Backend), MongoDB Atlas |

---

## 📁 Project Architecture & Folder Structure

```
Ai_trip_Expense/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── aiController.js       # AI budget advice, place & itinerary generation
│   │   ├── authController.js     # User registration, login, profile & security
│   │   ├── expenseController.js  # Expense ledger, category tables & CSV export
│   │   ├── friendController.js   # Travel circle contacts & emergency contacts
│   │   ├── gameController.js     # Group games library & random picker
│   │   ├── itineraryController.js# Day-wise scheduling & batch saves
│   │   ├── musicController.js    # Playlists & track queue
│   │   ├── placeController.js    # Places discovery, wishlist & maps
│   │   ├── settlementController.js# Peer debt calculation
│   │   └── tripController.js     # Trip folder CRUD & dashboard summary
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer token verification
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── Expense.js            # Expense schema with split participants
│   │   ├── Friend.js             # Companion contact schema
│   │   ├── Game.js               # Group game schema
│   │   ├── Itinerary.js          # Time-slot activity schema
│   │   ├── Place.js              # Travel attraction schema
│   │   ├── Playlist.js           # Music playlist & song schema
│   │   ├── Trip.js               # Trip folder & category budgets schema
│   │   └── User.js               # User schema with bcrypt password hashing
│   ├── routes/                   # REST API routes
│   ├── seed/
│   │   └── seedData.js           # Database seeder with demo Goa 2027 trip
│   ├── services/
│   │   ├── aiService.js          # Gemini API + domain heuristic fallback
│   │   └── settlementService.js  # Min-Cash-Flow debt simplification
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── common/           # Modal, ConfirmDialog, StatCard
│   │   │   ├── expenses/         # ExpenseTable, ExpenseCharts, SettlementCard
│   │   │   ├── friends/          # FriendCard, FriendModal
│   │   │   ├── games/            # GameCard, RandomPickerModal, AddGameModal
│   │   │   ├── itinerary/        # DayItinerary, ActivityModal, AiItineraryModal
│   │   │   ├── layout/           # Sidebar, Navbar, MobileNav
│   │   │   ├── music/            # PlaylistCard, AddSongModal, CreatePlaylistModal
│   │   │   ├── places/           # PlaceCard, AddPlaceModal, AiPlaceDiscoveryModal
│   │   │   └── trips/            # TripCard, TripFormModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication context & token management
│   │   │   └── ToastContext.jsx  # Floating notification toasts
│   │   ├── pages/
│   │   │   ├── AiAssistant.jsx   # Standalone AI travel & budget advisor
│   │   │   ├── Dashboard.jsx     # Main financial & upcoming trips dashboard
│   │   │   ├── ForgotPassword.jsx# Password recovery
│   │   │   ├── Friends.jsx       # Travel circle contacts
│   │   │   ├── Login.jsx         # Sign in with quick demo fill
│   │   │   ├── Profile.jsx       # Profile, currency selection & password
│   │   │   ├── SignUp.jsx        # Account registration
│   │   │   ├── TripDetails.jsx   # Dedicated trip workspace with 8 tabs
│   │   │   └── Trips.jsx         # Trip folders grid & filtering
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json                  # Root runner scripts
└── README.md
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas cloud connection string.

### 2. Clone and Setup Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd Ai_trip_Expense

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables
Inside `backend/.env` (see `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tripmate
JWT_SECRET=tripmate_super_secret_jwt_key_2026_secure
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Google Gemini API Key for live LLM travel recommendations and receipt scanning
# Receipt scanning requires this key; other AI suggestions use the heuristic fallback when it is empty.
GEMINI_API_KEY=
```

Inside `frontend/.env` (optional, defaults to proxy):
```env
VITE_API_URL=/api
```

### 4. Seed Sample Travel Data
Populate the database with realistic test data (Demo user, Goa Trip 2027, initial expenses, places, itinerary, playlists, and friends):
```bash
cd backend
npm run seed
```

### 5. Run the Application
In **Terminal 1** (Backend):
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

In **Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
# Application opens at http://localhost:5173
```

---

## 🔑 Demo Account Credentials

For instant testing, use the pre-configured demo account:
- **Email**: `demo@tripmate.ai`
- **Password**: `password123`
*(A "Fill Demo" button is also provided directly on the Login page for convenience!)*

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/auth/me` — Fetch authenticated user profile
- `PUT /api/auth/profile` — Update name, bio, currency preference, avatar
- `PUT /api/auth/update-password` — Change account password
- `POST /api/auth/forgot-password` — Request password reset

### Trips (`/api/trips`)
- `GET /api/trips` — Get user trip folders (filters: status, search)
- `GET /api/trips/:id` — Get trip workspace with aggregated budget status
- `POST /api/trips` — Create new trip folder
- `PUT /api/trips/:id` — Update trip details
- `PATCH /api/trips/:id/archive` — Toggle trip archived status
- `DELETE /api/trips/:id` — Delete trip & cascade delete associated records
- `GET /api/trips/dashboard/summary` — Fetch dashboard metrics

### Expenses (`/api/expenses`)
- `GET /api/expenses/trip/:tripId` — Get expenses with search, category & payer filters
- `POST /api/expenses` — Record expense with payer & equal/custom splits
- `PUT /api/expenses/:id` — Update transaction & recalculate splits
- `DELETE /api/expenses/:id` — Delete transaction
- `GET /api/expenses/trip/:tripId/export-csv` — Download expenses CSV spreadsheet

### Settlements (`/api/settlements`)
- `GET /api/settlements/trip/:tripId` — Compute peer balances & minimal settlement transactions

### Places (`/api/places`)
- `GET /api/places/trip/:tripId` — Get trip places (filters: category, visited, wishlist)
- `POST /api/places` — Add attraction manually
- `PUT /api/places/:id` — Toggle visited / assign day
- `DELETE /api/places/:id` — Remove place
- `POST /api/places/batch` — Batch save AI recommended places

### Itineraries (`/api/itineraries`)
- `GET /api/itineraries/trip/:tripId` — Get day-wise activities
- `POST /api/itineraries` — Add single activity
- `PUT /api/itineraries/:id` — Update activity / toggle complete
- `DELETE /api/itineraries/:id` — Delete activity
- `POST /api/itineraries/batch` — Batch save AI-generated day-wise itinerary

### Music & Playlists (`/api/music`)
- `GET /api/music/trip/:tripId` — Get trip playlists
- `POST /api/music/playlists` — Create mood playlist
- `DELETE /api/music/playlists/:id` — Delete playlist
- `POST /api/music/playlists/:id/songs` — Add track to playlist
- `DELETE /api/music/playlists/:id/songs/:songId` — Remove track

### Group Games (`/api/games`)
- `GET /api/games` — Fetch preset library & user games
- `POST /api/games` — Add custom game
- `PUT /api/games/:id` — Update game / toggle favorite / played
- `DELETE /api/games/:id` — Delete custom game
- `GET /api/games/random-picker` — Select random game

### AI Assistant (`/api/ai`)
- `POST /api/ai/budget-advisor` — Evaluate trip spending against planned targets
- `POST /api/ai/suggest-budget-allocation` — Recommend category breakdown percentages
- `POST /api/ai/suggest-places` — Curated place discovery with cost and duration
- `POST /api/ai/generate-itinerary` — Day-by-day morning/afternoon/evening generator
- `POST /api/ai/suggest-games` — Group game suggestions

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Push the code to GitHub.
2. In Vercel, import the repository and set the **Root Directory** to `frontend`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Configure Environment Variable:
   - `VITE_API_URL` = `https://your-backend-api.onrender.com/api`
5. Deploy!

### Backend Deployment (Render / Railway)
1. In Render, create a new **Web Service** connected to your repository.
2. Set the **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster0.mongodb.net/tripmate`
   - `JWT_SECRET` = `<your-strong-random-secret>`
   - `FRONTEND_URL` = `https://your-tripmate-frontend.vercel.app`
   - `GEMINI_API_KEY` = `<your-optional-gemini-key>`

---

## 🔒 Security & Best Practices
- **Password Protection**: Passwords salted and hashed with `bcryptjs` before persistence.
- **Protected Endpoints**: All private routes enforce JWT authentication; trips, expenses, and contacts are strictly isolated by owner ID.
- **Rate Limiting**: Rate limiters configured on authentication and AI routes to prevent brute-force attacks and abuse.
- **Header Hardening**: `helmet` enabled to sanitize HTTP response headers.
- **No Client Secrets**: API keys and secrets stored strictly server-side in `.env`.

---

## 📄 License
This project is licensed under the MIT License.
