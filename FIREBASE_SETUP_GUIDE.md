# Firebase Setup Guide — Magic QR

This guide gives you the exact commands and configuration to take Magic QR from the `cold` state to fully live.

---

## Prerequisites

Install the Firebase CLI globally (if you haven't):

```bash
npm install -g firebase-tools
firebase login
```

---

## Step 1 — Create Your Firebase Project

1. Open [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `magic-qr-prod`) → disable Google Analytics (optional) → **Create project**
3. Inside the project, go to **Project Settings → General → Your apps → Add app → Web (</>)**
4. Name it (e.g. `magic-qr-web`), check **Also set up Firebase Hosting**, click **Register**
5. Copy the `firebaseConfig` object — you'll need it in Step 3

---

## Step 2 — Enable Firebase Services

In the Firebase Console sidebar, enable each of these:

| Service | Where | Setting |
|---------|-------|---------|
| **Authentication** | Build → Authentication → Get started | Enable **Email/Password** provider |
| **Firestore** | Build → Firestore Database → Create database | Choose **Production mode**, pick a region close to you |
| **Storage** | Build → Storage → Get started | Accept default rules for now |

---

## Step 3 — Create Your `.env` File

In the root of this project, create a file named `.env` (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in every value from your Firebase web app `firebaseConfig` object:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=magic-qr-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=magic-qr-prod
VITE_FIREBASE_STORAGE_BUCKET=magic-qr-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_GEMINI_API_KEY=AIza...
```

> **VITE_GEMINI_API_KEY** — Create this at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

> **Never commit `.env` to git.** It's already in `.gitignore`. ✅

---

## Step 4 — Add Your First Admin User

Magic QR uses Firebase Email/Password auth. There's no self-signup flow — you add admins manually:

1. Firebase Console → **Authentication → Users → Add user**
2. Enter your email + a strong password
3. Click **Add user**

That's it. Use those credentials to log in at `/admin/login`.

---

## Step 5 — Initialize Firebase CLI & Link to Your Project

Run this in the project root:

```bash
firebase init
```

When prompted:
- **Which features?** Select `Firestore`, `Storage`, `Hosting` (use spacebar to check, Enter to confirm)
- **Select project** → `Use an existing project` → pick your `magic-qr-prod`
- **Firestore rules file** → accept default (`firestore.rules`) — the file already exists ✅
- **Firestore indexes file** → accept default (`firestore.indexes.json`)
- **Storage rules file** → accept default (`storage.rules`)
- **Public directory for Hosting** → type `dist`
- **Configure as SPA?** → `Yes`
- **Set up GitHub Actions?** → `No` (unless you want CI/CD)
- **Overwrite `dist/index.html`?** → `No`

---

## Step 6 — Deploy Firestore Security Rules

The rules file (`firestore.rules`) is already written for this schema. Deploy it:

```bash
firebase deploy --only firestore:rules
```

For reference, here are the exact rules used and what they protect:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public: anyone can read restaurant branding & services
    // (needed for the customer QR flow to work without login)
    match /restaurants/{rid} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /restaurants/{rid}/services/{sid} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Public: read variants to display review options
    // Write requires auth (admin manages these)
    match /restaurants/{rid}/services/{sid}/variants/{vid} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Events: public CREATE only (analytics logging from customer phones)
    // Read/update/delete requires admin auth
    match /restaurants/{rid}/events/{eid} {
      allow create: if true
        && request.resource.data.keys().hasAll(['type', 'createdAt'])
        && request.resource.data.type in [
             'scan', 'next', 'shown', 'copy_open', 'confirm_posted'
           ];
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## Step 7 — Storage Rules (Logo Uploads)

In Firebase Console → Storage → Rules, replace the default with:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Logo images: admin-write, public-read
    match /logos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024  // max 5 MB
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Deploy it:

```bash
firebase deploy --only storage
```

---

## Step 8 — Build & Deploy Everything

```bash
# Build the production bundle
npm run build

# Deploy Hosting + Firestore rules + Storage rules in one shot
firebase deploy
```

Your app will be live at `https://magic-qr-prod.web.app` (or your custom domain).

---

## Quick Reference: All `firebase deploy` Commands

| Command | What it deploys |
|---------|----------------|
| `firebase deploy` | Everything (hosting + rules + storage) |
| `firebase deploy --only hosting` | Just the built web app |
| `firebase deploy --only firestore:rules` | Just Firestore rules |
| `firebase deploy --only storage` | Just Storage rules |
| `firebase deploy --only hosting,firestore:rules` | Hosting + Firestore rules |

---

## Troubleshooting

**"Firebase: Error (auth/invalid-credential)"**
→ Check that your admin user exists in Firebase Console → Authentication → Users

**Logo upload fails with CORS or permission error**
→ Ensure Storage rules are deployed (`firebase deploy --only storage`) and the user is logged in

**"Missing or insufficient permissions" in Firestore**
→ Run `firebase deploy --only firestore:rules` to deploy the rules in `firestore.rules`

**AI Generate returns "Gemini API key not configured"**
→ Check that `VITE_GEMINI_API_KEY` in your `.env` has a valid key and the dev server was restarted after adding it
