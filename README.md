# Magic QR — Restaurant Google Review Booster

A mobile-first web app that helps restaurants boost their Google reviews using QR codes. Customers scan a QR code, pick a pre-written review, and get redirected to Google to post it.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A Firebase project with Firestore, Auth, and Storage enabled
- (Optional) A Gemini API key for AI-generated review variants

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Enable **Firestore Database** (start in test mode, then deploy rules)
3. Enable **Authentication** → Email/Password sign-in
4. Enable **Storage**
5. Create an admin user in Authentication → Users → Add User
6. Copy your Firebase config from Project Settings → General → Your Apps → Web

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key  # Optional, for AI generation
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 5. First-Time Admin Setup

1. Go to `http://localhost:5173/admin/login`
2. Sign in with the email/password you created in Firebase Auth
3. Create a restaurant (you'll need the Google Place ID)
4. Add services (e.g., "Ice cream", "Dine-in")
5. Generate review variants using AI or add them manually
6. Share the customer link: `http://localhost:5173/r/{your-slug}`

## 🔗 Finding Your Google Place ID

1. Go to [Google Maps](https://maps.google.com)
2. Search for your restaurant
3. Click on it and check the URL, or use the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

## 📱 Customer Flow

1. **Scan QR** → Opens `/r/{restaurantSlug}`
2. **Screen A** → Select service + optional star rating → Next
3. **Screen B** → Pick 1 of 4 review options → "Copy & Open Google"
4. Review text is copied to clipboard, Google Review page opens
5. Customer pastes and posts!

## 🚀 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Update .firebaserc with your project ID
# Then build and deploy:
npm run build
firebase deploy
```

## 🔒 Firestore Security Rules

Deploy the included security rules:

```bash
firebase deploy --only firestore:rules
```

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Gemini API for review generation
- **Routing**: React Router v7

## Project Structure

```
src/
├── components/       # Shared components (ProtectedRoute)
├── contexts/         # React contexts (AuthContext)
├── lib/              # Core libraries
│   ├── firestore.js  # Firestore CRUD helpers
│   ├── gemini.js     # Gemini API client
│   └── utils.js      # Clipboard, session, Google URL
├── pages/
│   ├── admin/        # Admin dashboard pages
│   │   ├── AdminLayout.jsx
│   │   ├── Analytics.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── RestaurantDetail.jsx
│   │   ├── RestaurantForm.jsx
│   │   └── VariantManager.jsx
│   └── customer/     # Customer-facing pages
│       ├── ScreenA.jsx
│       └── ScreenB.jsx
├── App.jsx           # Router setup
├── firebase.js       # Firebase init
├── index.css         # Design system
└── main.jsx          # Entry point
```
