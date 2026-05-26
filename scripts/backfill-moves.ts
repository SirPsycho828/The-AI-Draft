import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp({ projectId: 'the-ai-draft' });
const db = getFirestore();

interface HistoricalMove {
  personSlug: string;
  type: 'departure' | 'new_hire' | 'founded_startup' | 'went_academic' | 'returned' | 'role_change';
  fromOrg: string | null;
  toOrg: string | null;
  confidence: 'confirmed' | 'high';
  summary: string;
  dateApprox: string; // YYYY-MM-DD
}

const MOVES: HistoricalMove[] = [
  // --- Andrej Karpathy ---
  { personSlug: 'andrej-karpathy', type: 'departure', fromOrg: 'Tesla', toOrg: null, confidence: 'confirmed', summary: 'Andrej Karpathy departed Tesla after leading the Autopilot AI team since 2017. His exit marked a significant loss for Tesla\'s self-driving efforts.', dateApprox: '2022-07-13' },
  { personSlug: 'andrej-karpathy', type: 'returned', fromOrg: null, toOrg: 'OpenAI', confidence: 'confirmed', summary: 'Karpathy returned to OpenAI where he was a founding member, rejoining to work on frontier AI research and education initiatives.', dateApprox: '2023-02-01' },
  { personSlug: 'andrej-karpathy', type: 'departure', fromOrg: 'OpenAI', toOrg: null, confidence: 'confirmed', summary: 'Karpathy left OpenAI for the second time, citing a desire to work on personal AI education projects. His departure underscored the intense competition for top AI talent.', dateApprox: '2024-02-13' },
  { personSlug: 'andrej-karpathy', type: 'founded_startup', fromOrg: null, toOrg: 'Eureka Labs', confidence: 'confirmed', summary: 'Karpathy announced Eureka Labs, an AI-native education company focused on creating the ideal AI-assisted learning experience. The launch drew significant attention given his reputation as an AI educator.', dateApprox: '2024-07-16' },

  // --- Ilya Sutskever ---
  { personSlug: 'ilya-sutskever', type: 'departure', fromOrg: 'OpenAI', toOrg: null, confidence: 'confirmed', summary: 'Ilya Sutskever, OpenAI co-founder and Chief Scientist, departed after internal disagreements about AI safety direction. His exit followed the tumultuous board crisis of November 2023.', dateApprox: '2024-05-14' },
  { personSlug: 'ilya-sutskever', type: 'founded_startup', fromOrg: null, toOrg: 'Safe Superintelligence Inc', confidence: 'confirmed', summary: 'Sutskever co-founded Safe Superintelligence Inc (SSI) with Daniel Gross and Daniel Levy, a company singularly focused on building safe superintelligent AI. SSI raised $1B before building any product.', dateApprox: '2024-06-19' },

  // --- Mira Murati ---
  { personSlug: 'mira-murati', type: 'departure', fromOrg: 'OpenAI', toOrg: null, confidence: 'confirmed', summary: 'Mira Murati stepped down as CTO of OpenAI, one of three senior leaders to depart simultaneously. She had been a key figure in launching ChatGPT and GPT-4.', dateApprox: '2024-09-25' },
  { personSlug: 'mira-murati', type: 'founded_startup', fromOrg: null, toOrg: 'Thinking Machines Lab', confidence: 'confirmed', summary: 'Murati founded Thinking Machines Lab, an AI research startup. The company reportedly attracted massive investor interest based on her track record at OpenAI.', dateApprox: '2025-01-30' },

  // --- Jan Leike ---
  { personSlug: 'jan-leike', type: 'departure', fromOrg: 'OpenAI', toOrg: null, confidence: 'confirmed', summary: 'Jan Leike resigned as co-lead of OpenAI\'s Superalignment team, publicly criticizing the company for not prioritizing AI safety sufficiently. His departure was a major blow to OpenAI\'s safety credibility.', dateApprox: '2024-05-15' },
  { personSlug: 'jan-leike', type: 'new_hire', fromOrg: null, toOrg: 'Anthropic', confidence: 'confirmed', summary: 'Leike joined Anthropic to lead alignment science, a significant hire that reinforced Anthropic\'s positioning as the safety-focused frontier lab.', dateApprox: '2024-05-28' },

  // --- John Schulman ---
  { personSlug: 'john-schulman', type: 'departure', fromOrg: 'OpenAI', toOrg: null, confidence: 'confirmed', summary: 'John Schulman, OpenAI co-founder and key architect of RLHF and PPO, left the company he helped build. His departure was part of a broader executive exodus.', dateApprox: '2024-08-05' },
  { personSlug: 'john-schulman', type: 'new_hire', fromOrg: null, toOrg: 'Anthropic', confidence: 'confirmed', summary: 'Schulman joined Anthropic, bringing his deep reinforcement learning expertise. This was seen as a major talent acquisition in the AI alignment space.', dateApprox: '2024-08-06' },

  // --- Noam Shazeer ---
  { personSlug: 'noam-shazeer', type: 'founded_startup', fromOrg: 'Google', toOrg: 'Character.AI', confidence: 'confirmed', summary: 'Noam Shazeer, a key Transformer paper co-author at Google, left to co-found Character.AI, taking his pioneering expertise in large language models to build conversational AI characters.', dateApprox: '2021-11-01' },
  { personSlug: 'noam-shazeer', type: 'returned', fromOrg: 'Character.AI', toOrg: 'Google DeepMind', confidence: 'confirmed', summary: 'In a blockbuster acqui-hire, Google paid $2.7B to bring Shazeer back. The deal highlighted the extraordinary premium placed on elite AI talent.', dateApprox: '2024-08-02' },

  // --- Dario Amodei ---
  { personSlug: 'dario-amodei', type: 'founded_startup', fromOrg: 'OpenAI', toOrg: 'Anthropic', confidence: 'confirmed', summary: 'Dario Amodei, former VP of Research at OpenAI, co-founded Anthropic with his sister Daniela and several other OpenAI researchers, citing concerns about AI safety and governance.', dateApprox: '2021-01-28' },

  // --- Daniela Amodei ---
  { personSlug: 'daniela-amodei', type: 'founded_startup', fromOrg: 'OpenAI', toOrg: 'Anthropic', confidence: 'confirmed', summary: 'Daniela Amodei co-founded Anthropic alongside her brother Dario, leaving her role as VP of Operations at OpenAI to become President of the new safety-focused AI lab.', dateApprox: '2021-01-28' },

  // --- Emad Mostaque ---
  { personSlug: 'emad-mostaque', type: 'departure', fromOrg: 'Stability AI', toOrg: null, confidence: 'confirmed', summary: 'Emad Mostaque resigned as CEO of Stability AI amid mounting financial pressures, governance concerns, and questions about the company\'s path to profitability.', dateApprox: '2024-03-23' },

  // --- Arthur Mensch ---
  { personSlug: 'arthur-mensch', type: 'founded_startup', fromOrg: 'Google DeepMind', toOrg: 'Mistral AI', confidence: 'confirmed', summary: 'Arthur Mensch left Google DeepMind to co-found Mistral AI in Paris, quickly raising over €100M and positioning the startup as Europe\'s leading AI champion.', dateApprox: '2023-04-01' },

  // --- Ashish Vaswani ---
  { personSlug: 'ashish-vaswani', type: 'founded_startup', fromOrg: 'Google Brain', toOrg: 'Essential AI', confidence: 'confirmed', summary: 'Ashish Vaswani, first author of the groundbreaking "Attention Is All You Need" paper, co-founded Essential AI to build AI-powered enterprise solutions.', dateApprox: '2023-02-01' },

  // --- Jason Wei ---
  { personSlug: 'jason-wei', type: 'new_hire', fromOrg: 'Google Brain', toOrg: 'OpenAI', confidence: 'confirmed', summary: 'Jason Wei, known for his influential work on chain-of-thought prompting and scaling laws at Google, joined OpenAI\'s research team.', dateApprox: '2023-08-01' },

  // --- Tri Dao ---
  { personSlug: 'tri-dao', type: 'new_hire', fromOrg: 'Stanford', toOrg: 'Together AI', confidence: 'confirmed', summary: 'Tri Dao, inventor of FlashAttention, joined Together AI as Chief Scientist while maintaining his Stanford affiliation. FlashAttention became a standard component in modern LLM training.', dateApprox: '2023-06-01' },
];

