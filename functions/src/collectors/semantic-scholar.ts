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
const DELAY_MS = 3000; // Semantic Scholar rate limit: ~100 req/5min

interface AuthorResponse {
  authorId: string;
  name: string;
  affiliations?: string[];
  hIndex?: number;
  citationCount?: number;
  paperCount?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAuthor(
  authorId: string
): Promise<{ author: AuthorResponse | null; status: number }> {
  const res = await fetch(`${API_BASE}/author/${authorId}?fields=${FIELDS}`);
  if (!res.ok) return { author: null, status: res.status };
  const author = (await res.json()) as AuthorResponse;
  return { author, status: res.status };
}

export async function runSemanticScholar() {
  try {
    const people = await getPeopleWithSource('semanticScholarId');
    let succeeded = 0;
    let failed = 0;

    for (const person of people) {
      const authorId = person.sources.semanticScholarId;
      if (!authorId) continue;

      const { author, status } = await fetchAuthor(authorId);

      if (!author) {
        console.warn(
          `  Scholar: skipped ${person.name} (ID: ${authorId}) — HTTP ${status}`
        );
        failed++;
        if (status === 429) {
          console.error('  Scholar: rate limited, stopping early');
          break;
        }
        await delay(DELAY_MS);
        continue;
      }

      const currentData = {
        name: author.name,
        affiliations: author.affiliations ?? [],
        hIndex: author.hIndex,
        citationCount: author.citationCount,
        paperCount: author.paperCount,
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
      succeeded++;
      await delay(DELAY_MS);
    }

    console.log(`Scholar: ${succeeded} succeeded, ${failed} failed out of ${people.length}`);
    await updateCollectorStatus(SOURCE, failed > 0 && succeeded === 0 ? 'error' : 'success');
  } catch (error) {
    console.error('Semantic Scholar collector error:', error);
    await updateCollectorStatus(SOURCE, 'error');
  }
}

export const semanticScholarCollector = onSchedule(
  { schedule: 'every 12 hours', timeoutSeconds: 540 },
  () => runSemanticScholar()
);
