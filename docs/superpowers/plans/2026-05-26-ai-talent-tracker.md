# The AI Draft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time dashboard that tracks career moves of notable people across the AI industry, powered by multi-source data collection and AI-driven analysis via OpenRouter.

**Architecture:** Simple collectors (7 independent Cloud Functions on cron schedules) feed raw changes into an AI Brain function that calls OpenRouter to classify moves, correlate signals, and generate summaries. The React frontend reads published move events from Firestore in real-time. Admin panel manages the watchlist, reviews AI-detected moves, and configures the active LLM model.

**Tech Stack:** React 19 + TypeScript + Vite, Firebase (Firestore, Cloud Functions, Auth, Hosting), OpenRouter API, Apify client, Semantic Scholar API, GitHub API, arXiv API

**Spec:** `docs/superpowers/specs/2026-05-26-ai-talent-tracker-design.md`

---

## File Structure

```
the-ai-draft/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Router + AuthProvider
│   ├── config/
│   │   └── firebase.ts                   # Firebase app init
│   ├── types/
│   │   └── index.ts                      # All shared types
│   ├── constants/
│   │   └── companies.ts                  # Default target companies
│   ├── contexts/
│   │   └── AuthContext.tsx               # Auth state + role management
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth context consumer
│   │   ├── useMoveEvents.ts              # Real-time move event queries
│   │   ├── usePeople.ts                  # People CRUD + queries
│   │   ├── useSuggestions.ts             # Suggestions CRUD + upvote
│   │   └── useConfig.ts                  # Admin config read/write
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx             # Public layout (navbar + content)
│   │   │   ├── Navbar.tsx                # Top nav with auth
│   │   │   └── AdminLayout.tsx           # Admin sidebar + content
│   │   ├── common/
│   │   │   ├── ProtectedRoute.tsx        # Requires user auth
│   │   │   ├── AdminRoute.tsx            # Requires admin role
│   │   │   ├── TierBadge.tsx             # legendary/senior/notable/emerging
│   │   │   ├── ConfidenceBadge.tsx       # confirmed/high/medium/speculative
│   │   │   └── MoveTypeBadge.tsx         # departure/new_hire/etc
│   │   ├── dashboard/
│   │   │   ├── MoveEventCard.tsx         # Single move event display
│   │   │   ├── MoveEventFeed.tsx         # List of move event cards
│   │   │   ├── FilterSidebar.tsx         # Company/type/confidence/tier filters
│   │   │   └── StatsBar.tsx              # Aggregate stats
│   │   ├── person/
│   │   │   ├── PersonHeader.tsx          # Photo, name, org, tier
│   │   │   ├── MoveTimeline.tsx          # Chronological move history
│   │   │   └── SourceLinks.tsx           # External profile links
│   │   ├── suggestions/
│   │   │   ├── SuggestionForm.tsx        # Submit new suggestion
│   │   │   └── SuggestionCard.tsx        # Display + upvote
│   │   └── admin/
│   │       ├── ReviewCard.tsx            # Pending move review card
│   │       ├── PeopleTable.tsx           # Searchable people table
│   │       ├── PersonFormModal.tsx       # Add/edit person
│   │       ├── ModelPicker.tsx           # OpenRouter model selector
│   │       └── CollectorStatusCard.tsx   # Collector health display
│   ├── pages/
│   │   ├── Landing.tsx                   # Public landing page
│   │   ├── Dashboard.tsx                 # Main feed page
│   │   ├── PersonProfile.tsx             # Person detail page
│   │   ├── SuggestPerson.tsx             # Suggestion form page
│   │   ├── Suggestions.tsx              # Browse suggestions page
│   │   └── admin/
│   │       ├── AdminDashboard.tsx        # Admin overview
│   │       ├── AdminPeople.tsx           # People management page
│   │       ├── AdminReview.tsx           # Review queue page
│   │       ├── AdminSettings.tsx         # OpenRouter + Apify config
│   │       └── AdminCollectors.tsx       # Collector status page
│   ├── services/
│   │   ├── firestore.ts                  # All Firestore operations
│   │   └── openrouter.ts                # OpenRouter model list fetch
│   └── index.css                         # Global styles (Tailwind)
├── functions/
│   ├── src/
│   │   ├── index.ts                      # All function exports
│   │   ├── types.ts                      # Shared function types
│   │   ├── utils/
│   │   │   └── collector-base.ts         # Shared collector utilities
│   │   ├── collectors/
│   │   │   ├── semantic-scholar.ts       # Semantic Scholar collector
│   │   │   ├── github-bios.ts            # GitHub profile collector
│   │   │   ├── company-websites.ts       # Team page scraper
│   │   │   ├── arxiv-papers.ts           # arXiv affiliation collector
│   │   │   ├── news-rss.ts              # RSS feed collector
│   │   │   ├── apify-linkedin.ts         # Apify LinkedIn collector
│   │   │   └── apify-x.ts               # Apify X/Twitter collector
│   │   ├── ai/
│   │   │   └── brain.ts                  # AI Brain - OpenRouter analysis
│   │   └── admin/
│   │       └── set-admin.ts              # Set admin custom claims
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   └── seed.ts                           # Watchlist seeding script
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## Phase 1: Project Foundation

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `.gitignore`, `public/favicon.svg`, `src/main.tsx`, `src/index.css`

- [ ] **Step 1: Create Vite + React + TS project**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing files.

- [ ] **Step 2: Install core dependencies**

```bash
npm install firebase react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Tailwind with Vite plugin**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace `src/index.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Create .env.example**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- [ ] **Step 5: Create minimal App.tsx to verify setup**

Replace `src/App.tsx`:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">The AI Draft</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Run dev server and verify**

```bash
npm run dev
```

Verify the page loads with "The AI Draft" centered on a dark background.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: Firebase Setup

**Files:**
- Create: `src/config/firebase.ts`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`

- [ ] **Step 1: Initialize Firebase in the project**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
firebase init firestore hosting functions
```

Selections:
- Firestore: yes (use defaults for rules and indexes files)
- Hosting: `dist` as public dir, SPA rewrite to index.html: yes
- Functions: TypeScript, ESLint: yes, install deps: yes

- [ ] **Step 2: Create Firebase config**

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

- [ ] **Step 3: Write Firestore security rules**

Replace `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // People: public read, admin write
    match /people/{personId} {
      allow read: if true;
      allow write: if isAdmin();

      // Raw changes: only functions write, admin can read
      match /rawChanges/{changeId} {
        allow read: if isAdmin();
        allow write: if false; // only Cloud Functions
      }
    }

    // Snapshots: admin read, functions write
    match /snapshots/{snapshotId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // Move events: public read published, admin write
    match /moveEvents/{eventId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    // Suggestions: authenticated read, authenticated create, admin manage
    match /suggestions/{suggestionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.submittedBy == request.auth.uid;
      allow update: if isAdmin()
        || (request.auth != null
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['upvotes']));
      allow delete: if isAdmin();
    }

    // Config: admin only
    match /config/{docId} {
      allow read, write: if isAdmin();
    }

    function isAdmin() {
      return request.auth != null
        && request.auth.token.admin == true;
    }
  }
}
```

- [ ] **Step 4: Create .env with actual Firebase project values**

Copy `.env.example` to `.env` and fill in the Firebase project credentials. (User must create the Firebase project first if not already done.)

- [ ] **Step 5: Verify Firebase connection**

Update `src/App.tsx` temporarily to test Firestore connectivity:

```tsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';

function App() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    getDocs(collection(db, 'people'))
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">The AI Draft</h1>
        <p className="mt-4 text-gray-400">
          Firebase: {connected === null ? 'connecting...' : connected ? 'connected' : 'failed'}
        </p>
      </div>
    </div>
  );
}

export default App;
```

Run `npm run dev` and verify "Firebase: connected" appears.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: add Firebase config, Firestore rules, and connection test"
```

---

### Task 3: Types and Constants

**Files:**
- Create: `src/types/index.ts`, `src/constants/companies.ts`

- [ ] **Step 1: Define all shared types**

Create `src/types/index.ts`:

```typescript
import { Timestamp } from 'firebase/firestore';

export type Tier = 'legendary' | 'senior' | 'notable' | 'emerging';

export type MoveType =
  | 'departure'
  | 'new_hire'
  | 'founded_startup'
  | 'went_academic'
  | 'returned'
  | 'role_change';

export type Confidence = 'confirmed' | 'high' | 'medium' | 'speculative';

export type MoveEventStatus = 'pending_review' | 'published' | 'dismissed';

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export type DataSource =
  | 'semantic_scholar'
  | 'github'
  | 'linkedin'
  | 'x'
  | 'company_site'
  | 'arxiv'
  | 'news';

export type AddedBy = 'seed' | 'community' | 'auto-discovered';

export type CompanyCategory =
  | 'research_lab'
  | 'ai_product'
  | 'infrastructure'
  | 'robotics';

export interface PersonSources {
  semanticScholarId?: string;
  githubUsername?: string;
  linkedinSlug?: string;
  xHandle?: string;
  personalSite?: string;
}

export interface Person {
  id: string;
  name: string;
  slug: string;
  photoUrl?: string;
  currentOrg: string;
  currentTitle?: string;
  previousOrgs: string[];
  tier: Tier;
  sources: PersonSources;
  addedBy: AddedBy;
  communityVotes: number;
  lastScannedAt: Timestamp;
  createdAt: Timestamp;
}

export interface Signal {
  source: string;
  description: string;
  detectedAt: Timestamp;
}

export interface MoveEvent {
  id: string;
  personId: string;
  type: MoveType;
  fromOrg?: string;
  toOrg?: string;
  confidence: Confidence;
  signals: Signal[];
  aiSummary: string;
  aiModel: string;
  status: MoveEventStatus;
  detectedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface Suggestion {
  id: string;
  personName: string;
  linkedinUrl?: string;
  xHandle?: string;
  reason: string;
  submittedBy: string;
  upvotes: string[];
  status: SuggestionStatus;
  createdAt: Timestamp;
}

export interface TargetCompany {
  id: string;
  name: string;
  category: CompanyCategory;
  teamPageUrls: string[];
}

export interface CollectorConfig {
  enabled: boolean;
  cronSchedule: string;
  lastRunAt: Timestamp | null;
  lastRunStatus: 'success' | 'error' | null;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

export interface AppConfig {
  openrouter: {
    activeModel: string;
    availableModels: OpenRouterModel[];
    lastModelRefresh: Timestamp | null;
  };
  collectors: Record<string, CollectorConfig>;
  apify: {
    linkedinActorId: string;
    xActorId: string;
  };
  targetCompanies: TargetCompany[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
}
```

