"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apifyXCollector = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const apify_client_1 = require("apify-client");
const collector_base_1 = require("../utils/collector-base");
const params_1 = require("firebase-functions/params");
const SOURCE = 'x';
const db = (0, firestore_1.getFirestore)();
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
exports.apifyXCollector = (0, scheduler_1.onSchedule)({
    schedule: 'every 12 hours',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
}, async () => {
    try {
        const configSnap = await db.collection('config').doc('app').get();
        const config = configSnap.data();
        const actorId = config?.apify?.xActorId;
        if (!actorId) {
            console.warn('No X actor ID configured');
            return;
        }
        const client = new apify_client_1.ApifyClient({ token: apifyApiKey.value() });
        const people = await (0, collector_base_1.getPeopleWithSource)('xHandle', [
            'legendary', 'senior',
        ]);
        const handles = people.map((p) => p.sources.xHandle.replace('@', ''));
        const run = await client.actor(actorId).call({
            handles,
            maxItems: handles.length,
        });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        for (const item of items) {
            const handle = item.username?.toLowerCase();
            const person = people.find((p) => p.sources.xHandle?.replace('@', '').toLowerCase() === handle);
            if (!person)
                continue;
            const currentData = {
                name: item.name,
                bio: item.description ?? item.bio,
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
                const changes = (0, collector_base_1.detectChanges)(previous.data, currentData, ['bio', 'name']);
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
        console.error('Apify X collector error:', error);
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'error');
    }
});
//# sourceMappingURL=apify-x.js.map