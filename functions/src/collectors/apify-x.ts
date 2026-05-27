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

const SOURCE = 'x';
function db() {
  return getFirestore();
}
const apifyApiKey = defineSecret('APIFY_API_KEY');

/**
 * Scrape X profiles for specific people (targeted) or all (full scan).
 */
export async function runX(personIds?: string[]): Promise<void> {
  try {
    const configSnap = await db().collection('config').doc('app').get();
    const config = configSnap.data();
    const actorId = config?.apify?.xActorId;
    if (!actorId) {
      console.warn('No X actor ID configured');
      return;
    }

    const token = apifyApiKey.value();
    const client = new ApifyClient({ token });

    let people: PersonDoc[];
    if (personIds && personIds.length > 0) {
      const allPeople = await getPeopleWithSource('xHandle');
      people = allPeople.filter((p) => personIds.includes(p.id));
    } else {
      people = await getPeopleWithSource('xHandle', [
        'legendary', 'senior',
      ]);
    }

    if (people.length === 0) return;

    // Validate X handle format before sending to Apify
    const xHandleRegex = /^[a-zA-Z0-9_]{1,15}$/;
    const handles = people
      .map((p) => p.sources.xHandle!.replace('@', ''))
      .filter((h) => {
        if (!xHandleRegex.test(h)) {
          console.warn(`Invalid X handle format: ${h}`);
          return false;
        }
        return true;
      });
    if (handles.length === 0) return;

    const run = await client.actor(actorId).call({
      handles,
      maxItems: handles.length,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    for (const item of items) {
      const handle = (item.username as string)?.toLowerCase();
      const person = people.find(
        (p) => p.sources.xHandle?.replace('@', '').toLowerCase() === handle
      );
      if (!person) continue;

      const currentData = {
        name: item.name,
        bio: item.description ?? item.bio,
        location: item.location,
      };

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
          ['bio', 'name']
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
    const safeMessage = error instanceof Error
      ? error.message.replace(/sk-[^\s]*/gi, '[REDACTED]').replace(/apify_api_[^\s]*/gi, '[REDACTED]')
      : 'Unknown error';
    console.error('Apify X collector error:', safeMessage);
    await updateCollectorStatus(SOURCE, 'error');
  }
}

// Weekly full scan — runs every Sunday at 7 AM UTC (1h after LinkedIn)
// Security: This is a scheduled function (onSchedule), not callable by users.
// Only Cloud Scheduler can trigger it. If converting to a callable function (onCall),
// add explicit auth + admin role checks.
export const apifyXCollector = onSchedule(
  {
    schedule: 'every sunday 07:00',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
  },
  () => runX()
);
