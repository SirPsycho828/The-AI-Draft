import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import {
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';
import type { PersonDoc } from '../types';

const SOURCE = 'company_site';
function db() {
  return getFirestore();
}

// Team/leadership pages for major AI companies
// Admins can extend this via config.companySiteUrls in Firestore
const DEFAULT_COMPANY_PAGES: Record<string, string[]> = {
  OpenAI: [
    'https://openai.com/about/',
  ],
  Anthropic: [
    'https://www.anthropic.com/company',
  ],
  'Google DeepMind': [
    'https://deepmind.google/about/',
  ],
  Meta: [
    'https://ai.meta.com/people/',
  ],
  'Mistral AI': [
    'https://mistral.ai/company/',
  ],
  Cohere: [
    'https://cohere.com/about',
  ],
  'Hugging Face': [
    'https://huggingface.co/huggingface',
  ],
};

const DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Talent-Tracker/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) {
      console.warn(`  CompanySite: HTTP ${res.status} for ${url}`);
      return null;
    }
    const html = await res.text();
    // Strip HTML tags to get plain text for name matching
    return html.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
  } catch (err) {
    console.warn(`  CompanySite: fetch failed for ${url}:`, err);
    return null;
  }
}

function findPeopleInText(
  text: string,
  people: PersonDoc[]
): { found: string[]; missing: string[] } {
  const found: string[] = [];
  const missing: string[] = [];

  for (const person of people) {
    // Check full name and last name
    const nameLower = person.name.toLowerCase();
    const textLower = text.toLowerCase();
    if (textLower.includes(nameLower)) {
      found.push(person.id);
    } else {
      // Try last name as fallback (less precise but catches partial matches)
      const lastName = person.name.split(' ').pop()?.toLowerCase();
      if (lastName && lastName.length > 3 && textLower.includes(lastName)) {
        found.push(person.id);
      } else {
        missing.push(person.id);
      }
    }
  }

  return { found, missing };
}

export async function runCompanySite() {
  try {
    // Load all tracked people
    const snap = await db().collection('people').get();
    const allPeople = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PersonDoc);

    // Load custom company URLs from config (if any)
    const configSnap = await db().collection('config').doc('app').get();
    const customUrls = configSnap.data()?.companySiteUrls as Record<string, string[]> | undefined;
    const companyPages = { ...DEFAULT_COMPANY_PAGES, ...customUrls };

    let companiesChecked = 0;
    let companiesFailed = 0;

    for (const [company, urls] of Object.entries(companyPages)) {
      // Find tracked people whose currentOrg matches this company
      const companyPeople = allPeople.filter(
        (p) => p.currentOrg.toLowerCase() === company.toLowerCase()
      );
      if (companyPeople.length === 0) continue;

      // Fetch all pages for this company and combine text
      let combinedText = '';
      for (const url of urls) {
        const text = await fetchPageText(url);
        if (text) combinedText += ' ' + text;
        await delay(DELAY_MS);
      }

      if (!combinedText) {
        console.warn(`  CompanySite: no content fetched for ${company}`);
        companiesFailed++;
        continue;
      }

      const { found, missing } = findPeopleInText(combinedText, companyPeople);

      const currentData: Record<string, unknown> = {
        company,
        urls,
        foundOnSite: found,
        missingFromSite: missing,
        checkedAt: new Date().toISOString(),
      };

      // Use company slug as the pseudo-personId for snapshots
      const companySlug = `_company_${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      await saveSnapshot({
        personId: companySlug,
        source: SOURCE,
        data: currentData,
        collectedAt: Timestamp.now(),
      });

      // Check for changes against previous scan
      const previous = await getLatestSnapshot(companySlug, SOURCE);
      if (previous) {
        const changes = detectChanges(
          previous.data as Record<string, unknown>,
          currentData,
          ['foundOnSite', 'missingFromSite']
        );

        if (changes.length > 0) {
          // Write a raw change for each person who disappeared from the site
          const prevFound = (previous.data as Record<string, unknown>).foundOnSite as string[] ?? [];
          const nowMissing = prevFound.filter((id: string) => missing.includes(id));

          for (const personId of nowMissing) {
            const person = allPeople.find((p) => p.id === personId);
            console.log(
              `  CompanySite: ${person?.name ?? personId} disappeared from ${company} team page`
            );
            await writeRawChange(personId, {
              source: SOURCE,
              previousValue: { onCompanySite: true, company },
              currentValue: { onCompanySite: false, company },
              detectedAt: Timestamp.now(),
            });
          }
        }
      }

      companiesChecked++;
    }

    console.log(
      `CompanySite: ${companiesChecked} companies checked, ${companiesFailed} failed`
    );
    await updateCollectorStatus(
      SOURCE,
      companiesFailed > 0 && companiesChecked === 0 ? 'error' : 'success'
    );
  } catch (error) {
    console.error('Company site collector error:', error);
    await updateCollectorStatus(SOURCE, 'error');
  }
}

export const companySiteCollector = onSchedule(
  { schedule: 'every 24 hours', timeoutSeconds: 540 },
  () => runCompanySite()
);
