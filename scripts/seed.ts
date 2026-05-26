import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

interface SeedPerson {
  name: string;
  currentOrg: string;
  currentTitle?: string;
  tier: 'legendary' | 'senior' | 'notable' | 'emerging';
  previousOrgs?: string[];
  sources?: {
    semanticScholarId?: string;
    githubUsername?: string;
    linkedinSlug?: string;
    xHandle?: string;
  };
}

const LEGENDARY: SeedPerson[] = [
  { name: 'Andrej Karpathy', currentOrg: 'Anthropic', tier: 'legendary', previousOrgs: ['OpenAI', 'Tesla'], sources: { githubUsername: 'karpathy', xHandle: '@karpathy' } },
  { name: 'Ilya Sutskever', currentOrg: 'SSI', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@iaborstever' } },
  { name: 'Dario Amodei', currentOrg: 'Anthropic', currentTitle: 'CEO', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@DarioAmodei' } },
  { name: 'Daniela Amodei', currentOrg: 'Anthropic', currentTitle: 'President', tier: 'legendary', previousOrgs: ['OpenAI'] },
  { name: 'Demis Hassabis', currentOrg: 'Google DeepMind', currentTitle: 'CEO', tier: 'legendary', sources: { xHandle: '@demaborshassabis' } },
  { name: 'Yann LeCun', currentOrg: 'Meta FAIR', currentTitle: 'Chief AI Scientist', tier: 'legendary', sources: { xHandle: '@ylecun', githubUsername: 'ylecun' } },
  { name: 'Sam Altman', currentOrg: 'OpenAI', currentTitle: 'CEO', tier: 'legendary', sources: { xHandle: '@sama' } },
  { name: 'Mira Murati', currentOrg: 'Independent', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@maborramurati' } },
  { name: 'Greg Brockman', currentOrg: 'OpenAI', currentTitle: 'President', tier: 'legendary', sources: { githubUsername: 'gdb', xHandle: '@gabordb' } },
  { name: 'Jan Leike', currentOrg: 'Anthropic', currentTitle: 'Alignment Science Lead', tier: 'legendary', previousOrgs: ['OpenAI'] },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('Seeding The AI Draft...\n');

  const allPeople = [...LEGENDARY];

  for (const person of allPeople) {
    const slug = slugify(person.name);

    const existing = await db.collection('people').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) {
      console.log(`  SKIP: ${person.name} (already exists)`);
      continue;
    }

    await db.collection('people').add({
      name: person.name,
      slug,
      currentOrg: person.currentOrg,
      currentTitle: person.currentTitle ?? null,
      previousOrgs: person.previousOrgs ?? [],
      tier: person.tier,
      sources: person.sources ?? {},
      addedBy: 'seed',
      communityVotes: 0,
      lastScannedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    console.log(`  ADD: ${person.name} (${person.tier}) — ${person.currentOrg}`);
  }

  const configRef = db.collection('config').doc('app');
  const configSnap = await configRef.get();
  if (!configSnap.exists) {
    await configRef.set({
      openrouter: {
        activeModel: 'anthropic/claude-haiku-4-5-20251001',
        availableModels: [],
        lastModelRefresh: null,
      },
      collectors: {
        semantic_scholar: { enabled: true, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
        github: { enabled: true, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
        company_site: { enabled: true, cronSchedule: 'every 24 hours', lastRunAt: null, lastRunStatus: null },
        arxiv: { enabled: true, cronSchedule: 'every 24 hours', lastRunAt: null, lastRunStatus: null },
        news: { enabled: true, cronSchedule: 'every 6 hours', lastRunAt: null, lastRunStatus: null },
        linkedin: { enabled: false, cronSchedule: 'every 48 hours', lastRunAt: null, lastRunStatus: null },
        x: { enabled: false, cronSchedule: 'every 12 hours', lastRunAt: null, lastRunStatus: null },
      },
      apify: {
        linkedinActorId: '',
        xActorId: '',
      },
      targetCompanies: [],
    });
    console.log('\n  Config document created with defaults');
  }

  console.log(`\nDone! Seeded ${allPeople.length} people.`);
}

seed().catch(console.error);