async function backfill() {
  console.log('Backfilling historical moves...\n');

  // Build slug → id map
  const peopleSnap = await db.collection('people').get();
  const slugMap = new Map<string, string>();
  for (const doc of peopleSnap.docs) {
    slugMap.set(doc.data().slug, doc.id);
  }

  let added = 0;
  for (const move of MOVES) {
    const personId = slugMap.get(move.personSlug);
    if (!personId) {
      console.log(`  SKIP: ${move.personSlug} — not found in people collection`);
      continue;
    }

    const detectedAt = Timestamp.fromDate(new Date(move.dateApprox));

    await db.collection('moveEvents').add({
      personId,
      type: move.type,
      fromOrg: move.fromOrg,
      toOrg: move.toOrg,
      confidence: move.confidence,
      signals: [{ source: 'backfill', description: 'Historical move backfilled from public records', detectedAt }],
      aiSummary: move.summary,
      aiModel: 'backfill',
      status: 'published',
      detectedAt,
      publishedAt: Timestamp.now(),
    });

    console.log(`  ADD: ${move.personSlug} — ${move.type} ${move.fromOrg ?? '?'} → ${move.toOrg ?? '?'} (${move.dateApprox})`);
    added++;
  }

  console.log(`\nDone! Added ${added} historical move events.`);
}

backfill().catch(console.error);
