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

const SOURCE = 'x';
const db = getFirestore();
const apifyApiKey = defineSecret('APIFY_API_KEY');

export const apifyXCollector = onSchedule(
  {
    schedule: 'every 12 hours',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
  },
  async () => {
    try {
      const configSnap = await db.collection('config').doc('app').get();
      const config = configSnap.data();
      const actorId = config?.apify?.xActorId;
      if (!actorId) {
        console.warn('No X actor ID configured');
        return;
      }

      const client = new ApifyClient({ token: apifyApiKey.value() });
      const people = await getPeopleWithSource('xHandle', [
        'legendary', 'senior',
      ]);

      const handles = people.map((p) => p.sources.xHandle!.replace('@', ''));

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
      console.error('Apify X collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
  }
);
