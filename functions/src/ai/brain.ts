import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import { defineSecret } from 'firebase-functions/params';

function db() {
  return getFirestore();
}
const openrouterApiKey = defineSecret('OPENROUTER_API_KEY');

interface BrainResponse {
  isRealMove: boolean;
  type: 'departure' | 'new_hire' | 'founded_startup' | 'went_academic' | 'returned' | 'role_change';
  confidence: 'confirmed' | 'high' | 'medium' | 'speculative';
  fromOrg: string | null;
  toOrg: string | null;
  summary: string;
}

export const aiBrain = onDocumentCreated(
  {
    document: 'people/{personId}/rawChanges/{changeId}',
    secrets: [openrouterApiKey],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const change = snap.data();
    const personId = event.params.personId;

    const personSnap = await db().collection('people').doc(personId).get();
    if (!personSnap.exists) return;
    const person = personSnap.data()!;

    const fiveMinAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
    const recentChanges = await db()
      .collection('people')
      .doc(personId)
      .collection('rawChanges')
      .where('processed', '==', false)
      .where('detectedAt', '>=', fiveMinAgo)
      .get();

    const signals = recentChanges.docs.map((d) => {
      const data = d.data();
      return {
        source: data.source,
        previous: data.previousValue,
        current: data.currentValue,
      };
    });

    const configSnap = await db().collection('config').doc('app').get();
    const config = configSnap.data();
    const model = config?.openrouter?.activeModel ?? 'anthropic/claude-haiku-4-5-20251001';

    const signalDescriptions = signals
      .map(
        (s) =>
          `- [${s.source}] Changed from ${JSON.stringify(s.previous)} to ${JSON.stringify(s.current)}`
      )
      .join('\n');

    const prompt = `You are an AI talent movement analyst. Evaluate whether the following changes indicate a real career move.

Person: ${person.name}, currently at ${person.currentOrg}
Tier: ${person.tier}
${person.currentTitle ? `Title: ${person.currentTitle}` : ''}

Detected changes:
${signalDescriptions}

Determine if this represents a real career move (changing companies, founding a startup, going to academia, etc.) versus noise (typo fix, title change at same company, adding a side project).

Respond with ONLY valid JSON (no markdown):
{
  "isRealMove": boolean,
  "type": "departure" | "new_hire" | "founded_startup" | "went_academic" | "returned" | "role_change",
  "confidence": "confirmed" | "high" | "medium" | "speculative",
  "fromOrg": string | null,
  "toOrg": string | null,
  "summary": "2-3 sentence summary of what happened and why it matters for the AI industry"
}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterApiKey.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status, await response.text());
        return;
      }

      const data = await response.json() as {
        choices: { message: { content: string } }[];
      };

      const content = data.choices[0]?.message?.content;
      if (!content) return;

      const result: BrainResponse = JSON.parse(content);

      if (result.isRealMove) {
        await db().collection('moveEvents').add({
          personId,
          type: result.type,
          fromOrg: result.fromOrg,
          toOrg: result.toOrg,
          confidence: result.confidence,
          signals: signals.map((s) => ({
            source: s.source,
            description: `Changed from ${JSON.stringify(s.previous)} to ${JSON.stringify(s.current)}`,
            detectedAt: change.detectedAt,
          })),
          aiSummary: result.summary,
          aiModel: model,
          status: 'pending_review',
          detectedAt: Timestamp.now(),
          publishedAt: null,
        });

        if (result.toOrg && (result.confidence === 'confirmed' || result.confidence === 'high')) {
          const updates: Record<string, unknown> = {
            currentOrg: result.toOrg,
          };
          if (result.fromOrg) {
            const previousOrgs = person.previousOrgs ?? [];
            if (!previousOrgs.includes(result.fromOrg)) {
              updates.previousOrgs = [...previousOrgs, result.fromOrg];
            }
          }
          await db().collection('people').doc(personId).update(updates);
        }
      }

      const batch = db().batch();
      for (const doc of recentChanges.docs) {
        batch.update(doc.ref, { processed: true });
      }
      await batch.commit();
    } catch (error) {
      console.error('AI Brain error:', error);
    }
  }
);
