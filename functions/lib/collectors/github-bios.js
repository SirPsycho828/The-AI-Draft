"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubBiosCollector = void 0;
exports.runGithubBios = runGithubBios;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const node_fetch_1 = __importDefault(require("node-fetch"));
const collector_base_1 = require("../utils/collector-base");
const SOURCE = 'github';
async function fetchGitHubUser(username) {
    const res = await (0, node_fetch_1.default)(`https://api.github.com/users/${username}`, {
        headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'The-AI-Draft',
        },
    });
    if (!res.ok)
        return null;
    return res.json();
}
async function runGithubBios() {
    try {
        const people = await (0, collector_base_1.getPeopleWithSource)('githubUsername');
        for (const person of people) {
            const username = person.sources.githubUsername;
            const user = await fetchGitHubUser(username);
            if (!user)
                continue;
            const currentData = {
                name: user.name,
                company: user.company,
                bio: user.bio,
                blog: user.blog,
            };
            await (0, collector_base_1.saveSnapshot)({
                personId: person.id,
                source: SOURCE,
                data: currentData,
                collectedAt: firestore_1.Timestamp.now(),
            });
            const previous = await (0, collector_base_1.getLatestSnapshot)(person.id, SOURCE);
            if (previous) {
                const changes = (0, collector_base_1.detectChanges)(previous.data, currentData, ['company', 'bio']);
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
        console.error('GitHub bios collector error:', error);
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'error');
    }
}
exports.githubBiosCollector = (0, scheduler_1.onSchedule)({ schedule: 'every 12 hours', timeoutSeconds: 540 }, () => runGithubBios());
//# sourceMappingURL=github-bios.js.map