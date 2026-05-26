import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import Parser from 'rss-parser';
import {
  updateCollectorStatus,
} from '../utils/collector-base';

const SOURCE = 'news';
function db() {
  return getFirestore();
}
const parser = new Parser();

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
];

const KEYWORDS = [
  'leaves', 'left', 'departs', 'departed', 'joins', 'joined',
  'hired', 'hiring', 'recruit', 'former', 'ex-',
  'co-founder', 'founded', 'startup', 'steps down',
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
}

function isRelevant(item: NewsItem): boolean {
  const text = `${item.title} ${item.content ?? ''}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw));
}

export async function runNewsRss() {
  try {
      const relevantItems: NewsItem[] = [];

      for (const feedUrl of RSS_FEEDS) {
        try {
          const feed = await parser.parseURL(feedUrl);
          for (const item of feed.items.slice(0, 20)) {
            const newsItem: NewsItem = {
              title: item.title ?? '',
              link: item.link ?? '',
              pubDate: item.pubDate ?? '',
              content: item.contentSnippet ?? item.content ?? '',
            };
            if (isRelevant(newsItem)) {
              relevantItems.push(newsItem);
            }
          }
        } catch (e) {
          console.warn(`Failed to parse feed ${feedUrl}:`, e);
        }
      }

      if (relevantItems.length > 0) {
        await db().collection('snapshots').add({
          personId: '_news_feed',
          source: SOURCE,
          data: { items: relevantItems },
          collectedAt: Timestamp.now(),
        });
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('News/RSS collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
}

export const newsRssCollector = onSchedule(
  { schedule: 'every 6 hours', timeoutSeconds: 120 },
  () => runNewsRss()
);
