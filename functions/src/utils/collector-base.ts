import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { PersonDoc, RawChange, SnapshotDoc } from '../types';

function db() {
  return getFirestore();
}

export async function getPeopleWithSource(
  sourceField: keyof PersonDoc['sources'],
  tiers?: string[]
): Promise<PersonDoc[]> {
  const query = db().collection('people') as FirebaseFirestore.Query;
  const snap = await query.get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PersonDoc)
    .filter((p) => {
      if (!p.sources[sourceField]) return false;
      if (tiers && !tiers.includes(p.tier)) return false;
      return true;
    });
}

export async function getLatestSnapshot(
  personId: string,
  source: string
): Promise<SnapshotDoc | null> {
  const snap = await db()
    .collection('snapshots')
    .where('personId', '==', personId)
    .where('source', '==', source)
    .orderBy('collectedAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as SnapshotDoc;
}

export async function saveSnapshot(snapshot: SnapshotDoc): Promise<void> {
  await db().collection('snapshots').add(snapshot);
}

export async function writeRawChange(
  personId: string,
  change: Omit<RawChange, 'processed'>
): Promise<void> {
  await db()
    .collection('people')
    .doc(personId)
    .collection('rawChanges')
    .add({ ...change, processed: false });
}

export async function markScanned(personId: string): Promise<void> {
  await db().collection('people').doc(personId).update({
    lastScannedAt: Timestamp.now(),
  });
}

export async function updateCollectorStatus(
  collectorName: string,
  status: 'success' | 'error'
): Promise<void> {
  await db()
    .collection('config')
    .doc('app')
    .set(
      {
        collectors: {
          [collectorName]: {
            lastRunAt: Timestamp.now(),
            lastRunStatus: status,
          },
        },
      },
      { merge: true }
    );
}

export function detectChanges(
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
  keysToWatch: string[]
): { key: string; oldVal: unknown; newVal: unknown }[] {
  const changes: { key: string; oldVal: unknown; newVal: unknown }[] = [];
  for (const key of keysToWatch) {
    const oldVal = previous[key];
    const newVal = current[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ key, oldVal, newVal });
    }
  }
  return changes;
}
