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
import type { PersonDoc } from '../types';

const SOURCE = 'linkedin';
function db() {
  return getFirestore();
}
const apifyApiKey = defineSecret('APIFY_API_KEY');

/**
 * Scrape LinkedIn profiles for specific people (targeted) or all (full scan).
 * When personIds is provided, only those people are scraped (cost-efficient).
 */
export async function runLinkedin(personIds?: string[]): Promise<void> {
  try {
    const configSnap = await db().collection('config').doc('app').get();
    const config = configSnap.data();
    const actorId = config?.apify?.linkedinActorId;
    if (!actorId) {
      console.warn('No LinkedIn actor ID configured');
      return;
    }

    const token = apifyApiKey.value();
    const client = new ApifyClient({ token });

    let people: PersonDoc[];
    if (personIds && personIds.length > 0) {
      const allPeople = await getPeopleWithSource('linkedinSlug');
      people = allPeople.filter((p) => personIds.includes(p.id));
    } else {
      people = await getPeopleWithSource('linkedinSlug', [
        'legendary', 'senior', 'notable',
      ]);
    }

    if (people.length === 0) return;

    const queries = people.map(
      (p) => `https://www.linkedin.com/in/${p.sources.linkedinSlug}`
    );

    const run = await client.actor(actorId).call({
      profileScraperMode: 'Profile details no email ($4 per 1k)',
      queries,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`LinkedIn scraper returned ${items.length} results`);

    // Build lookup map for flexible slug matching
    const slugMap = new Map<string, PersonDoc>();
    for (const p of people) {
      slugMap.set(p.sources.linkedinSlug!.toLowerCase(), p);
    }

    for (const item of items) {
      if (item.status === 403 || item.error) {
        console.warn(`LinkedIn: error for ${item.publicIdentifier}: ${item.error}`);
        continue;
      }

      const identifier = (item.publicIdentifier as string)?.toLowerCase();
      if (!identifier) continue;

      // Try exact match, then prefix match (LinkedIn normalizes slugs,
      // e.g. "yann-lecun-0b999" → publicIdentifier "yann-lecun")
      let person = slugMap.get(identifier);
      if (!person) {
        for (const [slug, p] of slugMap) {
          if (slug.startsWith(identifier) || identifier.startsWith(slug)) {
            person = p;
            break;
          }
        }
      }
      if (!person) {
        console.warn(`LinkedIn: no person match for slug "${identifier}"`);
        continue;
      }

      // Extract current position
      const positions = item.currentPosition as Array<{ companyName?: string }> | undefined;
      const currentCompany = positions?.[0]?.companyName ?? null;

      // Extract location text
      const locationObj = item.location as { linkedinText?: string } | undefined;
      const location = locationObj?.linkedinText ?? null;

      const currentData = {
        firstName: item.firstName ?? null,
        lastName: item.lastName ?? null,
        headline: item.headline ?? null,
        about: item.about ?? null,
        company: currentCompany,
        location,
        openToWork: item.openToWork ?? false,
        followerCount: item.followerCount ?? null,
        connectionsCount: item.connectionsCount ?? null,
        photo: item.photo ?? null,
      };

      // Update photoUrl from LinkedIn profile picture
      if (currentData.photo && typeof currentData.photo === 'string') {
        await db().collection('people').doc(person.id).update({
          photoUrl: currentData.photo,
        });
      }

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
          ['company', 'headline', 'location', 'openToWork']
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

// Weekly full scan — runs every Sunday at 6 AM UTC
export const apifyLinkedinCollector = onSchedule(
  {
    schedule: 'every sunday 06:00',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
  },
  () => runLinkedin()
);
