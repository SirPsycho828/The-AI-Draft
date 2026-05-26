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
    favoriteModelIds: string[];
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
