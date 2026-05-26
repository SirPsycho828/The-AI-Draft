"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticScholarCollector = void 0;
exports.runSemanticScholar = runSemanticScholar;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const node_fetch_1 = __importDefault(require("node-fetch"));
const collector_base_1 = require("../utils/collector-base");
const SOURCE = 'semantic_scholar';
const API_BASE = 'https://api.semanticscholar.org/graph/v1';
const FIELDS = 'name,affiliations,hIndex,citationCount,paperCount';
async function fetchAuthor(authorId) {
    const res = await (0, node_fetch_1.default)(`${API_BASE}/author/${authorId}?fields=${FIELDS}`);
    if (!res.ok)
        return null;
    return res.json();
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function runSemanticScholar() {
    try {
        const people = await (0, collector_base_1.getPeopleWithSource)('semanticScholarId');
        for (const person of people) {
            const authorId = person.sources.semanticScholarId;
            const author = await fetchAuthor(authorId);
            if (!author) {
                await delay(3000);
                continue;
            }
            const currentData = {
                name: author.name,
                affiliations: author.affiliations ?? [],
                hIndex: author.hIndex,
                citationCount: author.citationCount,
                paperCount: author.paperCount,
            };
            await (0, collector_base_1.saveSnapshot)({
                personId: person.id,
                source: SOURCE,
                data: currentData,
                collectedAt: firestore_1.Timestamp.now(),
            });
            const previous = await (0, collector_base_1.getLatestSnapshot)(person.id, SOURCE);
            if (previous) {
                const changes = (0, collector_base_1.detectChanges)(previous.data, currentData, ['affiliations', 'name']);
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
            await delay(3000);
        }
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'success');
    }
    catch (error) {
        console.error('Semantic Scholar collector error:', error);
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'error');
    }
}
exports.semanticScholarCollector = (0, scheduler_1.onSchedule)({ schedule: 'every 12 hours', timeoutSeconds: 540 }, () => runSemanticScholar());
//# sourceMappingURL=semantic-scholar.js.map