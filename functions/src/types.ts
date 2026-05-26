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
