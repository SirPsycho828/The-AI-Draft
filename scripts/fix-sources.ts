import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ projectId: 'the-ai-draft' });
const db = getFirestore();

// All values verified via web search (May 2026)
const FIXES: Record<string, Record<string, unknown>> = {
  // --- Corrupted data fixes ---
  'mira-murati': {
    'sources.linkedinSlug': 'mira-murati-4b39a066', // was 'maborramurati'
  },
  'jensen-huang': {
    'sources.linkedinSlug': 'jenhsunhuang', // was 'jensenhhuang' (double h)
  },
  'demis-hassabis': {
    'sources.xHandle': '@demishassabis', // was '@demaborshassabis'
  },
  'niki-parmar': {
    'sources.semanticScholarId': '3877127', // was '26aborss8832'
    'sources.linkedinSlug': 'nikiparmar',
  },
  'clement-delangue': {
    'sources.githubUsername': FieldValue.delete(), // was 'claborement' — no public GitHub found
  },
  'liane-lovitt': {
    'sources.linkedinSlug': 'lianelovitt', // was 'liane-lovitt'
  },

  // --- Missing LinkedIn slugs ---
  'dario-amodei': {
    'sources.linkedinSlug': 'dario-amodei-3934934',
  },
  'daniela-amodei': {
    'sources.linkedinSlug': 'daniela-amodei-790bb22a',
  },
  'ilya-sutskever': {
    'sources.linkedinSlug': 'ilya-sutskever',
  },
  'greg-brockman': {
    'sources.linkedinSlug': 'thegdb',
  },
  'yann-lecun': {
    'sources.linkedinSlug': 'yann-lecun-0b999',
  },
  'noam-shazeer': {
    'sources.linkedinSlug': 'noam-shazeer-3b27288',
  },
  'emad-mostaque': {
    'sources.linkedinSlug': 'emostaque',
  },
  'chris-olah': {
    'sources.linkedinSlug': 'christopher-olah-b574414a',
  },
  'ashish-vaswani': {
    'sources.linkedinSlug': 'ashish-vaswani-99892181',
  },
  'jason-wei': {
    'sources.linkedinSlug': 'jason-wei-5a7323b0',
  },
  'sander-dieleman': {
    'sources.linkedinSlug': 'sanderdieleman',
  },
  'tri-dao': {
    'sources.linkedinSlug': 'tri-dao-71544155',
  },
};

async function fixSources() {
  const snap = await db.collection('people').get();
  let updated = 0;

  for (const doc of snap.docs) {
    const slug = doc.data().slug as string;
    const fixes = FIXES[slug];
    if (!fixes) continue;

    await doc.ref.update(fixes);
    console.log(`  Fixed ${doc.data().name} (${slug})`);
    updated++;
  }

  console.log(`\nDone: ${updated} people updated`);
}

fixSources().catch(console.error);
