import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '../config/firebase';
import type {
  Person,
  MoveEvent,
  Suggestion,
  AppConfig,
  MoveEventStatus,
  Confidence,
  MoveType,
  Tier,
} from '../types';

// --- People ---

export function subscribePeople(callback: (people: Person[]) => void): Unsubscribe {
  const q = query(collection(db, 'people'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Person));
  });
}

export async function getPerson(id: string): Promise<Person | null> {
  const snap = await getDoc(doc(db, 'people', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Person) : null;
}

export async function getPersonBySlug(slug: string): Promise<Person | null> {
  const q = query(collection(db, 'people'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Person;
}

export async function addPerson(person: Omit<Person, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'people'), person);
  return ref.id;
}

export async function updatePerson(id: string, data: Partial<Person>): Promise<void> {
  await updateDoc(doc(db, 'people', id), data);
}

export async function deletePerson(id: string): Promise<void> {
  await deleteDoc(doc(db, 'people', id));
}

// --- Move Events ---

export interface MoveEventFilters {
  status?: MoveEventStatus;
  confidence?: Confidence;
  type?: MoveType;
  personTier?: Tier;
  company?: string;
  maxResults?: number;
}

export function subscribeMoveEvents(
  filters: MoveEventFilters,
  callback: (events: MoveEvent[]) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters.confidence) {
    constraints.push(where('confidence', '==', filters.confidence));
  }
  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }

  constraints.push(orderBy('detectedAt', 'desc'));

  if (filters.maxResults) {
    constraints.push(limit(filters.maxResults));
  }

  const q = query(collection(db, 'moveEvents'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MoveEvent));
  });
}

export async function getMoveEventsForPerson(personId: string): Promise<MoveEvent[]> {
  const q = query(
    collection(db, 'moveEvents'),
    where('personId', '==', personId),
    where('status', '==', 'published'),
    orderBy('detectedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MoveEvent);
}

export async function getRecentPublishedMoves(count: number): Promise<MoveEvent[]> {
  const q = query(
    collection(db, 'moveEvents'),
    where('status', '==', 'published'),
    orderBy('detectedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MoveEvent);
}

export async function updateMoveEvent(id: string, data: Partial<MoveEvent>): Promise<void> {
  await updateDoc(doc(db, 'moveEvents', id), data);
}

export async function publishMoveEvent(id: string, summary?: string): Promise<void> {
  const data: Record<string, unknown> = {
    status: 'published',
    publishedAt: Timestamp.now(),
  };
  if (summary !== undefined) data.aiSummary = summary;
  await updateDoc(doc(db, 'moveEvents', id), data);
}

export async function dismissMoveEvent(id: string): Promise<void> {
  await updateDoc(doc(db, 'moveEvents', id), { status: 'dismissed' });
}

// --- Suggestions ---

export function subscribeSuggestions(
  callback: (suggestions: Suggestion[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'suggestions'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Suggestion));
  });
}

export async function addSuggestion(
  suggestion: Omit<Suggestion, 'id' | 'upvotes' | 'status' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'suggestions'), {
    ...suggestion,
    upvotes: [],
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function upvoteSuggestion(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), {
    upvotes: arrayUnion(userId),
  });
}

export async function removeUpvote(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), {
    upvotes: arrayRemove(userId),
  });
}

export async function updateSuggestionStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  await updateDoc(doc(db, 'suggestions', id), { status });
}

// --- Config ---

const CONFIG_DOC = doc(db, 'config', 'app');

export function subscribeConfig(callback: (config: AppConfig | null) => void): Unsubscribe {
  return onSnapshot(CONFIG_DOC, (snap) => {
    callback(snap.exists() ? (snap.data() as AppConfig) : null);
  });
}

export async function getConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(CONFIG_DOC);
  return snap.exists() ? (snap.data() as AppConfig) : null;
}

export async function updateConfig(data: Partial<AppConfig>): Promise<void> {
  await setDoc(CONFIG_DOC, data, { merge: true });
}

// --- Callable Functions ---

const functions = getFunctions(app);

export async function triggerCollector(collectorName: string): Promise<string> {
  const fn = httpsCallable<{ collector: string }, { message: string }>(functions, 'runCollectorNow');
  const result = await fn({ collector: collectorName });
  return result.data.message;
}
