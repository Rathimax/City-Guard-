₹# 🛡️ CityGuard

**CityGuard** is a next-generation smart city management platform that bridges the gap between citizens and municipal authorities. Citizens can report urban infrastructure issues with photo evidence, voice notes, and GPS location — while city officials manage and dispatch resolutions from a powerful Mayor's Command Console.

> Built as a Full Stack Mini Project (Semester 6) by **Abhay Raj Rathi**

---

## ✨ Key Features

### 🧑‍💼 For Citizens
- **Multi-Step Issue Reporting** — A guided 3-step form: Details → Evidence (photo + voice note) → Location
- **Photo Evidence Upload** — Images are hosted securely on Cloudinary
- **Voice Note Attachment** — Record up to 3 minutes of audio to describe the issue
- **GPS Location Capture** — Real-time geolocation pinning with Google Maps integration
- **Privacy Mode** — Option to submit reports anonymously (mayor can still see your identity)
- **Urgency Levels** — Mark issues as Normal, Urgent, or Critical
- **Category Selection** — Classify issues (Roads, Water, Electrical, Sanitation, etc.)
- **Community Voting** — Reddit-style upvote system for crowdsourced prioritization
- **Real-Time Status Tracking** — Watch issues progress from Pending → In Progress → Resolved

### 🏛️ For Municipal Authorities (Mayor's Console)
- **Live Report Dashboard** — Full list of all reports with search, filters, and assignment
- **Department Assignment** — Route issues to Public Works, Sanitation, Water Authority, etc.
- **Mayor's Commands** — Issue direct resolution instructions per report
- **Security Wall** — Archived/resolved cases are locked behind an Executive Override
- **Quick Navigation** — "Go to Mayor's Command Console" button on the home screen (mayor-only)

### 📊 City Insights Dashboard
- Real-time analytics modal with animated metric cards (Total, Pending, In Progress, Resolved)
- Top Departments bar chart
- Resolution Rate donut chart
- 2×2 card grid on mobile for compact display
- Full iOS-safe scroll lock when modal is open

### 🎨 UX / Design
- **Glassmorphism UI** — Liquid glass nav, frosted cards, blur overlays
- **Light & Dark Modes** — Seamless toggle with deep slate dark palette
- **Scroll-Expansion Hero** — Cinematic image expansion on scroll/swipe
- **Framer Motion Animations** — Smooth page transitions, success popups, dropdown reveals
- **Fully Mobile Optimised** — Responsive across all screens, iOS Safari scroll locks, compact mobile layouts

### 📱 Cross-Platform / Mobile
- **Native Android Support** — Fully convertible into a native Android `.apk` or `.aab` via Capacitor integration.
- **App Store Ready** — Codebase can be packaged and uploaded directly to the Google Play Store, Amazon Appstore, or shared via GitHub Releases.
- **Progressive Web App (PWA)** — Configured with Vite PWA plugin for web installation and offline capabilities.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Core framework & build tool |
| [TypeScript](https://www.typescriptlang.org/) (partial) | Type safety in key components |
| Vanilla CSS + CSS Variables | Global theme system, dark/light modes |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility classes for layout |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Firebase Auth](https://firebase.google.com/docs/auth) | User authentication (Email + Google) |
| [Google Maps JS API](https://developers.google.com/maps) | Location capture & map display |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | REST API server |
| [MongoDB Atlas](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Primary database |
| [Cloudinary](https://cloudinary.com/) + [Multer](https://github.com/expressjs/multer) | Image & media storage |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Cloudinary](https://cloudinary.com/) account
- A [Firebase](https://firebase.google.com/) project with Email/Google Auth enabled
- A [Google Maps API Key](https://developers.google.com/maps)

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/Rathimax/City-Guard-.git
cd City-Guard-

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables

Create a `.env` file in the **root directory**:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5001
```

Create a `.env` file in the **`server/` directory**:

```env
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> ⚠️ **Never commit `.env` files.** They are already listed in `.gitignore`.

### 3. Run Locally

Run both servers simultaneously in separate terminals:

```bash
# Terminal 1 — Frontend (from root)
npm run dev

# Terminal 2 — Backend (from server/)
cd server
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

### 4. Build & Run Android App (Capacitor)

This project is configured to run natively on Android using Capacitor.

```bash
# 1. Build the production web assets
npm run build

# 2. Sync web assets with the Android project
npx cap sync

# 3. Open the Android project in Android Studio
npx cap open android
```

Once Android Studio opens, let Gradle sync, then click the **Play/Run** button to launch the app on an emulator or a connected Android device. 

To generate an APK for distribution, use `Build -> Build Bundle(s) / APK(s) -> Build APK(s)` inside the Android Studio menu.

---

## 🏗️ Project Structure

```
City-Guard-/
├── src/
│   ├── components/
│   │   ├── IssueForm.jsx          # 3-step citizen report form
│   │   ├── IssueFeed.jsx          # Community Board with voting
│   │   ├── IssueCard.jsx          # Individual issue card
│   │   ├── MayorConsole.jsx       # Admin dashboard
│   │   ├── InsightsModal.jsx      # City analytics dashboard
│   │   ├── Navbar.jsx             # Glassmorphism navigation bar
│   │   ├── Hero.tsx               # Scroll-expansion hero section
│   │   ├── AuthModal.jsx          # Login / Register modal
│   │   ├── ProfileModal.jsx       # User profile & logout
│   │   ├── NotificationDropdown.jsx
│   │   ├── RegionPromptModal.jsx  # City region selector on login
│   │   ├── MapModal.jsx           # Full-screen map view
│   │   ├── LiveInsights.jsx       # Sidebar live stats panel
│   │   └── ui/                    # Reusable UI primitives
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth + mayor role state
│   ├── hooks/                     # Custom React hooks
│   ├── firebase.js                # Firebase initialisation
│   ├── index.css                  # Global styles & CSS variables
│   └── App.jsx                    # Root router & layout
│
├── server/
│   ├── models/
│   │   ├── Issue.js               # Mongoose Issue schema
│   │   ├── User.js                # Mongoose User schema
│   │   └── Region.js              # Mongoose Region schema
│   ├── routes/
│   │   ├── issueRoutes.js
│   │   ├── userRoutes.js
│   │   └── regionRoutes.js
│   └── server.js                  # Express entry point
│
├── .env                           # Frontend env vars (not committed)
├── .env.example                   # Safe template to share
└── README.md
```

---

## 🔒 Security Notes

- All API keys and secrets are stored in `.env` files which are excluded from version control via `.gitignore`
- Firebase keys (`VITE_*`) are intentionally client-side — they are scoped and protected by Firebase Security Rules
- The MongoDB URI and Cloudinary API Secret are **backend-only** and never exposed to the client
- The Mayor role is enforced via Firebase Auth UID matching on the backend

---

## 🌐 Live Backend

The backend is deployed on [Render](https://render.com/):

```
https://city-guard-backend.onrender.com
```

---

*CityGuard — Built for smarter, safer, and cleaner cities.* 🏙️
