<div align="center">

# The AI Draft

**Real-time career move intelligence across the AI industry.**

![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

</div>

---

## Overview

The AI Draft tracks career moves of top AI researchers and leaders across the industry — departures, new hires, startup launches, and more. It collects signals from 7 data sources, runs them through an AI brain that filters noise and classifies moves, then surfaces verified events on a real-time dashboard with confidence scores and AI-generated summaries.

Think of it as the sports draft ticker for the AI talent wars.

## Features

<table>
<tr>
<td width="50%">

**Real-Time Dashboard**
Live feed of AI talent moves with filtering by move type, confidence level, and company. Includes stats bar and skeleton loading states.

</td>
<td width="50%">

**AI-Powered Analysis**
An AI Brain correlates signals across sources, filters noise, and determines confidence levels — producing human-readable summaries of each move.

</td>
</tr>
<tr>
<td width="50%">

**7 Automated Collectors**
Semantic Scholar, GitHub bios, LinkedIn (Apify), X/Twitter (Apify), News/RSS feeds, plus extensible patterns for company sites and arXiv.

</td>
<td width="50%">

**Admin Review Queue**
Pending moves go through human review before publishing. Admins can edit AI summaries, publish, or dismiss with full signal transparency.

</td>
</tr>
<tr>
<td width="50%">

**Person Profiles**
Individual pages with source links, tier badges, and a vertical timeline of all detected career moves with expandable signal details.

</td>
<td width="50%">

**Community Suggestions**
Authenticated users can suggest people to track and upvote existing suggestions. Community-driven roster expansion.

</td>
</tr>
</table>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Firebase Cloud Functions v2 (Node 22) |
| Database | Cloud Firestore (real-time subscriptions) |
| Auth | Firebase Auth (Google sign-in) |
| AI | OpenRouter API (model-agnostic) |
| Scraping | Apify (LinkedIn, X) |
| APIs | Semantic Scholar, GitHub, arXiv |

## Architecture

```
src/
├── components/
│   ├── admin/          # ReviewCard, PeopleTable, PersonFormModal, ModelPicker, CollectorStatusCard
│   ├── common/         # ProtectedRoute, AdminRoute, MoveTypeBadge, ConfidenceBadge, TierBadge
│   ├── dashboard/      # MoveEventCard, MoveEventFeed, FilterSidebar, StatsBar
│   ├── layout/         # Navbar, AppLayout, AdminLayout
│   ├── person/         # PersonHeader, SourceLinks, MoveTimeline
│   └── suggestions/    # SuggestionForm, SuggestionCard
├── config/             # Firebase initialization
├── constants/          # Target companies list
├── contexts/           # AuthContext (Google OAuth + admin claims)
├── hooks/              # useMoveEvents, usePeople, useSuggestions, useConfig, useAuth
├── pages/
│   ├── admin/          # AdminDashboard, AdminReview, AdminPeople, AdminSettings, AdminCollectors
│   ├── Dashboard.tsx
│   ├── Landing.tsx
│   ├── PersonProfile.tsx
│   ├── SuggestPerson.tsx
│   └── Suggestions.tsx
├── services/           # Firestore CRUD, OpenRouter API
└── types/              # Shared TypeScript interfaces

functions/src/
├── ai/                 # brain.ts — Firestore trigger, OpenRouter classification
├── admin/              # set-admin.ts — callable for admin claims
├── collectors/         # semantic-scholar, github-bios, news-rss, apify-linkedin, apify-x
├── utils/              # collector-base.ts — shared snapshot/diff utilities
├── types.ts            # Server-side type definitions
└── index.ts            # All function exports

scripts/
└── seed.ts             # Seeds 10 legendary AI figures + default config
```

## Getting Started

### Prerequisites

- Node.js 22+
- Firebase CLI (`npm i -g firebase-tools`)
- Firebase project with Blaze plan (for Cloud Functions)

### Install

```bash
# Frontend dependencies
npm install

# Functions dependencies
cd functions && npm install && cd ..
```

### Environment Setup

Create a `.env` file with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Development

```bash
npm run dev
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Seed Data

```bash
npx tsx scripts/seed.ts
```

## Security

- Firestore rules enforce public read, admin-only write, authenticated suggestions
- Admin access controlled via Firebase custom claims
- Apify and OpenRouter API keys stored in Firebase Secret Manager
- Google OAuth for authentication
