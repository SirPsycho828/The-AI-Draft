import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp({ projectId: 'the-ai-draft' });
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
    personalSite?: string;
  };
}

// --- Legendary Tier: Industry-defining figures ---
const LEGENDARY: SeedPerson[] = [
  { name: 'Sam Altman', currentOrg: 'OpenAI', currentTitle: 'CEO', tier: 'legendary', previousOrgs: ['Y Combinator', 'Loopt'], sources: { xHandle: '@sama', linkedinSlug: 'samaltman' } },
  { name: 'Dario Amodei', currentOrg: 'Anthropic', currentTitle: 'CEO', tier: 'legendary', previousOrgs: ['OpenAI'], sources: { xHandle: '@DarioAmodei' } },
  { name: 'Daniela Amodei', currentOrg: 'Anthropic', currentTitle: 'President', tier: 'legendary', previousOrgs: ['OpenAI'] },
  { name: 'Demis Hassabis', currentOrg: 'Google DeepMind', currentTitle: 'CEO', tier: 'legendary', sources: { xHandle: '@demaborshassabis', linkedinSlug: 'demishassabis' } },
  { name: 'Ilya Sutskever', currentOrg: 'Safe Superintelligence Inc', currentTitle: 'Co-founder & Chief Scientist', tier: 'legendary', previousOrgs: ['OpenAI', 'Google Brain'], sources: { semanticScholarId: '1857528' } },
  { name: 'Yann LeCun', currentOrg: 'Meta', currentTitle: 'VP & Chief AI Scientist', tier: 'legendary', previousOrgs: ['NYU', 'AT&T Bell Labs'], sources: { xHandle: '@ylecun', githubUsername: 'ylecun', semanticScholarId: '1688882', personalSite: 'http://yann.lecun.com' } },
  { name: 'Andrej Karpathy', currentOrg: 'Eureka Labs', currentTitle: 'Founder', tier: 'legendary', previousOrgs: ['OpenAI', 'Tesla'], sources: { githubUsername: 'karpathy', xHandle: '@karpathy', semanticScholarId: '2503370', linkedinSlug: 'andrej-karpathy-9a650716' } },
  { name: 'Mira Murati', currentOrg: 'Thinking Machines Lab', currentTitle: 'CEO & Co-founder', tier: 'legendary', previousOrgs: ['OpenAI', 'Tesla', 'Leap Motion'], sources: { linkedinSlug: 'maborramurati' } },
  { name: 'Greg Brockman', currentOrg: 'OpenAI', currentTitle: 'President', tier: 'legendary', sources: { githubUsername: 'gdb', xHandle: '@gdb' } },
  { name: 'Jensen Huang', currentOrg: 'NVIDIA', currentTitle: 'CEO & Founder', tier: 'legendary', sources: { linkedinSlug: 'jensenhhuang' } },
];

// --- Senior Tier: Key leaders & researchers ---
const SENIOR: SeedPerson[] = [
  { name: 'Jan Leike', currentOrg: 'Anthropic', currentTitle: 'Head of Alignment Science', tier: 'senior', previousOrgs: ['OpenAI'], sources: { xHandle: '@janleike', semanticScholarId: '3362919' } },
  { name: 'John Schulman', currentOrg: 'Anthropic', tier: 'senior', previousOrgs: ['OpenAI'], sources: { githubUsername: 'joschu', semanticScholarId: '38909097' } },
  { name: 'Noam Shazeer', currentOrg: 'Google DeepMind', tier: 'senior', previousOrgs: ['Character.AI', 'Google'], sources: { semanticScholarId: '1727817' } },
  { name: 'Aidan Gomez', currentOrg: 'Cohere', currentTitle: 'CEO & Co-founder', tier: 'senior', sources: { xHandle: '@aidangomez', linkedinSlug: 'aidangomez', semanticScholarId: '40648699' } },
  { name: 'Arthur Mensch', currentOrg: 'Mistral AI', currentTitle: 'CEO & Co-founder', tier: 'senior', previousOrgs: ['Google DeepMind'], sources: { xHandle: '@arthurmensch', linkedinSlug: 'arthur-mensch-289238113' } },
  { name: 'Clement Delangue', currentOrg: 'Hugging Face', currentTitle: 'CEO & Co-founder', tier: 'senior', sources: { xHandle: '@ClementDelangue', githubUsername: 'claborement', linkedinSlug: 'clementdelangue' } },
  { name: 'Emad Mostaque', currentOrg: 'Independent', tier: 'senior', previousOrgs: ['Stability AI'], sources: { xHandle: '@EMostaque' } },
  { name: 'Chris Olah', currentOrg: 'Anthropic', currentTitle: 'Co-founder', tier: 'senior', sources: { githubUsername: 'colah', personalSite: 'https://colah.github.io' } },
  { name: 'Liane Lovitt', currentOrg: 'Anthropic', tier: 'senior', sources: { linkedinSlug: 'liane-lovitt' } },
  { name: 'David Silver', currentOrg: 'Google DeepMind', currentTitle: 'Principal Research Scientist', tier: 'senior', previousOrgs: ['University of Alberta'], sources: { semanticScholarId: '1710012' } },
];

// --- Notable Tier: Rising stars & key contributors ---
const NOTABLE: SeedPerson[] = [
  { name: 'Ashish Vaswani', currentOrg: 'Essential AI', currentTitle: 'Co-founder', tier: 'notable', previousOrgs: ['Google Brain'], sources: { semanticScholarId: '40348417' } },
  { name: 'Niki Parmar', currentOrg: 'Essential AI', currentTitle: 'Co-founder', tier: 'notable', previousOrgs: ['Google Brain'], sources: { semanticScholarId: '26aborss8832' } },
  { name: 'Jason Wei', currentOrg: 'OpenAI', tier: 'notable', previousOrgs: ['Google Brain'], sources: { xHandle: '@_jasonwei', githubUsername: 'jasonweiyi', semanticScholarId: '145486781' } },
  { name: 'Sander Dieleman', currentOrg: 'Google DeepMind', tier: 'notable', sources: { githubUsername: 'benanne', personalSite: 'https://sander.ai' } },
  { name: 'Tri Dao', currentOrg: 'Together AI', currentTitle: 'Chief Scientist', tier: 'notable', previousOrgs: ['Stanford'], sources: { githubUsername: 'tridao', semanticScholarId: '46234488' } },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('Seeding The AI Draft...\n');

  const allPeople = [...LEGENDARY, ...SENIOR, ...NOTABLE];

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
