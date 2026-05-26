# The AI Draft — Design Spec

## Overview

A real-time dashboard that tracks career moves of notable people across the AI industry. Monitors 50+ companies spanning research labs, AI-native products, infrastructure, and robotics. Detects moves by scanning multiple free and low-cost data sources, uses an LLM via OpenRouter to filter noise and generate rich summaries, and surfaces everything in a live feed.

Target audience: investors/VCs looking for early startup formation signals, and AI community enthusiasts following the talent wars.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Hosting:** Firebase Hosting
- **Backend:** Firebase Cloud Functions (Node.js/TypeScript)
- **Database:** Firestore (real-time listeners for live dashboard)
- **Auth:** Firebase Auth (Google sign-in), two roles: `user` and `admin`
- **AI:** OpenRouter API with admin-selectable model
- **Scraping:** Apify (LinkedIn + X/Twitter), self-hosted scrapers for company sites
- **Free APIs:** Semantic Scholar, GitHub API, arXiv API, RSS feeds

## Architecture

```
+----------------------------------------------------------+
|                     FRONTEND (React)                      |
|  Dashboard | Person Profiles | Admin | Community Suggest  |
+----------------------------+-----------------------------+
                             | Firestore real-time
+----------------------------+-----------------------------+
|                   FIRESTORE DATABASE                      |
|  people | snapshots | moveEvents | suggestions | config   |
+----------------------------+-----------------------------+
                             |
+----------------------------+-----------------------------+
|              CLOUD FUNCTIONS (Backend)                    |
|                                                           |
|  +------------------------------------------------------+|
|  |         COLLECTORS (Cron-scheduled)                   ||
|  |  Semantic Scholar | GitHub Bios | Company Websites    ||
|  |  arXiv Papers | News/RSS | Apify LinkedIn | Apify X  ||
|  +-------------------------+----------------------------+||
|                            | raw changes                 ||
|  +-------------------------v----------------------------+||
|  |         AI BRAIN (OpenRouter)                        |||
|  |  - Classify: real move vs noise                      |||
|  |  - Correlate signals across sources                  |||
|  |  - Generate rich summary                             |||
|  |  - Categorize move type                              |||
|  +-------------------------+----------------------------+||
|                            | moveEvents                  ||
|  +-------------------------v----------------------------+||
|  |         NOTIFICATIONS                                |||
|  |  Email | Webhooks | Discord                          |||
|  +------------------------------------------------------+||
|                                                           |
|  +------------------------------------------------------+|
|  |         ADMIN APIs                                    ||
|  |  OpenRouter model picker | Config | People mgmt      ||
|  +------------------------------------------------------+|
+-----------------------------------------------------------+
```

Collectors are independent Cloud Functions, each on its own cron schedule. They store snapshots, diff against previous state, and emit raw change documents. The AI Brain is a Firestore-triggered function that fires on new raw changes, calls OpenRouter, and produces structured move events. Move events land in an admin review queue before publishing.

## Data Model

### `people` collection

```typescript
{
  id: string                    // auto-generated
  name: string                  // "Andrej Karpathy"
  slug: string                  // "andrej-karpathy"
  photoUrl?: string
  currentOrg: string            // "Anthropic"
  currentTitle?: string         // "Research Scientist"
  previousOrgs: string[]        // ["OpenAI", "Tesla"]
  tier: 'legendary' | 'senior' | 'notable' | 'emerging'
  sources: {
    semanticScholarId?: string
    githubUsername?: string
    linkedinSlug?: string
    xHandle?: string
    personalSite?: string
  }
  addedBy: 'seed' | 'community' | 'auto-discovered'
  communityVotes: number
  lastScannedAt: Timestamp
  createdAt: Timestamp
}
```

### `snapshots` collection

```typescript
{
  id: string
  personId: string
  source: 'semantic_scholar' | 'github' | 'linkedin' | 'x'
        | 'company_site' | 'arxiv' | 'news'
  data: Record<string, any>     // source-specific raw data
  collectedAt: Timestamp
}
```

### `moveEvents` collection

```typescript
{
  id: string
  personId: string
  type: 'departure' | 'new_hire' | 'founded_startup'
      | 'went_academic' | 'returned' | 'role_change'
  fromOrg?: string
  toOrg?: string
  confidence: 'confirmed' | 'high' | 'medium' | 'speculative'
  signals: {
    source: string
    description: string
    detectedAt: Timestamp
  }[]
  aiSummary: string
  aiModel: string               // which OpenRouter model produced this
  status: 'pending_review' | 'published' | 'dismissed'
  detectedAt: Timestamp
  publishedAt?: Timestamp
}
```

### `suggestions` collection

```typescript
{
  id: string
  personName: string
  linkedinUrl?: string
  xHandle?: string
  reason: string
  submittedBy: string           // userId
  upvotes: string[]             // userIds
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
}
```

### `rawChanges` subcollection (on each person doc)

