"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apifyXCollector = void 0;
exports.runX = runX;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const apify_client_1 = require("apify-client");
const collector_base_1 = require("../utils/collector-base");
const params_1 = require("firebase-functions/params");
const SOURCE = 'x';
function db() {
    return (0, firestore_1.getFirestore)();
}
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
/**
 * Scrape X profiles for specific people (targeted) or all (full scan).
 */
async function runX(personIds) {
    try {
        const configSnap = await db().collection('config').doc('app').get();
        const config = configSnap.data();
        const actorId = config?.apify?.xActorId;
        if (!actorId) {
            console.warn('No X actor ID configured');
            return;
        }
        const token = apifyApiKey.value();
        const client = new apify_client_1.ApifyClient({ token });
        let people;
        if (personIds && personIds.length > 0) {
            const allPeople = await (0, collector_base_1.getPeopleWithSource)('xHandle');
            people = allPeople.filter((p) => personIds.includes(p.id));
        }
        else {
            people = await (0, collector_base_1.getPeopleWithSource)('xHandle', [
                'legendary', 'senior',
            ]);
        }
        if (people.length === 0)
            return;
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
}
// Weekly full scan — runs every Sunday at 7 AM UTC (1h after LinkedIn)
exports.apifyXCollector = (0, scheduler_1.onSchedule)({
    schedule: 'every sunday 07:00',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
}, () => runX());
//# sourceMappingURL=apify-x.js.map