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

const SOURCE = 'arxiv';
const API_BASE = 'https://export.arxiv.org/api/query';
const MAX_RESULTS = 5;
const DELAY_MS = 3500; // arXiv asks for 3s between requests

interface ArxivPaper {
  title: string;
  published: string;
  authors: string[];
  affiliations: string[];
  link: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : '';
}

function extractAllTags(xml: string, tag: string): string[] {
  const results: string[] = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, 'i'));
  return match ? match[1] : '';
}

function parseEntries(xml: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];
  const entryBlocks = xml.split('<entry>').slice(1);

  for (const block of entryBlocks) {
    const entry = block.split('</entry>')[0];
    const title = extractTag(entry, 'title').replace(/\s+/g, ' ');
    const published = extractTag(entry, 'published');
    const link = extractAttr(entry, 'link', 'href');

    // Extract authors and their affiliations
    const authorBlocks = entry.split('<author>').slice(1);
    const authors: string[] = [];
    const affiliations: string[] = [];
    for (const ab of authorBlocks) {
      const authorXml = ab.split('</author>')[0];
      const name = extractTag(authorXml, 'name');
      if (name) authors.push(name);
      const affs = extractAllTags(authorXml, 'arxiv:affiliation');
      for (const aff of affs) {
        if (aff && !affiliations.includes(aff)) affiliations.push(aff);
      }
    }

    papers.push({ title, published, authors, affiliations, link });
  }

  return papers;
}

async function fetchArxivPapers(
  authorName: string
): Promise<{ papers: ArxivPaper[]; ok: boolean }> {
  // arXiv search: use quotes for exact author name match
  const query = `au:"${authorName}"`;
  const url = `${API_BASE}?search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=${MAX_RESULTS}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { papers: [], ok: false };
    const xml = await res.text();
    return { papers: parseEntries(xml), ok: true };
  } catch {
    return { papers: [], ok: false };
  }
}

export async function runArxiv() {
  try {
    // arXiv uses author names, not IDs. We query people who have a Semantic Scholar ID
    // (they're researchers likely to publish) and search by name.
    const people = await getPeopleWithSource('semanticScholarId');
    let succeeded = 0;
    let failed = 0;

    for (const person of people) {
      const { papers, ok } = await fetchArxivPapers(person.name);

      if (!ok) {
        console.warn(`  arXiv: failed to fetch papers for ${person.name}`);
        failed++;
        await delay(DELAY_MS);
        continue;
      }

      const recentPapers = papers.map((p) => ({
        title: p.title,
        published: p.published,
        link: p.link,
      }));

      // Collect all unique affiliations from recent papers
      const allAffiliations = [...new Set(papers.flatMap((p) => p.affiliations))];

      const currentData: Record<string, unknown> = {
        recentPaperCount: papers.length,
        recentPapers,
        affiliationsInPapers: allAffiliations,
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
          currentData,
          ['affiliationsInPapers']
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

    console.log(`arXiv: ${succeeded} succeeded, ${failed} failed out of ${people.length}`);
    await updateCollectorStatus(SOURCE, failed > 0 && succeeded === 0 ? 'error' : 'success');
  } catch (error) {
    console.error('arXiv collector error:', error);
    await updateCollectorStatus(SOURCE, 'error');
  }
}

export const arxivCollector = onSchedule(
  { schedule: 'every 24 hours', timeoutSeconds: 540 },
  () => runArxiv()
);
