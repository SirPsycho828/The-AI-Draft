"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRssCollector = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const rss_parser_1 = __importDefault(require("rss-parser"));
const collector_base_1 = require("../utils/collector-base");
const SOURCE = 'news';
const db = (0, firestore_1.getFirestore)();
const parser = new rss_parser_1.default();
const RSS_FEEDS = [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
];
const KEYWORDS = [
    'leaves', 'left', 'departs', 'departed', 'joins', 'joined',
    'hired', 'hiring', 'recruit', 'former', 'ex-',
    'co-founder', 'founded', 'startup', 'steps down',
];
function isRelevant(item) {
    const text = `${item.title} ${item.content ?? ''}`.toLowerCase();
    return KEYWORDS.some((kw) => text.includes(kw));
}
exports.newsRssCollector = (0, scheduler_1.onSchedule)({ schedule: 'every 6 hours', timeoutSeconds: 120 }, async () => {
    try {
        const relevantItems = [];
        for (const feedUrl of RSS_FEEDS) {
            try {
                const feed = await parser.parseURL(feedUrl);
                for (const item of feed.items.slice(0, 20)) {
                    const newsItem = {
                        title: item.title ?? '',
                        link: item.link ?? '',
                        pubDate: item.pubDate ?? '',
                        content: item.contentSnippet ?? item.content ?? '',
                    };
                    if (isRelevant(newsItem)) {
                        relevantItems.push(newsItem);
                    }
                }
            }
            catch (e) {
                console.warn(`Failed to parse feed ${feedUrl}:`, e);
            }
        }
        if (relevantItems.length > 0) {
            await db.collection('snapshots').add({
                personId: '_news_feed',
                source: SOURCE,
                data: { items: relevantItems },
                collectedAt: firestore_1.Timestamp.now(),
            });
        }
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'success');
    }
    catch (error) {
        console.error('News/RSS collector error:', error);
        await (0, collector_base_1.updateCollectorStatus)(SOURCE, 'error');
    }
});
//# sourceMappingURL=news-rss.js.map