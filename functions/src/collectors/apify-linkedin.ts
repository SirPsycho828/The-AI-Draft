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
      // Targeted scrape — only specific people
      const allPeople = await getPeopleWithSource('linkedinSlug');
      people = allPeople.filter((p) => personIds.includes(p.id));
    } else {
      // Full scan — all people with LinkedIn slugs
      people = await getPeopleWithSource('linkedinSlug', [
        'legendary', 'senior', 'notable',
      ]);
    }

    if (people.length === 0) return;

    const profileUrls = people.map(
      (p) => `https://www.linkedin.com/in/${p.sources.linkedinSlug}`
    );

    const run = await client.actor(actorId).call({
      profileUrls,
      maxItems: profileUrls.length,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    for (const item of items) {
      const linkedinSlug = (item.profileUrl as string)
        ?.split('/in/')?.[1]
        ?.replace(/\/$/, '');
      const person = people.find((p) => p.sources.linkedinSlug === linkedinSlug);
      if (!person) continue;

      const currentData = {
        headline: item.headline,
        company: item.company,
        title: item.title,
        location: item.location,
        profilePicture: item.profilePicture ?? item.profileImageUrl ?? null,
      };

      // Update photoUrl if the person doesn't have one and Apify returned a photo
      const photoUrl = currentData.profilePicture;
      if (photoUrl && typeof photoUrl === 'string') {
        const personSnap = await db().collection('people').doc(person.id).get();
        if (!personSnap.data()?.photoUrl) {
          await db().collection('people').doc(person.id).update({ photoUrl });
        }
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
          ['company', 'title', 'headline']
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
