"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apifyLinkedinCollector = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const apify_client_1 = require("apify-client");
const collector_base_1 = require("../utils/collector-base");
const params_1 = require("firebase-functions/params");
const SOURCE = 'linkedin';
const db = (0, firestore_1.getFirestore)();
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
exports.apifyLinkedinCollector = (0, scheduler_1.onSchedule)({
    schedule: 'every 48 hours',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
}, async () => {
    try {
        const configSnap = await db.collection('config').doc('app').get();
        const config = configSnap.data();
        const actorId = config?.apify?.linkedinActorId;
        if (!actorId) {
            console.warn('No LinkedIn actor ID configured');
            return;
        }
        const client = new apify_client_1.ApifyClient({ token: apifyApiKey.value() });
        const people = await (0, collector_base_1.getPeopleWithSource)('linkedinSlug', [
            'legendary', 'senior', 'notable',
        ]);
        const profileUrls = people.map((p) => `https://www.linkedin.com/in/${p.sources.linkedinSlug}`);
        const run = await client.actor(actorId).call({
            profileUrls,
            maxItems: profileUrls.length,
        });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        for (const item of items) {
            const linkedinSlug = item.profileUrl
                ?.split('/in/')?.[1]
                ?.replace(/\/$/, '');
            const person = people.find((p) => p.sources.linkedinSlug === linkedinSlug);
            if (!person)
                continue;
            const currentData = {
                headline: item.headline,
                company: item.company,
                title: item.title,
                location: item.location,
            };
            await (0, collector_base_1.saveSnapshot)({
                personId: person.id,
                source: SOURCE,
                data: currentData,
                collectedAt: firestore_1.Timestamp.now(),
            });
            const previous = await (0, collector_base_1.getLatestSnapshot)(person.id, SOURCE);
            if (previous) {
                const changes = (0, collector_base_1.detectChanges)(previous.data, currentData, ['company', 'title', 'headline']);
                if (changes.length > 0) {
                    await (0, collector_base_1.writeRawChange)(person.id, {
                        source: SOURCE,
                        previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
                        currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
                        detectedAt: firestore_1.Timestamp.now(),
                    });
                }
            }
            await (0, collector_base_1.markScanned)(person.id);
        }
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'success');
    }
    catch (error) {
        console.error('Apify LinkedIn collector error:', error);
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'error');
    }
});
//# sourceMappingURL=apify-linkedin.js.map