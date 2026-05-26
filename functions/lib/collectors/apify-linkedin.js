"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apifyLinkedinCollector = void 0;
exports.runLinkedin = runLinkedin;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const apify_client_1 = require("apify-client");
const collector_base_1 = require("../utils/collector-base");
const params_1 = require("firebase-functions/params");
const SOURCE = 'linkedin';
function db() {
    return (0, firestore_1.getFirestore)();
}
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
/**
 * Scrape LinkedIn profiles for specific people (targeted) or all (full scan).
 * When personIds is provided, only those people are scraped (cost-efficient).
 */
async function runLinkedin(personIds) {
    try {
        const configSnap = await db().collection('config').doc('app').get();
        const config = configSnap.data();
        const actorId = config?.apify?.linkedinActorId;
        if (!actorId) {
            console.warn('No LinkedIn actor ID configured');
            return;
        }
        const token = apifyApiKey.value();
        const client = new apify_client_1.ApifyClient({ token });
        let people;
        if (personIds && personIds.length > 0) {
            // Targeted scrape — only specific people
            const allPeople = await (0, collector_base_1.getPeopleWithSource)('linkedinSlug');
            people = allPeople.filter((p) => personIds.includes(p.id));
        }
        else {
            // Full scan — all people with LinkedIn slugs
            people = await (0, collector_base_1.getPeopleWithSource)('linkedinSlug', [
                'legendary', 'senior', 'notable',
            ]);
        }
        if (people.length === 0)
            return;
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
}
// Weekly full scan — runs every Sunday at 6 AM UTC
exports.apifyLinkedinCollector = (0, scheduler_1.onSchedule)({
    schedule: 'every sunday 06:00',
    timeoutSeconds: 540,
    secrets: [apifyApiKey],
}, () => runLinkedin());
//# sourceMappingURL=apify-linkedin.js.map