<div align="center">

# The AI Draft

**The sports draft ticker for the AI talent wars.**

Track career moves of top AI researchers and leaders in real time — departures, new hires, startup launches, and more — powered by automated data collection and AI-driven analysis.

[![Live Demo](https://img.shields.io/badge/Live_Demo-theaidraft.com-C8F31D?style=for-the-badge)](https://theaidraft.com)

![React 19](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

</div>

---

## What This Is

The AI industry moves fast. Key researchers leave Google DeepMind, stealth startups poach entire teams from OpenAI, and new labs emerge overnight. This project tracks all of it automatically.

Seven data collectors continuously monitor LinkedIn, GitHub, Semantic Scholar, X/Twitter, arXiv, news feeds, and company team pages. When a collector detects a change — a new affiliation, a bio update, a press mention — it writes a raw signal to Firestore. An AI brain (triggered via Firestore `onCreate`) correlates signals across sources, filters noise, classifies the move type, and assigns a confidence level. Verified moves surface on a real-time dashboard.

## How It Works

```
                         ┌─────────────────────────┐
                         │     DATA COLLECTORS      │
                         │                          │
                         │  LinkedIn ──┐            │
                         │  GitHub ────┤            │
                         │  Semantic   │  Raw       │
                         │  Scholar ───┤  Signals   │
                         │  X/Twitter ─┤     │      │
                         │  arXiv ─────┤     │      │
                         │  News/RSS ──┤     │      │
                         │  Company ───┘     │      │
                         │    Sites          ▼      │
                         └──────────── Firestore ───┘
                                         │
                                    onCreate
                                         │
                              ┌──────────▼──────────┐
                              │      AI BRAIN       │
                              │                     │
                              │  Cross-reference    │
                              │  signals, filter    │
                              │  noise, classify    │
                              │  move type, assign  │
                              │  confidence, write  │
                              │  summary            │
                              └──────────┬──────────┘
                                         │
                                    MoveEvent
                                         │
                              ┌──────────▼──────────┐
                              │  ADMIN REVIEW QUEUE  │
                              │  Publish / Dismiss   │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   LIVE DASHBOARD     │
                              │   Real-time feed     │
                              │   via Firestore      │
                              │   subscriptions      │
                              └─────────────────────┘
```

## Features

<table>
<tr>
<td width="50%">

**Real-Time Dashboard**
Live feed of AI career moves with filtering by move type, confidence level, and time window. Firestore `onSnapshot` subscriptions — no polling.

</td>
<td width="50%">

**AI-Powered Classification**
An event-driven AI brain correlates signals across sources, determines move type (departure, hire, startup founded, etc.), and generates human-readable summaries with confidence scoring.

</td>
</tr>
<tr>
<td width="50%">

**7 Automated Collectors**
Each collector follows a snapshot/diff pattern — store current state, compare against previous, emit raw signals on change. Built on a shared `CollectorBase` utility.

</td>
<td width="50%">

**Admin Review Queue**
Pending moves go through human review before publishing. Admins can edit AI summaries, adjust confidence, publish, or dismiss — with full signal transparency.

</td>
</tr>
<tr>
<td width="50%">

**Person Profiles**
Individual pages with source links, tier badges (legendary/senior/notable/emerging), and a vertical timeline of all detected career moves with expandable signal details.

</td>
<td width="50%">

**Community Suggestions**
Authenticated users can suggest people to track and upvote existing suggestions. Community-driven roster expansion.

</td>
</tr>
</table>

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19, TypeScript, Vite | Type-safe SPA with fast HMR |
| Styling | Tailwind CSS v4 | Utility-first with `@theme` design tokens |
| Animation | Framer Motion | Staggered list animations, `AnimatePresence` for expand/collapse |
| Backend | Firebase Cloud Functions v2 (Node 22) | Event-driven triggers, scheduled collectors |
| Database | Cloud Firestore | Real-time subscriptions, document-level security rules |
| Auth | Firebase Auth (Google OAuth) | Custom claims for admin role |
| AI | OpenRouter API | Model-agnostic — swap models via admin settings |
| Scraping | Apify | Managed actors for LinkedIn and X/Twitter |
| APIs | Semantic Scholar, GitHub, arXiv | Direct integrations for academic and open-source signals |

## Architecture

```
src/
├── components/
│   ├── admin/          # ReviewCard, PeopleTable, PersonFormModal, ModelPicker
│   ├── common/         # ProtectedRoute, AdminRoute, Badges, Avatar, SocialIcons
│   ├── dashboard/      # ExpandableMoveCard, FilterBar, PersonRoster, StatsFooter
│   ├── layout/         # Navbar, AppLayout, AdminLayout
│   ├── person/         # PersonHeader, SourceLinks, MoveTimeline
│   └── suggestions/    # SuggestionForm, SuggestionCard
├── config/             # Firebase initialization
├── constants/          # Target companies list
├── contexts/           # AuthContext (Google OAuth + admin custom claims)
├── hooks/              # useMoveEvents, usePeople, useSuggestions, useConfig
├── pages/
│   ├── admin/          # Dashboard, Review, People, Settings, Collectors
│   ├── Dashboard.tsx   # Main feed
│   ├── Landing.tsx     # Public landing page
│   ├── PersonProfile.tsx
│   └── Suggestions.tsx
├── services/           # Firestore CRUD, OpenRouter API client
└── types/              # Shared TypeScript interfaces

functions/src/
├── ai/brain.ts         # Firestore onCreate trigger → OpenRouter classification
├── admin/              # Callable functions: set-admin, run-collector, verify-source
├── collectors/         # 7 collectors (semantic-scholar, github-bios, news-rss, etc.)
├── utils/              # CollectorBase — shared snapshot/diff utilities
└── index.ts            # All function exports
```

## Key Engineering Decisions

- **Event-driven pipeline, not batch.** Collectors write raw signals to Firestore. The AI brain fires on `onCreate` — no cron job stitching data together after the fact. Each signal is processed as it arrives.
- **Snapshot/diff collector pattern.** Every collector extends a shared base that stores the last-known state per person. On each run, it diffs current vs. previous and only emits changes. This minimizes noise and API usage.
- **Model-agnostic AI.** The brain calls OpenRouter, not a specific model. Admins can swap between Claude, GPT-4, Gemini, or Llama from a settings page — no code change required.
- **Confidence scoring, not binary classification.** Moves are tagged `confirmed`, `high`, `medium`, or `speculative` based on signal count and source quality. The dashboard respects this — users can filter by confidence.
- **Admin review as a gate.** AI-classified moves land in a review queue, not directly on the public feed. This keeps accuracy high while still automating 95% of the work.

## Data Model

```
Person
├── name, slug, photoUrl
├── currentOrg, currentTitle, previousOrgs[]
├── tier: legendary | senior | notable | emerging
├── sources: { linkedin?, github?, scholar?, x?, website? }
└── rawChanges/           ← subcollection, collector writes here
    └── {changeId}        ← triggers AI brain on create

MoveEvent
├── personId, type, fromOrg, toOrg
├── confidence: confirmed | high | medium | speculative
├── signals[]             ← evidence from collectors
├── aiSummary             ← generated explanation
└── status: pending_review | published | dismissed

AppConfig
└── openrouter model, collector schedules, target companies
```

## Getting Started

### Prerequisites

- Node.js 22+
- Firebase CLI (`npm i -g firebase-tools`)
- Firebase project on Blaze plan

### Install

```bash
npm install
cd functions && npm install && cd ..
```

### Environment

```bash
cp .env.example .env
# Fill in your Firebase config values
```

### Development

```bash
npm run dev
```

### Deploy

```bash
firebase deploy                  # Everything
firebase deploy --only hosting   # Frontend only
firebase deploy --only functions # Cloud Functions only
```

### Seed Data

```bash
npx tsx scripts/seed.ts
```

## Security

- **Firestore rules:** Public read, admin-only write, authenticated suggestions
- **Admin access:** Firebase custom claims (`isAdmin`), not role fields
- **Secrets:** API keys for OpenRouter, Apify, and GitHub stored in Firebase Secret Manager via `defineSecret()` — never in source code
- **Auth:** Google OAuth with popup flow

## License

MIT