- [ ] **Step 2: Define default target companies**

Create `src/constants/companies.ts`:

```typescript
import type { TargetCompany } from '../types';

export const DEFAULT_COMPANIES: Omit<TargetCompany, 'id'>[] = [
  // Research Labs
  { name: 'OpenAI', category: 'research_lab', teamPageUrls: ['https://openai.com/about'] },
  { name: 'Anthropic', category: 'research_lab', teamPageUrls: ['https://www.anthropic.com/company'] },
  { name: 'Google DeepMind', category: 'research_lab', teamPageUrls: ['https://deepmind.google/about/'] },
  { name: 'Meta FAIR', category: 'research_lab', teamPageUrls: ['https://ai.meta.com/research/'] },
  { name: 'xAI', category: 'research_lab', teamPageUrls: ['https://x.ai/about'] },
  { name: 'Mistral', category: 'research_lab', teamPageUrls: ['https://mistral.ai/company/'] },
  { name: 'Cohere', category: 'research_lab', teamPageUrls: ['https://cohere.com/about'] },
  { name: 'AI2', category: 'research_lab', teamPageUrls: ['https://allenai.org/team'] },
  { name: 'Microsoft Research', category: 'research_lab', teamPageUrls: ['https://www.microsoft.com/en-us/research/people/'] },
  { name: 'Apple ML Research', category: 'research_lab', teamPageUrls: ['https://machinelearning.apple.com/'] },
  { name: 'NVIDIA Research', category: 'research_lab', teamPageUrls: ['https://www.nvidia.com/en-us/research/'] },

  // AI-Native Products
  { name: 'Perplexity', category: 'ai_product', teamPageUrls: [] },
  { name: 'Cursor', category: 'ai_product', teamPageUrls: [] },
  { name: 'Lovable', category: 'ai_product', teamPageUrls: [] },
  { name: 'Bolt', category: 'ai_product', teamPageUrls: [] },
  { name: 'Replit', category: 'ai_product', teamPageUrls: [] },
  { name: 'Vercel', category: 'ai_product', teamPageUrls: [] },
  { name: 'Midjourney', category: 'ai_product', teamPageUrls: [] },
  { name: 'Runway', category: 'ai_product', teamPageUrls: [] },
  { name: 'ElevenLabs', category: 'ai_product', teamPageUrls: [] },
  { name: 'Stability AI', category: 'ai_product', teamPageUrls: [] },
  { name: 'Character.ai', category: 'ai_product', teamPageUrls: [] },
  { name: 'Inflection', category: 'ai_product', teamPageUrls: [] },
  { name: 'Adept', category: 'ai_product', teamPageUrls: [] },
  { name: 'Harvey', category: 'ai_product', teamPageUrls: [] },
  { name: 'Glean', category: 'ai_product', teamPageUrls: [] },
  { name: 'Sierra', category: 'ai_product', teamPageUrls: [] },

  // Infrastructure
  { name: 'Hugging Face', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Scale AI', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Weights & Biases', category: 'infrastructure', teamPageUrls: [] },
  { name: 'LangChain', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Databricks', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Together AI', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Fireworks AI', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Groq', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Cerebras', category: 'infrastructure', teamPageUrls: [] },
  { name: 'Modal', category: 'infrastructure', teamPageUrls: [] },

  // Robotics
  { name: 'Figure', category: 'robotics', teamPageUrls: [] },
  { name: '1X', category: 'robotics', teamPageUrls: [] },
  { name: 'Physical Intelligence', category: 'robotics', teamPageUrls: [] },
  { name: 'Boston Dynamics', category: 'robotics', teamPageUrls: [] },
  { name: 'Tesla', category: 'robotics', teamPageUrls: [] },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/constants/companies.ts
git commit -m "feat: add shared types and default target companies"
```

---

### Task 4: Auth Context and Route Guards

**Files:**
- Create: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/components/common/ProtectedRoute.tsx`, `src/components/common/AdminRoute.tsx`

- [ ] **Step 1: Create AuthContext**

Create `src/contexts/AuthContext.tsx`:

```tsx
import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

const googleProvider = new GoogleAuthProvider();

