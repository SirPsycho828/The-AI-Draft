"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiBrain = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const node_fetch_1 = __importDefault(require("node-fetch"));
const params_1 = require("firebase-functions/params");
function db() {
    return (0, firestore_2.getFirestore)();
}
const openrouterApiKey = (0, params_1.defineSecret)('OPENROUTER_API_KEY');
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
exports.aiBrain = (0, firestore_1.onDocumentCreated)({
    document: 'people/{personId}/rawChanges/{changeId}',
    secrets: [openrouterApiKey, apifyApiKey],
}, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const change = snap.data();
    const personId = event.params.personId;
    const personSnap = await db().collection('people').doc(personId).get();
    if (!personSnap.exists)
        return;
    const person = personSnap.data();
    const fiveMinAgo = firestore_2.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
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
        .map((s) => `- [${s.source}] Changed from ${JSON.stringify(s.previous)} to ${JSON.stringify(s.current)}`)
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
        const response = await (0, node_fetch_1.default)('https://openrouter.ai/api/v1/chat/completions', {
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
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content)
            return;
        const result = JSON.parse(content);
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
                detectedAt: firestore_2.Timestamp.now(),
                publishedAt: null,
            });
            if (result.toOrg && (result.confidence === 'confirmed' || result.confidence === 'high')) {
                const updates = {
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
        // When a real move is detected from free sources, trigger targeted
        // LinkedIn/X scrapes to corroborate the signal (hybrid strategy).
        if (result.isRealMove) {
            const freeSourceSignal = signals.some((s) => ['semantic_scholar', 'github', 'news'].includes(s.source));
            if (freeSourceSignal) {
                const hasLinkedin = person.sources?.linkedinSlug;
                const hasX = person.sources?.xHandle;
                if (hasLinkedin || hasX) {
                    console.log(`Triggering targeted paid scrapes for ${person.name} (${personId})`);
                    try {
                        const { runLinkedin } = await Promise.resolve().then(() => __importStar(require('../collectors/apify-linkedin')));
                        const { runX } = await Promise.resolve().then(() => __importStar(require('../collectors/apify-x')));
                        const tasks = [];
                        if (hasLinkedin)
                            tasks.push(runLinkedin([personId]));
                        if (hasX)
                            tasks.push(runX([personId]));
                        await Promise.allSettled(tasks);
                    }
                    catch (scrapeErr) {
                        console.warn('Targeted scrape failed (non-fatal):', scrapeErr);
                    }
                }
            }
        }
        const batch = db().batch();
        for (const doc of recentChanges.docs) {
            batch.update(doc.ref, { processed: true });
        }
        await batch.commit();
    }
    catch (error) {
        console.error('AI Brain error:', error);
    }
});
//# sourceMappingURL=brain.js.map