```typescript
// people/{personId}/rawChanges/{changeId}
{
  id: string
  source: 'semantic_scholar' | 'github' | 'linkedin' | 'x'
        | 'company_site' | 'arxiv' | 'news'
  previousValue: Record<string, any>  // relevant fields before
  currentValue: Record<string, any>   // relevant fields after
  detectedAt: Timestamp
  processed: boolean                  // true once AI Brain has handled it
}
```

### `config` collection (single doc)

```typescript
{
  openrouter: {
    activeModel: string         // "anthropic/claude-haiku-4-5"
    apiKey: string              // stored in Secret Manager, reference here
    availableModels: Model[]    // cached from OpenRouter /api/v1/models
    lastModelRefresh: Timestamp
  }
  collectors: {
    [source: string]: {
      enabled: boolean
      cronSchedule: string
      lastRunAt: Timestamp
      lastRunStatus: 'success' | 'error'
    }
  }
  apify: {
    apiKey: string              // stored in Secret Manager
    linkedinActorId: string
    xActorId: string
  }
  targetCompanies: {
    id: string
    name: string
    category: 'research_lab' | 'ai_product' | 'infrastructure' | 'robotics'
    teamPageUrls: string[]
  }[]
}
```

## Collectors

Each collector follows the same pattern:

1. Read list of tracked people with a source ID for this collector
2. Fetch current data from the source
3. Store as new snapshot in Firestore
4. Compare against previous snapshot
5. If changes detected: write a `rawChange` document to a processing subcollection
6. If no changes: update `lastScannedAt` and exit

### Collector Schedule and Costs

| Collector | Schedule | What It Does | Cost |
|-----------|----------|-------------|------|
| Semantic Scholar | Every 12h | Fetch author profiles by ID, check affiliation | Free |
| GitHub Bios | Every 12h | Fetch user profiles via API, check company/bio fields | Free |
| Company Websites | Every 24h | Scrape team/research pages, diff against previous name list | Free |
| arXiv Papers | Every 24h | Query recent papers by tracked authors, check affiliations | Free |
| News/RSS | Every 6h | Poll RSS feeds for AI talent keywords | Free |
| Apify LinkedIn | Every 48h | Scrape LinkedIn profiles, check title/company | ~$3/1K profiles |
| Apify X/Twitter | Every 12h | Scrape bios + recent posts for job-change signals | ~$0.05/1K items |

### Tier-Based Scan Frequency

To control Apify costs, lower-tier people are scanned less often:

- `legendary` + `senior`: every scan cycle
- `notable`: every other cycle
- `emerging`: weekly only

## AI Brain

### Trigger

Firestore-triggered function that fires on new `rawChange` documents. Multiple signals for the same person within a short window are batched into one LLM call.

### Input Context

For each analysis, the function pulls:
- The person's profile (name, current org, tier)
- Recent snapshots across all sources
- The detected raw changes

### Prompt Structure

```
You are an AI talent movement analyst. Evaluate whether the
following changes indicate a real career move.

Person: {name}, currently at {currentOrg}
Tier: {tier}

Detected changes:
- [LinkedIn] Title changed from "Research Scientist at OpenAI"
  to "Research Scientist at Anthropic"
- [X/Twitter] Bio now says "Building safe AI @AnthropicAI"
- [GitHub] Company field changed to "Anthropic"

Respond with JSON:
{
  "isRealMove": boolean,
  "type": "departure|new_hire|founded_startup|went_academic|returned|role_change",
  "confidence": "confirmed|high|medium|speculative",
  "fromOrg": string | null,
  "toOrg": string | null,
  "summary": "2-3 sentence summary of what happened and why it matters"
}
```

### Confidence Logic

- Multiple corroborating signals from different sources: `confirmed` or `high`
- Single strong signal (e.g., LinkedIn title change): `medium`
- Single weak signal (e.g., GitHub bio tweak): `speculative`
- Non-move noise (title change at same company, typo fix): `isRealMove: false`

### Admin Review Flow

All move events land as `pending_review`. Admin dashboard shows a review queue where each card displays the AI summary, raw signals, and confidence score. Admin can:
- **Publish**: goes live on the dashboard
- **Edit & Publish**: tweak the summary before publishing
- **Dismiss**: mark as false positive

## Frontend