async function toUserProfile(user: User): Promise<UserProfile> {
  const token = await user.getIdTokenResult();
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? undefined,
    isAdmin: token.claims.admin === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(await toUserProfile(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 2: Create useAuth hook**

Create `src/hooks/useAuth.ts`:

```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 3: Create ProtectedRoute**

Create `src/components/common/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Create AdminRoute**

Create `src/components/common/AdminRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/contexts/ src/hooks/useAuth.ts src/components/common/
git commit -m "feat: add auth context, useAuth hook, and route guards"
```

---

## Phase 2: App Shell & Dashboard

### Task 5: App Shell — Layout and Routing

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/layout/AdminLayout.tsx`
- Modify: `src/App.tsx`
- Create page stubs: `src/pages/Landing.tsx`, `src/pages/Dashboard.tsx`, `src/pages/PersonProfile.tsx`, `src/pages/SuggestPerson.tsx`, `src/pages/Suggestions.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/AdminPeople.tsx`, `src/pages/admin/AdminReview.tsx`, `src/pages/admin/AdminSettings.tsx`, `src/pages/admin/AdminCollectors.tsx`

- [ ] **Step 1: Create Navbar**

Create `src/components/layout/Navbar.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            The AI Draft
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            {user && (
              <Link to="/suggestions" className="text-sm text-gray-400 hover:text-white transition-colors">
                Suggestions
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{user.displayName}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create AppLayout**

Create `src/components/layout/AppLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create AdminLayout**

Create `src/components/layout/AdminLayout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/review', label: 'Review Queue' },
  { to: '/admin/people', label: 'People' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/collectors', label: 'Collectors' },
];

export function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <aside className="w-56 shrink-0">
        <h2 className="text-lg font-semibold mb-4">Admin</h2>
        <nav className="flex flex-col gap-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create page stubs**

Create each page file with a simple placeholder. Example for `src/pages/Landing.tsx`:

```tsx
export default function Landing() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold">The AI Draft</h1>
      <p className="mt-4 text-xl text-gray-400">
        Track career moves across the AI industry in real time.
      </p>
    </div>
  );
}
```

Create matching stubs for: `Dashboard.tsx`, `PersonProfile.tsx`, `SuggestPerson.tsx`, `Suggestions.tsx`, `admin/AdminDashboard.tsx`, `admin/AdminPeople.tsx`, `admin/AdminReview.tsx`, `admin/AdminSettings.tsx`, `admin/AdminCollectors.tsx`.

Each stub should have a heading matching its purpose (e.g., "Dashboard", "Person Profile", etc.).

- [ ] **Step 5: Wire up App.tsx with all routes**

Replace `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PersonProfile from './pages/PersonProfile';
import SuggestPerson from './pages/SuggestPerson';
import Suggestions from './pages/Suggestions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPeople from './pages/admin/AdminPeople';
import AdminReview from './pages/admin/AdminReview';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCollectors from './pages/admin/AdminCollectors';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="person/:slug" element={<PersonProfile />} />
            <Route
              path="suggest"
              element={
                <ProtectedRoute>
                  <SuggestPerson />
                </ProtectedRoute>
              }
            />
            <Route
              path="suggestions"
              element={
                <ProtectedRoute>
                  <Suggestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="people" element={<AdminPeople />} />
              <Route path="review" element={<AdminReview />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="collectors" element={<AdminCollectors />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: Verify routing works**

Run `npm run dev`. Navigate to `/`, `/dashboard`, `/admin`. Verify layouts render correctly — public pages show navbar, admin pages show sidebar. Admin should redirect to `/` since no user is logged in.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add app shell with layouts, routing, and page stubs"
```

---

### Task 6: Firestore Service Layer

**Files:**
- Create: `src/services/firestore.ts`

- [ ] **Step 1: Build Firestore service with all CRUD operations**

Create `src/services/firestore.ts`:

```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Person,
  MoveEvent,
  Suggestion,
  AppConfig,
  MoveEventStatus,
  Confidence,
  MoveType,
  Tier,
} from '../types';

// --- People ---

export function subscribePeople(callback: (people: Person[]) => void): Unsubscribe {
  const q = query(collection(db, 'people'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Person));
  });
}

export async function getPerson(id: string): Promise<Person | null> {
  const snap = await getDoc(doc(db, 'people', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Person) : null;
}

export async function getPersonBySlug(slug: string): Promise<Person | null> {
  const q = query(collection(db, 'people'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Person;
}

export async function addPerson(person: Omit<Person, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'people'), person);
  return ref.id;
}

export async function updatePerson(id: string, data: Partial<Person>): Promise<void> {
  await updateDoc(doc(db, 'people', id), data);
}

export async function deletePerson(id: string): Promise<void> {
  await deleteDoc(doc(db, 'people', id));
}

// --- Move Events ---

export interface MoveEventFilters {
  status?: MoveEventStatus;
  confidence?: Confidence;
  type?: MoveType;
  personTier?: Tier;
  company?: string;
  maxResults?: number;
}

export function subscribeMoveEvents(
  filters: MoveEventFilters,
  callback: (events: MoveEvent[]) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters.confidence) {
    constraints.push(where('confidence', '==', filters.confidence));
  }
  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }

  constraints.push(orderBy('detectedAt', 'desc'));

  if (filters.maxResults) {
    constraints.push(limit(filters.maxResults));
  }

  const q = query(collection(db, 'moveEvents'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MoveEvent));
  });
}

export async function getMoveEventsForPerson(personId: string): Promise<MoveEvent[]> {
  const q = query(
    collection(db, 'moveEvents'),
    where('personId', '==', personId),
    where('status', '==', 'published'),
    orderBy('detectedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MoveEvent);
}

export async function updateMoveEvent(id: string, data: Partial<MoveEvent>): Promise<void> {
  await updateDoc(doc(db, 'moveEvents', id), data);
}

export async function publishMoveEvent(id: string, summary?: string): Promise<void> {
  const data: Record<string, unknown> = {
    status: 'published',
    publishedAt: Timestamp.now(),
  };
  if (summary !== undefined) data.aiSummary = summary;
  await updateDoc(doc(db, 'moveEvents', id), data);
}

export async function dismissMoveEvent(id: string): Promise<void> {
  await updateDoc(doc(db, 'moveEvents', id), { status: 'dismissed' });
}

// --- Suggestions ---

export function subscribeSuggestions(
  callback: (suggestions: Suggestion[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'suggestions'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Suggestion));
  });
}

export async function addSuggestion(
  suggestion: Omit<Suggestion, 'id' | 'upvotes' | 'status' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'suggestions'), {
    ...suggestion,
    upvotes: [],
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function upvoteSuggestion(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), {
    upvotes: arrayUnion(userId),
  });
}

export async function removeUpvote(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), {
    upvotes: arrayRemove(userId),
  });
}

export async function updateSuggestionStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), { status });
}

// --- Config ---

const CONFIG_DOC = doc(db, 'config', 'app');

export function subscribeConfig(callback: (config: AppConfig | null) => void): Unsubscribe {
  return onSnapshot(CONFIG_DOC, (snap) => {
    callback(snap.exists() ? (snap.data() as AppConfig) : null);
  });
}

export async function getConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(CONFIG_DOC);
  return snap.exists() ? (snap.data() as AppConfig) : null;
}

export async function updateConfig(data: Partial<AppConfig>): Promise<void> {
  await setDoc(CONFIG_DOC, data, { merge: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/firestore.ts
git commit -m "feat: add Firestore service layer with all CRUD operations"
```

---

### Task 7: Dashboard Page

**Files:**
- Create: `src/components/dashboard/MoveEventCard.tsx`, `src/components/dashboard/MoveEventFeed.tsx`, `src/components/dashboard/FilterSidebar.tsx`, `src/components/dashboard/StatsBar.tsx`, `src/components/common/TierBadge.tsx`, `src/components/common/ConfidenceBadge.tsx`, `src/components/common/MoveTypeBadge.tsx`, `src/hooks/useMoveEvents.ts`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Create badge components**

Create `src/components/common/MoveTypeBadge.tsx`:

```tsx
import type { MoveType } from '../../types';

const config: Record<MoveType, { label: string; className: string }> = {
  departure: { label: 'Departure', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  new_hire: { label: 'New Hire', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  founded_startup: { label: 'Founded Startup', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  went_academic: { label: 'Went Academic', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  returned: { label: 'Returned', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  role_change: { label: 'Role Change', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export function MoveTypeBadge({ type }: { type: MoveType }) {
  const { label, className } = config[type];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
```

Create `src/components/common/ConfidenceBadge.tsx`:

```tsx
import type { Confidence } from '../../types';

const config: Record<Confidence, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'text-green-400' },
  high: { label: 'High', className: 'text-blue-400' },
  medium: { label: 'Medium', className: 'text-yellow-400' },
  speculative: { label: 'Speculative', className: 'text-gray-500' },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = config[confidence];
  return <span className={`text-xs font-medium ${className}`}>{label}</span>;
}
```

Create `src/components/common/TierBadge.tsx`:

```tsx
import type { Tier } from '../../types';

const config: Record<Tier, { label: string; className: string }> = {
  legendary: { label: 'Legendary', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  senior: { label: 'Senior', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  notable: { label: 'Notable', className: 'bg-gray-500/10 text-gray-300 border-gray-500/20' },
  emerging: { label: 'Emerging', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const { label, className } = config[tier];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create useMoveEvents hook**

Create `src/hooks/useMoveEvents.ts`:

```typescript
import { useEffect, useState } from 'react';
import type { MoveEvent } from '../types';
import { subscribeMoveEvents, type MoveEventFilters } from '../services/firestore';

export function useMoveEvents(filters: MoveEventFilters = {}) {
  const [events, setEvents] = useState<MoveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeMoveEvents(filters, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsubscribe;
    // Serialize filters to avoid infinite re-subscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { events, loading };
}
```

- [ ] **Step 3: Create MoveEventCard**

Create `src/components/dashboard/MoveEventCard.tsx`:

```tsx
import { Link } from 'react-router-dom';
import type { MoveEvent, Person } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface Props {
  event: MoveEvent;
  person?: Person;
}

function timeAgo(timestamp: { seconds: number }): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp.seconds);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function MoveEventCard({ event, person }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MoveTypeBadge type={event.type} />
            <ConfidenceBadge confidence={event.confidence} />
          </div>
          <Link
            to={`/person/${person?.slug ?? event.personId}`}
            className="text-lg font-semibold hover:text-blue-400 transition-colors"
          >
            {person?.name ?? 'Unknown'}
          </Link>
          <div className="mt-1 text-sm text-gray-400">
            {event.fromOrg && <span>{event.fromOrg}</span>}
            {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
            {event.toOrg && <span>{event.toOrg}</span>}
          </div>
          <p className="mt-3 text-sm text-gray-300 line-clamp-3">{event.aiSummary}</p>
        </div>
        {person?.photoUrl && (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span>{event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}</span>
        <span>{timeAgo(event.detectedAt)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create FilterSidebar**

Create `src/components/dashboard/FilterSidebar.tsx`:

```tsx
import type { Confidence, MoveType, Tier } from '../../types';

interface Filters {
  types: MoveType[];
  confidences: Confidence[];
  tiers: Tier[];
  company: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  companies: string[];
}

const moveTypes: { value: MoveType; label: string }[] = [
  { value: 'departure', label: 'Departure' },
  { value: 'new_hire', label: 'New Hire' },
  { value: 'founded_startup', label: 'Founded Startup' },
  { value: 'went_academic', label: 'Went Academic' },
  { value: 'returned', label: 'Returned' },
  { value: 'role_change', label: 'Role Change' },
];

const confidences: { value: Confidence; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'speculative', label: 'Speculative' },
];

const tiers: { value: Tier; label: string }[] = [
  { value: 'legendary', label: 'Legendary' },
  { value: 'senior', label: 'Senior' },
  { value: 'notable', label: 'Notable' },
  { value: 'emerging', label: 'Emerging' },
];

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  const toggle = (value: T) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">{label}</h3>
      <div className="space-y-1">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, companies }: Props) {
  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Company</h3>
        <select
          value={filters.company}
          onChange={(e) => onChange({ ...filters, company: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <CheckboxGroup
        label="Move Type"
        options={moveTypes}
        selected={filters.types}
        onChange={(types) => onChange({ ...filters, types })}
      />

      <CheckboxGroup
        label="Confidence"
        options={confidences}
        selected={filters.confidences}
        onChange={(confidences) => onChange({ ...filters, confidences })}
      />

      <CheckboxGroup
        label="Tier"
        options={tiers}
        selected={filters.tiers}
        onChange={(tiers) => onChange({ ...filters, tiers })}
      />

      {(filters.types.length > 0 || filters.confidences.length > 0 || filters.tiers.length > 0 || filters.company) && (
        <button
          onClick={() => onChange({ types: [], confidences: [], tiers: [], company: '' })}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}

export type { Filters };
```

- [ ] **Step 5: Create StatsBar**

Create `src/components/dashboard/StatsBar.tsx`:

```tsx
import type { MoveEvent } from '../../types';

interface Props {
  events: MoveEvent[];
  totalPeople: number;
}

export function StatsBar({ events, totalPeople }: Props) {
  const now = Date.now() / 1000;
  const weekAgo = now - 7 * 86400;
  const thisWeek = events.filter((e) => e.detectedAt.seconds > weekAgo);

  // Find most active company (most departures this week)
  const companyCounts = new Map<string, number>();
  for (const e of thisWeek) {
    if (e.fromOrg) companyCounts.set(e.fromOrg, (companyCounts.get(e.fromOrg) ?? 0) + 1);
    if (e.toOrg) companyCounts.set(e.toOrg, (companyCounts.get(e.toOrg) ?? 0) + 1);
  }
  const mostActive = [...companyCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="border-t border-gray-800 mt-8 pt-4 flex items-center gap-6 text-sm text-gray-500">
      <span>{totalPeople} people tracked</span>
      <span className="text-gray-700">|</span>
      <span>{thisWeek.length} move{thisWeek.length !== 1 ? 's' : ''} this week</span>
      {mostActive && (
        <>
          <span className="text-gray-700">|</span>
          <span>Most active: {mostActive[0]} ({mostActive[1]})</span>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create MoveEventFeed**

Create `src/components/dashboard/MoveEventFeed.tsx`:

```tsx
import type { MoveEvent, Person } from '../../types';
import { MoveEventCard } from './MoveEventCard';

interface Props {
  events: MoveEvent[];
  people: Map<string, Person>;
  loading: boolean;
}

export function MoveEventFeed({ events, people, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
            <div className="h-5 bg-gray-800 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-32 mb-3" />
            <div className="h-12 bg-gray-800 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No moves detected yet.</p>
        <p className="mt-1 text-sm">Check back soon — collectors are scanning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <MoveEventCard
          key={event.id}
          event={event}
          person={people.get(event.personId)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Assemble Dashboard page**

Replace `src/pages/Dashboard.tsx`:

```tsx
import { useEffect, useState, useMemo } from 'react';
import { useMoveEvents } from '../hooks/useMoveEvents';
import { subscribePeople } from '../services/firestore';
import { MoveEventFeed } from '../components/dashboard/MoveEventFeed';
import { FilterSidebar, type Filters } from '../components/dashboard/FilterSidebar';
import { StatsBar } from '../components/dashboard/StatsBar';
import type { Person } from '../types';

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    confidences: [],
    tiers: [],
    company: '',
  });

  const { events, loading } = useMoveEvents({ status: 'published', maxResults: 100 });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    return subscribePeople(setPeople);
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people]
  );

  // Client-side filtering for checkbox filters
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filters.types.length > 0 && !filters.types.includes(e.type)) return false;
      if (filters.confidences.length > 0 && !filters.confidences.includes(e.confidence)) return false;
      if (filters.company) {
        if (e.fromOrg !== filters.company && e.toOrg !== filters.company) return false;
      }
      if (filters.tiers.length > 0) {
        const person = peopleMap.get(e.personId);
        if (!person || !filters.tiers.includes(person.tier)) return false;
      }
      return true;
    });
  }, [events, filters, peopleMap]);

  // Unique companies from events for filter dropdown
  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.fromOrg) set.add(e.fromOrg);
      if (e.toOrg) set.add(e.toOrg);
    }
    return [...set].sort();
  }, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} companies={companies} />
        <div className="flex-1 min-w-0">
          <MoveEventFeed events={filteredEvents} people={peopleMap} loading={loading} />
          <StatsBar events={events} totalPeople={people.length} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Verify dashboard renders**

Run `npm run dev`, navigate to `/dashboard`. Should show "No moves detected yet" with filter sidebar. Verify no console errors.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: build dashboard with move event feed, filters, and stats"
```

---

## Phase 3: Person Profiles & Community

### Task 8: Person Profile Page

**Files:**
- Create: `src/components/person/PersonHeader.tsx`, `src/components/person/MoveTimeline.tsx`, `src/components/person/SourceLinks.tsx`
- Modify: `src/pages/PersonProfile.tsx`

- [ ] **Step 1: Create PersonHeader**

Create `src/components/person/PersonHeader.tsx`:

```tsx
import type { Person } from '../../types';
import { TierBadge } from '../common/TierBadge';

export function PersonHeader({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-6">
      {person.photoUrl ? (
        <img src={person.photoUrl} alt={person.name} className="w-20 h-20 rounded-full object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-500">
          {person.name.charAt(0)}
        </div>
      )}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <TierBadge tier={person.tier} />
        </div>
        <p className="mt-1 text-gray-400">
          {person.currentTitle && <span>{person.currentTitle} at </span>}
          <span className="text-white font-medium">{person.currentOrg}</span>
        </p>
        {person.previousOrgs.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Previously: {person.previousOrgs.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SourceLinks**

Create `src/components/person/SourceLinks.tsx`:

```tsx
import type { PersonSources } from '../../types';

const links: { key: keyof PersonSources; label: string; urlPrefix: string }[] = [
  { key: 'githubUsername', label: 'GitHub', urlPrefix: 'https://github.com/' },
  { key: 'xHandle', label: 'X', urlPrefix: 'https://x.com/' },
  { key: 'linkedinSlug', label: 'LinkedIn', urlPrefix: 'https://linkedin.com/in/' },
  { key: 'semanticScholarId', label: 'Scholar', urlPrefix: 'https://www.semanticscholar.org/author/' },
  { key: 'personalSite', label: 'Website', urlPrefix: '' },
];

export function SourceLinks({ sources }: { sources: PersonSources }) {
  const available = links.filter((l) => sources[l.key]);
  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((l) => (
        <a
          key={l.key}
          href={`${l.urlPrefix}${sources[l.key]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create MoveTimeline**

Create `src/components/person/MoveTimeline.tsx`:

```tsx
import type { MoveEvent } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

export function MoveTimeline({ events }: { events: MoveEvent[] }) {
  if (events.length === 0) {
    return <p className="text-gray-500">No moves detected yet.</p>;
  }

  return (
    <div className="space-y-6">
      {events.map((event, i) => (
        <div key={event.id} className="relative pl-8">
          {/* Timeline line */}
          {i < events.length - 1 && (
            <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gray-800" />
          )}
          {/* Timeline dot */}
          <div className="absolute left-1 top-2 w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-600" />

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MoveTypeBadge type={event.type} />
              <ConfidenceBadge confidence={event.confidence} />
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(event.detectedAt.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {event.fromOrg && <span>{event.fromOrg}</span>}
              {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
              {event.toOrg && <span>{event.toOrg}</span>}
            </div>
            <p className="text-sm text-gray-300">{event.aiSummary}</p>
            {event.signals.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                  {event.signals.length} signal{event.signals.length !== 1 ? 's' : ''}
                </summary>
                <ul className="mt-2 space-y-1">
                  {event.signals.map((s, j) => (
                    <li key={j} className="text-xs text-gray-500">
                      [{s.source}] {s.description}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Assemble PersonProfile page**

Replace `src/pages/PersonProfile.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPersonBySlug, getMoveEventsForPerson } from '../services/firestore';
import { PersonHeader } from '../components/person/PersonHeader';
import { SourceLinks } from '../components/person/SourceLinks';
import { MoveTimeline } from '../components/person/MoveTimeline';
import type { Person, MoveEvent } from '../types';

export default function PersonProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<MoveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const p = await getPersonBySlug(slug);
      setPerson(p);
      if (p) {
        const e = await getMoveEventsForPerson(p.id);
        setEvents(e);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-800 rounded w-48" />
            <div className="h-4 bg-gray-800 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Person not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <PersonHeader person={person} />
      <SourceLinks sources={person.sources} />
      <div>
        <h2 className="text-xl font-semibold mb-4">Move History</h2>
        <MoveTimeline events={events} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: build person profile page with header, source links, and move timeline"
```

---

### Task 9: Community Suggestions

**Files:**
- Create: `src/components/suggestions/SuggestionForm.tsx`, `src/components/suggestions/SuggestionCard.tsx`, `src/hooks/useSuggestions.ts`
- Modify: `src/pages/SuggestPerson.tsx`, `src/pages/Suggestions.tsx`

- [ ] **Step 1: Create useSuggestions hook**

Create `src/hooks/useSuggestions.ts`:

```typescript
import { useEffect, useState } from 'react';
import type { Suggestion } from '../types';
import { subscribeSuggestions } from '../services/firestore';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSuggestions((data) => {
      setSuggestions(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { suggestions, loading };
}
```

- [ ] **Step 2: Create SuggestionForm**

Create `src/components/suggestions/SuggestionForm.tsx`:

```tsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addSuggestion } from '../../services/firestore';

export function SuggestionForm() {
  const { user } = useAuth();
  const [personName, setPersonName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !personName.trim() || !reason.trim()) return;

    setSubmitting(true);
    await addSuggestion({
      personName: personName.trim(),
      linkedinUrl: linkedinUrl.trim() || undefined,
      xHandle: xHandle.trim() || undefined,
      reason: reason.trim(),
      submittedBy: user.uid,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
        <p className="text-green-400 font-medium">Suggestion submitted!</p>
        <p className="text-sm text-gray-400 mt-1">It will appear in the suggestions list for others to upvote.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setPersonName('');
            setLinkedinUrl('');
            setXHandle('');
            setReason('');
          }}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Person Name *</label>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g. Andrej Karpathy"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL</label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="https://linkedin.com/in/..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">X Handle</label>
        <input
          type="text"
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="@handle"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Why should we track this person? *</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
          placeholder="e.g. Lead researcher at xAI, formerly at DeepMind"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Suggestion'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create SuggestionCard**

Create `src/components/suggestions/SuggestionCard.tsx`:

```tsx
import type { Suggestion } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { upvoteSuggestion, removeUpvote } from '../../services/firestore';

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const { user } = useAuth();
  const hasUpvoted = user ? suggestion.upvotes.includes(user.uid) : false;

  const handleVote = async () => {
    if (!user) return;
    if (hasUpvoted) {
      await removeUpvote(suggestion.id, user.uid);
    } else {
      await upvoteSuggestion(suggestion.id, user.uid);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4">
      <button
        onClick={handleVote}
        disabled={!user}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
          hasUpvoted
            ? 'text-blue-400 bg-blue-500/10'
            : 'text-gray-500 hover:text-white hover:bg-gray-800'
        }`}
      >
        <span className="text-lg leading-none">^</span>
        <span className="text-sm font-medium">{suggestion.upvotes.length}</span>
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{suggestion.personName}</h3>
        <p className="mt-1 text-sm text-gray-400">{suggestion.reason}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {suggestion.linkedinUrl && (
            <a href={suggestion.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              LinkedIn
            </a>
          )}
          {suggestion.xHandle && (
            <a href={`https://x.com/${suggestion.xHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              X
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire up SuggestPerson and Suggestions pages**

Replace `src/pages/SuggestPerson.tsx`:

```tsx
import { SuggestionForm } from '../components/suggestions/SuggestionForm';

export default function SuggestPerson() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Suggest a Person to Track</h1>
      <p className="text-gray-400 mb-6">
        Know someone in the AI industry we should be watching? Submit their info and the community can upvote.
      </p>
      <SuggestionForm />
    </div>
  );
}
```

Replace `src/pages/Suggestions.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionCard } from '../components/suggestions/SuggestionCard';

export default function Suggestions() {
  const { suggestions, loading } = useSuggestions();

  const sorted = [...suggestions].sort((a, b) => b.upvotes.length - a.upvotes.length);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Suggestions</h1>
        <Link
          to="/suggest"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Suggest Someone
        </Link>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No suggestions yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add community suggestions with submit form, browse, and upvoting"
```

---

## Phase 4: Admin Panel

### Task 10: Admin Review Queue

**Files:**
- Create: `src/components/admin/ReviewCard.tsx`
- Modify: `src/pages/admin/AdminReview.tsx`, `src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Create ReviewCard**

Create `src/components/admin/ReviewCard.tsx`:

```tsx
import { useState } from 'react';
import type { MoveEvent, Person } from '../../types';
import { MoveTypeBadge } from '../common/MoveTypeBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { publishMoveEvent, dismissMoveEvent } from '../../services/firestore';

interface Props {
  event: MoveEvent;
  person?: Person;
}

export function ReviewCard({ event, person }: Props) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(event.aiSummary);
  const [acting, setActing] = useState(false);

  const handlePublish = async () => {
    setActing(true);
    await publishMoveEvent(event.id, editing ? summary : undefined);
    setActing(false);
  };

  const handleDismiss = async () => {
    setActing(true);
    await dismissMoveEvent(event.id);
    setActing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MoveTypeBadge type={event.type} />
        <ConfidenceBadge confidence={event.confidence} />
        <span className="text-xs text-gray-500 ml-auto">
          Model: {event.aiModel}
        </span>
      </div>

      <h3 className="text-lg font-semibold">{person?.name ?? 'Unknown'}</h3>
      <div className="mt-1 text-sm text-gray-400">
        {event.fromOrg && <span>{event.fromOrg}</span>}
        {event.fromOrg && event.toOrg && <span className="mx-2">→</span>}
        {event.toOrg && <span>{event.toOrg}</span>}
      </div>

      {/* Signals */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-medium text-gray-400">Signals:</p>
        {event.signals.map((s, i) => (
          <p key={i} className="text-xs text-gray-500">
            [{s.source}] {s.description}
          </p>
        ))}
      </div>

      {/* Summary (editable) */}
      <div className="mt-3">
        <p className="text-xs font-medium text-gray-400 mb-1">AI Summary:</p>
        {editing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
          />
        ) : (
          <p className="text-sm text-gray-300">{event.aiSummary}</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handlePublish}
          disabled={acting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {editing ? 'Save & Publish' : 'Publish'}
        </button>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Edit & Publish
          </button>
        )}
        <button
          onClick={handleDismiss}
          disabled={acting}
          className="text-gray-500 hover:text-red-400 px-4 py-1.5 rounded-lg text-sm transition-colors ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire up AdminReview page**

Replace `src/pages/admin/AdminReview.tsx`:

```tsx
import { useEffect, useState, useMemo } from 'react';
import { useMoveEvents } from '../../hooks/useMoveEvents';
import { subscribePeople } from '../../services/firestore';
import { ReviewCard } from '../../components/admin/ReviewCard';
import type { Person } from '../../types';

export default function AdminReview() {
  const { events, loading } = useMoveEvents({ status: 'pending_review' });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    return subscribePeople(setPeople);
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people]
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Review Queue</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No pending reviews. All clear!</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <ReviewCard key={e.id} event={e} person={peopleMap.get(e.personId)} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create AdminDashboard overview**

Replace `src/pages/admin/AdminDashboard.tsx`:

```tsx
import { useMoveEvents } from '../../hooks/useMoveEvents';

export default function AdminDashboard() {
  const { events: pending } = useMoveEvents({ status: 'pending_review' });
  const { events: published } = useMoveEvents({ status: 'published', maxResults: 50 });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
          <p className="text-sm text-gray-400 mt-1">Pending Reviews</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-green-400">{published.length}</p>
          <p className="text-sm text-gray-400 mt-1">Published Moves</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add admin review queue and dashboard overview"
```

---

### Task 11: Admin People Management

**Files:**
- Create: `src/components/admin/PeopleTable.tsx`, `src/components/admin/PersonFormModal.tsx`, `src/hooks/usePeople.ts`
- Modify: `src/pages/admin/AdminPeople.tsx`

- [ ] **Step 1: Create usePeople hook**

Create `src/hooks/usePeople.ts`:

```typescript
import { useEffect, useState } from 'react';
import type { Person } from '../types';
import { subscribePeople } from '../services/firestore';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribePeople((data) => {
      setPeople(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { people, loading };
}
```

- [ ] **Step 2: Create PersonFormModal**

Create `src/components/admin/PersonFormModal.tsx`:

```tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addPerson, updatePerson } from '../../services/firestore';
import type { Person, Tier, AddedBy } from '../../types';

interface Props {
  person?: Person;
  onClose: () => void;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function PersonFormModal({ person, onClose }: Props) {
  const [name, setName] = useState(person?.name ?? '');
  const [currentOrg, setCurrentOrg] = useState(person?.currentOrg ?? '');
  const [currentTitle, setCurrentTitle] = useState(person?.currentTitle ?? '');
  const [tier, setTier] = useState<Tier>(person?.tier ?? 'notable');
  const [githubUsername, setGithubUsername] = useState(person?.sources.githubUsername ?? '');
  const [linkedinSlug, setLinkedinSlug] = useState(person?.sources.linkedinSlug ?? '');
  const [xHandle, setXHandle] = useState(person?.sources.xHandle ?? '');
  const [semanticScholarId, setSemanticScholarId] = useState(person?.sources.semanticScholarId ?? '');
  const [photoUrl, setPhotoUrl] = useState(person?.photoUrl ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      name: name.trim(),
      slug: slugify(name),
      currentOrg: currentOrg.trim(),
      currentTitle: currentTitle.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      tier,
      sources: {
        githubUsername: githubUsername.trim() || undefined,
        linkedinSlug: linkedinSlug.trim() || undefined,
        xHandle: xHandle.trim() || undefined,
        semanticScholarId: semanticScholarId.trim() || undefined,
      },
    };

    if (person) {
      await updatePerson(person.id, data);
    } else {
      await addPerson({
        ...data,
        previousOrgs: [],
        addedBy: 'seed' as AddedBy,
        communityVotes: 0,
        lastScannedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{person ? 'Edit Person' : 'Add Person'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="text" value={currentOrg} onChange={(e) => setCurrentOrg(e.target.value)} required placeholder="Current Organization" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="Title (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="legendary">Legendary</option>
            <option value="senior">Senior</option>
            <option value="notable">Notable</option>
            <option value="emerging">Emerging</option>
          </select>
          <div className="border-t border-gray-800 pt-3 mt-3">
            <p className="text-xs text-gray-400 mb-2">Source Links</p>
            <input type="text" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="GitHub username" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={linkedinSlug} onChange={(e) => setLinkedinSlug(e.target.value)} placeholder="LinkedIn slug" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="X handle" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none mb-2" />
            <input type="text" value={semanticScholarId} onChange={(e) => setSemanticScholarId(e.target.value)} placeholder="Semantic Scholar ID" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Saving...' : person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create PeopleTable**

Create `src/components/admin/PeopleTable.tsx`:

```tsx
import { useState, useMemo } from 'react';
import type { Person } from '../../types';
import { TierBadge } from '../common/TierBadge';
import { deletePerson } from '../../services/firestore';
import { PersonFormModal } from './PersonFormModal';

interface Props {
  people: Person[];
}

export function PeopleTable({ people }: Props) {
  const [search, setSearch] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return people;
    const q = search.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.currentOrg.toLowerCase().includes(q)
    );
  }, [people, search]);

  const handleDelete = async (person: Person) => {
    if (!confirm(`Delete ${person.name}?`)) return;
    await deletePerson(person.id);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or org..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          Add Person
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Added By</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person) => (
              <tr key={person.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-3 font-medium">{person.name}</td>
                <td className="px-4 py-3 text-gray-400">{person.currentOrg}</td>
                <td className="px-4 py-3"><TierBadge tier={person.tier} /></td>
                <td className="px-4 py-3 text-gray-500">{person.addedBy}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPerson(person)} className="text-gray-500 hover:text-blue-400 text-xs">Edit</button>
                    <button onClick={() => handleDelete(person)} className="text-gray-500 hover:text-red-400 text-xs">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No people found.</p>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">{filtered.length} of {people.length} people</p>

      {showAdd && <PersonFormModal onClose={() => setShowAdd(false)} />}
      {editingPerson && <PersonFormModal person={editingPerson} onClose={() => setEditingPerson(null)} />}
    </>
  );
}
```

- [ ] **Step 4: Wire up AdminPeople page**

Replace `src/pages/admin/AdminPeople.tsx`:

```tsx
import { usePeople } from '../../hooks/usePeople';
import { PeopleTable } from '../../components/admin/PeopleTable';

export default function AdminPeople() {
  const { people, loading } = usePeople();

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">People Management</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <PeopleTable people={people} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin people management with table, add/edit modal, and search"
```

---

### Task 12: Admin Settings — OpenRouter Model Picker

**Files:**
- Create: `src/services/openrouter.ts`, `src/components/admin/ModelPicker.tsx`, `src/hooks/useConfig.ts`
- Modify: `src/pages/admin/AdminSettings.tsx`

- [ ] **Step 1: Create OpenRouter service**

Create `src/services/openrouter.ts`:

```typescript
import type { OpenRouterModel } from '../types';

interface OpenRouterApiModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
  const data = await res.json();
  return data.data.map((m: OpenRouterApiModel) => ({
    id: m.id,
    name: m.name,
    pricing: m.pricing,
    context_length: m.context_length,
  }));
}
```

- [ ] **Step 2: Create useConfig hook**

Create `src/hooks/useConfig.ts`:

```typescript
import { useEffect, useState } from 'react';
import type { AppConfig } from '../types';
import { subscribeConfig } from '../services/firestore';

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeConfig((data) => {
      setConfig(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { config, loading };
}
```

- [ ] **Step 3: Create ModelPicker**

Create `src/components/admin/ModelPicker.tsx`:

```tsx
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { AppConfig, OpenRouterModel } from '../../types';
import { updateConfig } from '../../services/firestore';
import { fetchOpenRouterModels } from '../../services/openrouter';

interface Props {
  config: AppConfig;
}

export function ModelPicker({ config }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleRefreshModels = async () => {
    const key = apiKey.trim();
    if (!key) {
      setError('Enter your OpenRouter API key first.');
      return;
    }
    setRefreshing(true);
    setError('');
    try {
      const models = await fetchOpenRouterModels(key);
      await updateConfig({
        openrouter: {
          ...config.openrouter,
          availableModels: models,
          lastModelRefresh: Timestamp.now(),
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch models');
    }
    setRefreshing(false);
  };

  const handleSelectModel = async (modelId: string) => {
    await updateConfig({
      openrouter: {
        ...config.openrouter,
        activeModel: modelId,
      },
    });
  };

  const activeModel = config.openrouter.availableModels.find(
    (m) => m.id === config.openrouter.activeModel
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">OpenRouter Configuration</h3>

      {/* API Key */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">API Key</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleRefreshModels}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {refreshing ? 'Loading...' : 'Refresh Models'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Key is used client-side to fetch the model list. Functions use the key stored in Secret Manager.
        </p>
      </div>

      {/* Active Model */}
      {activeModel && (
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-400">Active Model</p>
          <p className="font-medium">{activeModel.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Prompt: ${activeModel.pricing.prompt}/token | Completion: ${activeModel.pricing.completion}/token | Context: {activeModel.context_length.toLocaleString()}
          </p>
        </div>
      )}

      {/* Model Selection */}
      {config.openrouter.availableModels.length > 0 && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Select Model</label>
          <select
            value={config.openrouter.activeModel}
            onChange={(e) => handleSelectModel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {config.openrouter.availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (${m.pricing.prompt}/tok)
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {config.openrouter.availableModels.length} models available.
            {config.openrouter.lastModelRefresh && (
              <> Last refreshed: {new Date(config.openrouter.lastModelRefresh.seconds * 1000).toLocaleString()}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire up AdminSettings page**

Replace `src/pages/admin/AdminSettings.tsx`:

```tsx
import { useConfig } from '../../hooks/useConfig';
import { ModelPicker } from '../../components/admin/ModelPicker';

export default function AdminSettings() {
  const { config, loading } = useConfig();

  if (loading) return <p className="text-gray-500">Loading config...</p>;

  if (!config) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">Settings</h1>
        <p className="text-gray-500">
          No config document found. Initialize the config by refreshing models with your OpenRouter API key.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Settings</h1>
      <div className="space-y-8">
        <ModelPicker config={config} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin settings with OpenRouter model picker"
```

---

### Task 13: Admin Collector Status

**Files:**
- Create: `src/components/admin/CollectorStatusCard.tsx`
- Modify: `src/pages/admin/AdminCollectors.tsx`

- [ ] **Step 1: Create CollectorStatusCard**

Create `src/components/admin/CollectorStatusCard.tsx`:

```tsx
import type { CollectorConfig } from '../../types';

interface Props {
  name: string;
  config: CollectorConfig;
}

export function CollectorStatusCard({ name, config }: Props) {
  const lastRun = config.lastRunAt
    ? new Date(config.lastRunAt.seconds * 1000).toLocaleString()
    : 'Never';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium capitalize">{name.replace(/_/g, ' ')}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            config.enabled
              ? 'bg-green-500/10 text-green-400'
              : 'bg-gray-500/10 text-gray-500'
          }`}
        >
          {config.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>Schedule: {config.cronSchedule}</p>
        <p>Last run: {lastRun}</p>
        {config.lastRunStatus && (
          <p>
            Status:{' '}
            <span className={config.lastRunStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
              {config.lastRunStatus}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire up AdminCollectors page**

Replace `src/pages/admin/AdminCollectors.tsx`:

```tsx
import { useConfig } from '../../hooks/useConfig';
import { CollectorStatusCard } from '../../components/admin/CollectorStatusCard';

export default function AdminCollectors() {
  const { config, loading } = useConfig();

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const collectors = config?.collectors ?? {};

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Collector Status</h1>
      {Object.keys(collectors).length === 0 ? (
        <p className="text-gray-500">No collectors configured yet. They'll appear here once Cloud Functions are deployed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(collectors).map(([name, cfg]) => (
            <CollectorStatusCard key={name} name={name} config={cfg} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add admin collector status page"
```

---

## Phase 5: Cloud Functions — Collectors & AI Brain

### Task 14: Cloud Functions Setup and Collector Base

**Files:**
- Modify: `functions/package.json`, `functions/tsconfig.json`
- Create: `functions/src/types.ts`, `functions/src/utils/collector-base.ts`, `functions/src/index.ts`

- [ ] **Step 1: Install function dependencies**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions"
npm install firebase-admin firebase-functions node-fetch@2 rss-parser apify-client
npm install -D @types/node-fetch
```

Note: `node-fetch@2` is used for CJS compatibility in Cloud Functions.

- [ ] **Step 2: Create shared types for functions**

Create `functions/src/types.ts`:

```typescript
import { Timestamp } from 'firebase-admin/firestore';

export interface PersonDoc {
  id: string;
  name: string;
  slug: string;
  currentOrg: string;
  currentTitle?: string;
  previousOrgs: string[];
  tier: 'legendary' | 'senior' | 'notable' | 'emerging';
  sources: {
    semanticScholarId?: string;
    githubUsername?: string;
    linkedinSlug?: string;
    xHandle?: string;
    personalSite?: string;
  };
  addedBy: string;
  lastScannedAt: Timestamp;
}

export interface RawChange {
  source: string;
  previousValue: Record<string, unknown>;
  currentValue: Record<string, unknown>;
  detectedAt: Timestamp;
  processed: boolean;
}

export interface SnapshotDoc {
  personId: string;
  source: string;
  data: Record<string, unknown>;
  collectedAt: Timestamp;
}

export interface CollectorConfig {
  enabled: boolean;
  cronSchedule: string;
  lastRunAt: Timestamp | null;
  lastRunStatus: 'success' | 'error' | null;
}

export type TierPriority = Record<string, number>;
```

- [ ] **Step 3: Create collector base utilities**

Create `functions/src/utils/collector-base.ts`:

```typescript
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { PersonDoc, RawChange, SnapshotDoc } from '../types';

const db = getFirestore();

/**
 * Get all people that have a specific source field set.
 * Optionally filter by tier for cost-tiered scanning.
 */
export async function getPeopleWithSource(
  sourceField: keyof PersonDoc['sources'],
  tiers?: string[]
): Promise<PersonDoc[]> {
  let query = db.collection('people') as FirebaseFirestore.Query;

  // Firestore can't query for "field exists", so we query all and filter
  const snap = await query.get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PersonDoc)
    .filter((p) => {
      if (!p.sources[sourceField]) return false;
      if (tiers && !tiers.includes(p.tier)) return false;
      return true;
    });
}

/**
 * Get the most recent snapshot for a person from a specific source.
 */
export async function getLatestSnapshot(
  personId: string,
  source: string
): Promise<SnapshotDoc | null> {
  const snap = await db
    .collection('snapshots')
    .where('personId', '==', personId)
    .where('source', '==', source)
    .orderBy('collectedAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as SnapshotDoc;
}

/**
 * Save a new snapshot.
 */
export async function saveSnapshot(snapshot: SnapshotDoc): Promise<void> {
  await db.collection('snapshots').add(snapshot);
}

/**
 * Write a raw change to the person's rawChanges subcollection.
 * This triggers the AI Brain function.
 */
export async function writeRawChange(
  personId: string,
  change: Omit<RawChange, 'processed'>
): Promise<void> {
  await db
    .collection('people')
    .doc(personId)
    .collection('rawChanges')
    .add({ ...change, processed: false });
}

/**
 * Update the lastScannedAt timestamp for a person.
 */
export async function markScanned(personId: string): Promise<void> {
  await db.collection('people').doc(personId).update({
    lastScannedAt: Timestamp.now(),
  });
}

/**
 * Update collector status in the config document.
 */
export async function updateCollectorStatus(
  collectorName: string,
  status: 'success' | 'error'
): Promise<void> {
  await db
    .collection('config')
    .doc('app')
    .set(
      {
        collectors: {
          [collectorName]: {
            lastRunAt: Timestamp.now(),
            lastRunStatus: status,
          },
        },
      },
      { merge: true }
    );
}

/**
 * Detect changes between previous and current data objects.
 * Returns the changed keys and their old/new values.
 */
export function detectChanges(
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
  keysToWatch: string[]
): { key: string; oldVal: unknown; newVal: unknown }[] {
  const changes: { key: string; oldVal: unknown; newVal: unknown }[] = [];
  for (const key of keysToWatch) {
    const oldVal = previous[key];
    const newVal = current[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ key, oldVal, newVal });
    }
  }
  return changes;
}
```

- [ ] **Step 4: Create index.ts placeholder**

Create `functions/src/index.ts`:

```typescript
import { initializeApp } from 'firebase-admin/app';

initializeApp();

// Collectors will be exported here as they are built
// export { semanticScholarCollector } from './collectors/semantic-scholar';
// export { githubBiosCollector } from './collectors/github-bios';
// etc.

// AI Brain
// export { aiBrain } from './ai/brain';
```

- [ ] **Step 5: Verify functions build**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions"
npm run build
```

Expected: clean build with no errors.

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: set up Cloud Functions with shared types and collector base utilities"
```

---

### Task 15: Semantic Scholar Collector

**Files:**
- Create: `functions/src/collectors/semantic-scholar.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Implement the collector**

Create `functions/src/collectors/semantic-scholar.ts`:

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import {
  getPeopleWithSource,
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  markScanned,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';

const SOURCE = 'semantic_scholar';
const API_BASE = 'https://api.semanticscholar.org/graph/v1';
const FIELDS = 'name,affiliations,hIndex,citationCount,paperCount';

interface AuthorResponse {
  authorId: string;
  name: string;
  affiliations?: string[];
  hIndex?: number;
  citationCount?: number;
  paperCount?: number;
}

async function fetchAuthor(authorId: string): Promise<AuthorResponse | null> {
  const res = await fetch(`${API_BASE}/author/${authorId}?fields=${FIELDS}`);
  if (!res.ok) return null;
  return res.json() as Promise<AuthorResponse>;
}

// Rate limit: 100 requests per 5 minutes = ~1 per 3 seconds
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const semanticScholarCollector = onSchedule(
  { schedule: 'every 12 hours', timeoutSeconds: 540 },
  async () => {
    try {
      const people = await getPeopleWithSource('semanticScholarId');

      for (const person of people) {
        const authorId = person.sources.semanticScholarId!;
        const author = await fetchAuthor(authorId);
        if (!author) {
          await delay(3000);
          continue;
        }

        const currentData = {
          name: author.name,
          affiliations: author.affiliations ?? [],
          hIndex: author.hIndex,
          citationCount: author.citationCount,
          paperCount: author.paperCount,
        };

        // Save snapshot
        await saveSnapshot({
          personId: person.id,
          source: SOURCE,
          data: currentData,
          collectedAt: Timestamp.now(),
        });

        // Compare with previous
        const previous = await getLatestSnapshot(person.id, SOURCE);
        if (previous) {
          const changes = detectChanges(
            previous.data as Record<string, unknown>,
            currentData as Record<string, unknown>,
            ['affiliations', 'name']
          );

          if (changes.length > 0) {
            await writeRawChange(person.id, {
              source: SOURCE,
              previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
              currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
              detectedAt: Timestamp.now(),
            });
          }
        }

        await markScanned(person.id);
        await delay(3000); // Rate limiting
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('Semantic Scholar collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
```

- [ ] **Step 2: Export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { semanticScholarCollector } from './collectors/semantic-scholar';
```

- [ ] **Step 3: Verify build**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions"
npm run build
```

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add Semantic Scholar collector function"
```

---

### Task 16: GitHub Bios Collector

**Files:**
- Create: `functions/src/collectors/github-bios.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Implement the collector**

Create `functions/src/collectors/github-bios.ts`:

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import {
  getPeopleWithSource,
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  markScanned,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';

const SOURCE = 'github';

interface GitHubUser {
  login: string;
  name: string | null;
  company: string | null;
  bio: string | null;
  blog: string | null;
}

async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'The-AI-Draft',
    },
  });
  if (!res.ok) return null;
  return res.json() as Promise<GitHubUser>;
}

export const githubBiosCollector = onSchedule(
  { schedule: 'every 12 hours', timeoutSeconds: 540 },
  async () => {
    try {
      const people = await getPeopleWithSource('githubUsername');

      for (const person of people) {
        const username = person.sources.githubUsername!;
        const user = await fetchGitHubUser(username);
        if (!user) continue;

        const currentData = {
          name: user.name,
          company: user.company,
          bio: user.bio,
          blog: user.blog,
        };

        await saveSnapshot({
          personId: person.id,
          source: SOURCE,
          data: currentData,
          collectedAt: Timestamp.now(),
        });

        const previous = await getLatestSnapshot(person.id, SOURCE);
        if (previous) {
          const changes = detectChanges(
            previous.data as Record<string, unknown>,
            currentData as Record<string, unknown>,
            ['company', 'bio']
          );

          if (changes.length > 0) {
            await writeRawChange(person.id, {
              source: SOURCE,
              previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
              currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
              detectedAt: Timestamp.now(),
            });
          }
        }

        await markScanned(person.id);
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('GitHub bios collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
```

- [ ] **Step 2: Export from index.ts and verify build**

Add `export { githubBiosCollector } from './collectors/github-bios';` to `functions/src/index.ts`.

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions" && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add GitHub bios collector function"
```

---

### Task 17: News/RSS Collector

**Files:**
- Create: `functions/src/collectors/news-rss.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Implement the collector**

Create `functions/src/collectors/news-rss.ts`:

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import Parser from 'rss-parser';
import {
  updateCollectorStatus,
} from '../utils/collector-base';

const SOURCE = 'news';
const db = getFirestore();
const parser = new Parser();

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
];

// Keywords that suggest a talent move story
const KEYWORDS = [
  'leaves', 'left', 'departs', 'departed', 'joins', 'joined',
  'hired', 'hiring', 'recruit', 'former', 'ex-',
  'co-founder', 'founded', 'startup', 'steps down',
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
}

function isRelevant(item: NewsItem): boolean {
  const text = `${item.title} ${item.content ?? ''}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw));
}

export const newsRssCollector = onSchedule(
  { schedule: 'every 6 hours', timeoutSeconds: 120 },
  async () => {
    try {
      const relevantItems: NewsItem[] = [];

      for (const feedUrl of RSS_FEEDS) {
        try {
          const feed = await parser.parseURL(feedUrl);
          for (const item of feed.items.slice(0, 20)) {
            const newsItem: NewsItem = {
              title: item.title ?? '',
              link: item.link ?? '',
              pubDate: item.pubDate ?? '',
              content: item.contentSnippet ?? item.content ?? '',
            };
            if (isRelevant(newsItem)) {
              relevantItems.push(newsItem);
            }
          }
        } catch (e) {
          console.warn(`Failed to parse feed ${feedUrl}:`, e);
        }
      }

      // Store relevant items for manual review / future AI processing
      // For now, save as a batch snapshot under a special "news" document
      if (relevantItems.length > 0) {
        await db.collection('snapshots').add({
          personId: '_news_feed',
          source: SOURCE,
          data: { items: relevantItems },
          collectedAt: Timestamp.now(),
        });
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('News/RSS collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
```

- [ ] **Step 2: Export and verify build**

Add `export { newsRssCollector } from './collectors/news-rss';` to `functions/src/index.ts`.

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions" && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add News/RSS collector function"
```

---

### Task 18: Apify LinkedIn and X Collectors

**Files:**
- Create: `functions/src/collectors/apify-linkedin.ts`, `functions/src/collectors/apify-x.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Implement LinkedIn collector**

Create `functions/src/collectors/apify-linkedin.ts`:

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ApifyClient } from 'apify-client';
import {
  getPeopleWithSource,
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  markScanned,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';
import { defineSecret } from 'firebase-functions/params';

const SOURCE = 'linkedin';
const db = getFirestore();
const apifyApiKey = defineSecret('APIFY_API_KEY');

export const apifyLinkedinCollector = onSchedule(
  {
    schedule: 'every 48 hours',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
  },
  async () => {
    try {
      const configSnap = await db.collection('config').doc('app').get();
      const config = configSnap.data();
      const actorId = config?.apify?.linkedinActorId;
      if (!actorId) {
        console.warn('No LinkedIn actor ID configured');
        return;
      }

      const client = new ApifyClient({ token: apifyApiKey.value() });

      // Get people with LinkedIn slugs, prioritize higher tiers
      const people = await getPeopleWithSource('linkedinSlug', [
        'legendary', 'senior', 'notable',
      ]);

      const profileUrls = people.map(
        (p) => `https://www.linkedin.com/in/${p.sources.linkedinSlug}`
      );

      // Run the Apify actor with all profile URLs
      const run = await client.actor(actorId).call({
        profileUrls,
        maxItems: profileUrls.length,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      // Match results back to people and detect changes
      for (const item of items) {
        const linkedinSlug = (item.profileUrl as string)
          ?.split('/in/')?.[1]
          ?.replace(/\/$/, '');
        const person = people.find((p) => p.sources.linkedinSlug === linkedinSlug);
        if (!person) continue;

        const currentData = {
          headline: item.headline,
          company: item.company,
          title: item.title,
          location: item.location,
        };

        await saveSnapshot({
          personId: person.id,
          source: SOURCE,
          data: currentData as Record<string, unknown>,
          collectedAt: Timestamp.now(),
        });

        const previous = await getLatestSnapshot(person.id, SOURCE);
        if (previous) {
          const changes = detectChanges(
            previous.data as Record<string, unknown>,
            currentData as Record<string, unknown>,
            ['company', 'title', 'headline']
          );

          if (changes.length > 0) {
            await writeRawChange(person.id, {
              source: SOURCE,
              previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
              currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
              detectedAt: Timestamp.now(),
            });
          }
        }

        await markScanned(person.id);
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('Apify LinkedIn collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
```

- [ ] **Step 2: Implement X/Twitter collector**

Create `functions/src/collectors/apify-x.ts`:

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ApifyClient } from 'apify-client';
import {
  getPeopleWithSource,
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  markScanned,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';
import { defineSecret } from 'firebase-functions/params';

const SOURCE = 'x';
const db = getFirestore();
const apifyApiKey = defineSecret('APIFY_API_KEY');

export const apifyXCollector = onSchedule(
  {
    schedule: 'every 12 hours',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
  },
  async () => {
    try {
      const configSnap = await db.collection('config').doc('app').get();
      const config = configSnap.data();
      const actorId = config?.apify?.xActorId;
      if (!actorId) {
        console.warn('No X actor ID configured');
        return;
      }

      const client = new ApifyClient({ token: apifyApiKey.value() });
      const people = await getPeopleWithSource('xHandle', [
        'legendary', 'senior',
      ]);

      const handles = people.map((p) => p.sources.xHandle!.replace('@', ''));

      const run = await client.actor(actorId).call({
        handles,
        maxItems: handles.length,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      for (const item of items) {
        const handle = (item.username as string)?.toLowerCase();
        const person = people.find(
          (p) => p.sources.xHandle?.replace('@', '').toLowerCase() === handle
        );
        if (!person) continue;

        const currentData = {
          name: item.name,
          bio: item.description ?? item.bio,
          location: item.location,
        };

        await saveSnapshot({
          personId: person.id,
          source: SOURCE,
          data: currentData as Record<string, unknown>,
          collectedAt: Timestamp.now(),
        });

        const previous = await getLatestSnapshot(person.id, SOURCE);
        if (previous) {
          const changes = detectChanges(
            previous.data as Record<string, unknown>,
            currentData as Record<string, unknown>,
            ['bio', 'name']
          );

          if (changes.length > 0) {
            await writeRawChange(person.id, {
              source: SOURCE,
              previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
              currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
              detectedAt: Timestamp.now(),
            });
          }
        }

        await markScanned(person.id);
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('Apify X collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
```

- [ ] **Step 3: Export and verify build**

Add to `functions/src/index.ts`:

```typescript
export { apifyLinkedinCollector } from './collectors/apify-linkedin';
export { apifyXCollector } from './collectors/apify-x';
```

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions" && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add Apify LinkedIn and X/Twitter collector functions"
```

---

### Task 19: AI Brain Function

**Files:**
- Create: `functions/src/ai/brain.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Implement the AI Brain**

Create `functions/src/ai/brain.ts`:

```typescript
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import { defineSecret } from 'firebase-functions/params';

const db = getFirestore();
const openrouterApiKey = defineSecret('OPENROUTER_API_KEY');

interface BrainResponse {
  isRealMove: boolean;
  type: 'departure' | 'new_hire' | 'founded_startup' | 'went_academic' | 'returned' | 'role_change';
  confidence: 'confirmed' | 'high' | 'medium' | 'speculative';
  fromOrg: string | null;
  toOrg: string | null;
  summary: string;
}

export const aiBrain = onDocumentCreated(
  {
    document: 'people/{personId}/rawChanges/{changeId}',
    secrets: [openrouterApiKey],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const change = snap.data();
    const personId = event.params.personId;

    // Get person details
    const personSnap = await db.collection('people').doc(personId).get();
    if (!personSnap.exists) return;
    const person = personSnap.data()!;

    // Check for other recent unprocessed changes (batch window: 5 minutes)
    const fiveMinAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
    const recentChanges = await db
      .collection('people')
      .doc(personId)
      .collection('rawChanges')
      .where('processed', '==', false)
      .where('detectedAt', '>=', fiveMinAgo)
      .get();

    // Collect all signals
    const signals = recentChanges.docs.map((d) => {
      const data = d.data();
      return {
        source: data.source,
        previous: data.previousValue,
        current: data.currentValue,
      };
    });

    // Get the active model from config
    const configSnap = await db.collection('config').doc('app').get();
    const config = configSnap.data();
    const model = config?.openrouter?.activeModel ?? 'anthropic/claude-haiku-4-5-20251001';

    // Build the prompt
    const signalDescriptions = signals
      .map(
        (s) =>
          `- [${s.source}] Changed from ${JSON.stringify(s.previous)} to ${JSON.stringify(s.current)}`
      )
      .join('\n');

    const prompt = `You are an AI talent movement analyst. Evaluate whether the following changes indicate a real career move.

Person: ${person.name}, currently at ${person.currentOrg}
Tier: ${person.tier}
${person.currentTitle ? `Title: ${person.currentTitle}` : ''}

Detected changes:
${signalDescriptions}

Determine if this represents a real career move (changing companies, founding a startup, going to academia, etc.) versus noise (typo fix, title change at same company, adding a side project).

Respond with ONLY valid JSON (no markdown):
{
  "isRealMove": boolean,
  "type": "departure" | "new_hire" | "founded_startup" | "went_academic" | "returned" | "role_change",
  "confidence": "confirmed" | "high" | "medium" | "speculative",
  "fromOrg": string | null,
  "toOrg": string | null,
  "summary": "2-3 sentence summary of what happened and why it matters for the AI industry"
}`;

    try {
      // Call OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterApiKey.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status, await response.text());
        return;
      }

      const data = await response.json() as {
        choices: { message: { content: string } }[];
      };

      const content = data.choices[0]?.message?.content;
      if (!content) return;

      const result: BrainResponse = JSON.parse(content);

      if (result.isRealMove) {
        // Create a move event
        await db.collection('moveEvents').add({
          personId,
          type: result.type,
          fromOrg: result.fromOrg,
          toOrg: result.toOrg,
          confidence: result.confidence,
          signals: signals.map((s) => ({
            source: s.source,
            description: `Changed from ${JSON.stringify(s.previous)} to ${JSON.stringify(s.current)}`,
            detectedAt: change.detectedAt,
          })),
          aiSummary: result.summary,
          aiModel: model,
          status: 'pending_review',
          detectedAt: Timestamp.now(),
          publishedAt: null,
        });

        // Update person's currentOrg if confident
        if (result.toOrg && (result.confidence === 'confirmed' || result.confidence === 'high')) {
          const updates: Record<string, unknown> = {
            currentOrg: result.toOrg,
          };
          if (result.fromOrg) {
            const previousOrgs = person.previousOrgs ?? [];
            if (!previousOrgs.includes(result.fromOrg)) {
              updates.previousOrgs = [...previousOrgs, result.fromOrg];
            }
          }
          await db.collection('people').doc(personId).update(updates);
        }
      }

      // Mark all processed changes as processed
      const batch = db.batch();
      for (const doc of recentChanges.docs) {
        batch.update(doc.ref, { processed: true });
      }
      await batch.commit();
    } catch (error) {
      console.error('AI Brain error:', error);
    }
  }
);
```

- [ ] **Step 2: Export and verify build**

Add to `functions/src/index.ts`:

```typescript
export { aiBrain } from './ai/brain';
```

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions" && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add AI Brain function with OpenRouter integration"
```

---

## Phase 6: Admin Setup & Landing Page

### Task 20: Admin Custom Claims Script

**Files:**
- Create: `functions/src/admin/set-admin.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create callable function to set admin claims**

Create `functions/src/admin/set-admin.ts`:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';

export const setAdminRole = onCall(async (request) => {
  // Only allow existing admins or the first-time setup
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  // Check if caller is admin (or if no admins exist yet — bootstrap)
  const caller = await getAuth().getUser(callerUid);
  const isFirstAdmin = !(caller.customClaims?.admin === true);

  if (isFirstAdmin) {
    // Bootstrap: allow the first call to set the caller as admin
    await getAuth().setCustomUserClaims(callerUid, { admin: true });
    return { message: `Admin role granted to ${caller.email} (bootstrap)` };
  }

  // Otherwise, caller must be admin to set others
  if (!caller.customClaims?.admin) {
    throw new HttpsError('permission-denied', 'Only admins can set admin roles');
  }

  const targetEmail = request.data?.email;
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  const targetUser = await getAuth().getUserByEmail(targetEmail);
  await getAuth().setCustomUserClaims(targetUser.uid, { admin: true });
  return { message: `Admin role granted to ${targetEmail}` };
});
```

- [ ] **Step 2: Export and verify build**

Add `export { setAdminRole } from './admin/set-admin';` to `functions/src/index.ts`.

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions" && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "feat: add admin custom claims callable function with bootstrap support"
```

---

### Task 21: Landing Page

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Build a compelling landing page**

Replace `src/pages/Landing.tsx`:

```tsx
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Companies Tracked', value: '50+' },
  { label: 'AI Talent Monitored', value: '500+' },
  { label: 'Data Sources', value: '7' },
  { label: 'Update Frequency', value: '6-48h' },
];

const sources = [
  'Semantic Scholar',
  'GitHub',
  'LinkedIn (via Apify)',
  'X / Twitter',
  'Company Websites',
  'arXiv Papers',
  'News & RSS',
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          The AI Draft
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time career move intelligence across the AI industry.
          Know who's leaving, who's joining, and who's starting something new.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View Dashboard
          </Link>
          <Link
            to="/suggest"
            className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium hover:border-gray-500 hover:text-white transition-colors"
          >
            Suggest Someone
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">1</p>
            <h3 className="font-semibold mb-2">Collect</h3>
            <p className="text-sm text-gray-400">
              7 automated collectors scan LinkedIn, GitHub, Semantic Scholar, X,
              company websites, arXiv, and news feeds.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">2</p>
            <h3 className="font-semibold mb-2">Analyze</h3>
            <p className="text-sm text-gray-400">
              An AI brain correlates signals across sources, filters noise,
              and determines confidence levels for each detected move.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">3</p>
            <h3 className="font-semibold mb-2">Surface</h3>
            <p className="text-sm text-gray-400">
              Verified moves appear on a real-time dashboard with AI-generated
              summaries explaining who moved and why it matters.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-6">Data Sources</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {sources.map((s) => (
            <span
              key={s}
              className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-sm text-gray-300"
            >
              {s}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify landing page renders**

Run `npm run dev`, navigate to `/`. Verify the hero, stats, how-it-works, and data sources sections render cleanly.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat: build landing page with hero, stats, and how-it-works sections"
```

---

### Task 22: Seed Script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Create the seed script**

Create `scripts/seed.ts`:

```typescript
/**
 * Seed script for The AI Draft
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key,
 * or run after `firebase login` with `firebase-admin` defaulting to the project.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize with default project or service account
initializeApp();
const db = getFirestore();

interface SeedPerson {
  name: string;
  currentOrg: string;
  currentTitle?: string;
  tier: 'legendary' | 'senior' | 'notable' | 'emerging';
  previousOrgs?: string[];
  sources?: {
    semanticScholarId?: string;
    githubUsername?: string;
    linkedinSlug?: string;
    xHandle?: string;
  };
}

const LEGENDARY: SeedPerson[] = [
  { name: 'Andrej Karpathy', currentOrg: 'Anthropic', tier: 'legendary', previousOrgs: ['OpenAI', 'Tesla'], sources: { githubUsername: 'karpathy', xHandle: '@kaborez' } },
  { name: 'Ilya Sutskever', currentOrg: 'SSI', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@iaborstever' } },
  { name: 'Dario Amodei', currentOrg: 'Anthropic', currentTitle: 'CEO', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@DarioAmodei' } },
  { name: 'Daniela Amodei', currentOrg: 'Anthropic', currentTitle: 'President', tier: 'legendary', previousOrgs: ['OpenAI'] },
  { name: 'Demis Hassabis', currentOrg: 'Google DeepMind', currentTitle: 'CEO', tier: 'legendary', sources: { xHandle: '@demaborshassabis' } },
  { name: 'Yann LeCun', currentOrg: 'Meta FAIR', currentTitle: 'Chief AI Scientist', tier: 'legendary', sources: { xHandle: '@ylecun', githubUsername: 'ylecun' } },
  { name: 'Sam Altman', currentOrg: 'OpenAI', currentTitle: 'CEO', tier: 'legendary', sources: { xHandle: '@sama' } },
  { name: 'Mira Murati', currentOrg: 'Independent', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@maborramurati' } },
  { name: 'Greg Brockman', currentOrg: 'OpenAI', currentTitle: 'President', tier: 'legendary', sources: { githubUsername: 'gdb', xHandle: '@gabordb' } },
  { name: 'Jan Leike', currentOrg: 'Anthropic', currentTitle: 'Alignment Science Lead', tier: 'legendary', previousOrgs: ['OpenAI'] },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('Seeding The AI Draft...\n');

  const allPeople = [...LEGENDARY];

  for (const person of allPeople) {
    const slug = slugify(person.name);

    // Check if already exists
    const existing = await db.collection('people').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) {
      console.log(`  SKIP: ${person.name} (already exists)`);
      continue;
    }

    await db.collection('people').add({
      name: person.name,
      slug,
      currentOrg: person.currentOrg,
      currentTitle: person.currentTitle ?? null,
      previousOrgs: person.previousOrgs ?? [],
      tier: person.tier,
      sources: person.sources ?? {},
      addedBy: 'seed',
      communityVotes: 0,
      lastScannedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    console.log(`  ADD: ${person.name} (${person.tier}) — ${person.currentOrg}`);
  }

  // Seed initial config
  const configRef = db.collection('config').doc('app');
  const configSnap = await configRef.get();
  if (!configSnap.exists) {
    await configRef.set({
      openrouter: {
        activeModel: 'anthropic/claude-haiku-4-5-20251001',
        availableModels: [],
        lastModelRefresh: null,
      },
      collectors: {
        semantic_scholar: { enabled: true, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
        github: { enabled: true, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
        company_site: { enabled: true, cronSchedule: 'every 24 hours', lastRunAt: null, lastRunStatus: null },
        arxiv: { enabled: true, cronSchedule: 'every 24 hours', lastRunAt: null, lastRunStatus: null },
        news: { enabled: true, cronSchedule: 'every 6 hours', lastRunAt: null, lastRunStatus: null },
        linkedin: { enabled: false, cronSchedule: 'every 48 hours', lastRunAt: null, lastRunStatus: null },
        x: { enabled: false, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
      },
      apify: {
        linkedinActorId: '',
        xActorId: '',
      },
      targetCompanies: [],
    });
    console.log('\n  Config document created with defaults');
  }

  console.log(`\nDone! Seeded ${allPeople.length} people.`);
}

seed().catch(console.error);
```

- [ ] **Step 2: Install tsx for running the script**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
npm install -D tsx firebase-admin
```

- [ ] **Step 3: Test the seed script** (requires Firebase project set up)

```bash
npx tsx scripts/seed.ts
```

Expected output: list of added people and config document creation.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add seed script with legendary AI talent and initial config"
```

---

### Task 23: Final Build Verification and TypeScript Check

- [ ] **Step 1: Run frontend type check and build**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
npx tsc --noEmit
npm run build
```

Fix any type errors that arise.

- [ ] **Step 2: Run functions build**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker/functions"
npm run build
```

Fix any type errors.

- [ ] **Step 3: Commit any fixes**

```bash
cd "c:/Users/steve/OneDrive/Documents/Repos/AI Talent Tracker"
git add .
git commit -m "fix: resolve type errors from final build verification"
```

---

## Remaining Collectors (Extend Later)

The following collectors follow the exact same pattern as the Semantic Scholar and GitHub collectors. They are deferred from the initial build to ship faster:

- **`company-websites.ts`** — Scrape team pages using `fetch` + HTML parsing (cheerio). Diff name lists.
- **`arxiv-papers.ts`** — Query arXiv API for recent papers by tracked authors. Check affiliation fields.

Both follow the same `getPeopleWithSource` → `fetchData` → `saveSnapshot` → `detectChanges` → `writeRawChange` pattern. Add them as needed by copying the template from Task 15/16.
