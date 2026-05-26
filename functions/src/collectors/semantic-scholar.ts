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
        await delay(3000);
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('Semantic Scholar collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