### Page Structure

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/dashboard` | Public | Main feed of published move events |
| `/person/:slug` | Public | Person profile with move timeline |
| `/suggest` | Auth (user) | Community suggestion form |
| `/suggestions` | Auth (user) | Browse and upvote suggestions |
| `/admin` | Auth (admin) | Admin panel |
| `/admin/people` | Auth (admin) | Manage watchlist |
| `/admin/review` | Auth (admin) | Review pending move events |
| `/admin/settings` | Auth (admin) | OpenRouter model picker, collector config |
| `/admin/collectors` | Auth (admin) | Collector status and logs |

### Dashboard Layout

The core screen. A reverse-chronological timeline of published move events.

- **Filter sidebar**: company, move type, confidence level, person tier
- **Move event cards**: color-coded by type (departure=red, new hire=green, startup=purple, etc.), showing person name, from/to org, confidence badge, AI summary excerpt, signal count, time ago
- **Stats bar**: total people tracked, moves this week, most active company

### Person Profile Page

- Photo, name, current org, tier badge
- Move timeline: full chronological history of detected moves
- Source links: LinkedIn, GitHub, X, Scholar, personal site
- Signal log: raw signals that triggered each move event
- Related people: others who moved to/from the same orgs around the same time

### Community Suggestions

- **Submit form** (`/suggest`): person name, known links (LinkedIn, X, GitHub), reason to track
- **Browse page** (`/suggestions`): pending suggestions sorted by upvotes, logged-in users can upvote
- Suggestions above an upvote threshold get flagged for admin review

### Admin Panel

**Review Queue** (`/admin/review`):
- Cards with AI summary, raw signals, confidence
- Actions: Publish / Edit & Publish / Dismiss

**Settings** (`/admin/settings`):
- OpenRouter config: API key field, "Refresh Models" button (calls OpenRouter `/api/v1/models`), dropdown to select active model with pricing info displayed
- Collector toggles: enable/disable each collector, adjust schedules
- Apify config: API key, actor IDs

**People Management** (`/admin/people`):
- Searchable/filterable table of all tracked people
- Add/edit/remove people manually
- Bulk import via CSV
- Approve/reject community suggestions inline

### Auth

- Firebase Auth with Google sign-in
- Two roles: `user` (browse, suggest, upvote) and `admin` (full access)
- Dashboard and person profiles are public (no auth required)
- Community features (suggest, upvote) require user auth
- Admin pages require admin role
- Admin role assigned via Firebase custom claims (set manually via CLI or a one-time setup script)

## Watchlist Seeding Strategy

### Initial Seed

**Legendary (~30-50 people, manual):**
Hand-picked industry icons with full source links. Names like Karpathy, Sutskever, the Amodei siblings, Hassabis, LeCun, etc.

**Senior (~100-200 people, semi-automated):**
- Query Semantic Scholar for top-cited authors affiliated with target labs (last 3 years)
- Scrape team/research pages from target companies
- Cross-reference and deduplicate
- Manual review pass to verify tier and source links

**Notable + Emerging (~200-500 people, automated):**
- Remaining authors on papers from target labs at top venues (NeurIPS, ICML, ICLR, ACL)
- GitHub contributors to major lab repos
- Auto-assigned `notable` or `emerging` based on citation thresholds

**Total seed target: 300-700 people**

### Ongoing Discovery

| Method | How It Works | Frequency |
|--------|-------------|-----------|
| Paper scanning | New papers from target labs, extract new author names not in DB, auto-add as `emerging` | Weekly |
| Team page diffing | Company website collector detects a new name on a team page, auto-add | Daily |
| Community suggestions | Users nominate people, upvote threshold, admin review | Ongoing |
| Move-event adjacency | When someone moves TO a target lab, they get auto-added to the watchlist | On each move |

## Target Companies

Admin-configurable list, starting with ~50+ companies across four categories:

**Research Labs:**
OpenAI, Anthropic, Google DeepMind, Meta FAIR, xAI, Mistral, Cohere, AI2, Microsoft Research, Apple ML Research, NVIDIA Research

**AI-Native Products:**
Perplexity, Cursor, Lovable, Bolt, Replit, Vercel (v0), Midjourney, Runway, ElevenLabs, Stability AI, Character.ai, Inflection, Adept, Harvey, Glean, Sierra

**Infrastructure / Foundation:**
Hugging Face, Scale AI, Weights & Biases, LangChain, Databricks (Mosaic), Together AI, Fireworks AI, Groq, Cerebras, Modal

**Frontier Robotics / Embodied AI:**
Figure, 1X, Physical Intelligence, Boston Dynamics, Tesla (Optimus)

## Notifications (v2)

Notifications are shown in the architecture diagram but deferred to v2. The v1 product is dashboard-first — users come to the dashboard to see moves. Future notification channels:

- **Email digests**: daily or weekly summary of new moves matching user preferences
- **Discord/Slack webhooks**: post to a channel when high-confidence moves are published
- **Browser push notifications**: for logged-in users watching specific people or companies

The `moveEvents` data model already supports this — notifications layer reads published events and dispatches to configured channels. No data model changes needed when v2 lands.

## Cost Estimates (Monthly)

| Item | Estimate |
|------|----------|
| Firebase (Firestore, Functions, Hosting) | Free tier / ~$5-25 at scale |
| Apify LinkedIn (~500 profiles every 48h) | ~$20-50/mo |
| Apify X/Twitter (~500 bios every 12h) | ~$5-10/mo |
| OpenRouter LLM calls (~100-300 analyses/mo) | ~$1-5/mo (Haiku-class) |
| Semantic Scholar, GitHub, arXiv, RSS | Free |
| **Total** | **~$25-90/mo** |

## Open Questions

None — all decisions have been made during brainstorming. Ready for implementation planning.
