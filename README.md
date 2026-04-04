# Practice Studio

A focused instrument practice app built with Next.js 15 + App Router.

## Stack

- **Next.js 15** — App Router
- **React 19**
- **localStorage** — data layer (Firebase-ready, see migration guide below)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
practice-studio/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Entry point → AppShell
│   └── globals.css         # Design tokens, shared classes, paper texture
│
├── components/
│   ├── layout/
│   │   └── AppShell.jsx    # Client router + session state controller
│   ├── auth/
│   │   └── AuthScreen.jsx
│   ├── dashboard/
│   │   └── DashboardScreen.jsx
│   ├── session/
│   │   ├── SessionSetup.jsx   # Block duration picker
│   │   ├── SessionScreen.jsx  # Timer + metronome + PDF viewer
│   │   ├── BlockLog.jsx       # Post-block form
│   │   └── BreakScreen.jsx    # Break countdown
│   ├── history/
│   │   └── HistoryScreen.jsx
│   ├── profile/
│   │   └── ProfileScreen.jsx
│   └── ui/
│       ├── BottomNav.jsx
│       ├── StarRating.jsx
│       ├── MetronomePanel.jsx
│       └── PDFViewer.jsx
│
├── hooks/
│   ├── useMetronome.js     # Web Audio API metronome
│   └── useBlockTimer.js    # Count-up timer with overtime + alarms
│
├── context/
│   └── AppContext.jsx      # Global: user, blocks, session flow
│
└── lib/
    ├── constants.js        # Instruments, categories, presets, achievements
    ├── helpers.js          # Formatters, streak calc, week dots
    ├── sounds.js           # Audio utilities (alarm, metronome tick)
    └── db.js               # Data layer — localStorage now, Firebase-ready
```

---

## Session Flow

```
Dashboard → SessionSetup → SessionScreen → BlockLog → BreakScreen
                ↑                                         |
                └─────────── Next Block ──────────────────┘
```

- Timer counts **up** from 0 toward a target.
- When target is reached → alarm fires every 60s (overtime) until user taps **End**.
- **End** → BlockLog form (category, description, focus★, dexterity★, notes).
- BlockLog submit → unlocks BreakScreen.
- Break counts **down**. When it hits 0 → alarm fires every 60s (overtime) until user taps **Start Next Block** or **End Session**.

---

## PDFs

Place PDF files in `/public/pdfs/`. Update `PDF_LIST` in `lib/constants.js`:

```js
export const PDF_LIST = [
  { id: 1, title: "Major Scale Positions", category: "Scales", pages: 3 },
  // add yours here
];
```

To render real PDFs, install `react-pdf`:

```bash
npm install react-pdf
```

Then replace the mock `<div>` in `PDFViewer.jsx` with:

```jsx
import { Document, Page } from 'react-pdf';

<Document file={`/pdfs/${selected.filename}`}>
  <Page pageNumber={page} />
</Document>
```

---

## Firebase Migration

All data logic is in `lib/db.js`. Each function has a Firebase equivalent commented directly above it.

### 1. Install Firebase

```bash
npm install firebase
```

### 2. Create `lib/firebase.js`

```js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
```

### 3. Add env vars to `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Swap `lib/db.js`

Replace each function body with the Firebase equivalents shown in the comments inside `db.js`. No other files need to change.

---

## Roadmap

- [ ] Firebase Auth + Firestore
- [ ] Real PDF rendering with `react-pdf`
- [ ] Push notifications for streak reminders
- [ ] Weekly summary email
- [ ] Custom instrument avatar / profile photo
- [ ] Social — share your streak
