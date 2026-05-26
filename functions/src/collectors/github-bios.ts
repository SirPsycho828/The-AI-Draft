import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import {
  getPeopleWithSource,
  getLatestSnapshot,
  saveSnapshot,
  writeRawChange,
  markScanned,
  detectChanges,
  updateCollectorStatus,
} from '../utils/collector-base';

const SOURCE = 'github';

interface GitHubUser {
  login: string;
  name: string | null;
  company: string | null;
  bio: string | null;
  blog: string | null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGitHubUser(
  username: string,
  token?: string
): Promise<{ user: GitHubUser | null; status: number }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'The-AI-Draft',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers,
  });
  if (!res.ok) return { user: null, status: res.status };
  const user = (await res.json()) as GitHubUser;
  return { user, status: res.status };
}

export async function runGithubBios() {
  try {
    // Optional: set GITHUB_TOKEN secret for 5000 req/hr (vs 60 unauthenticated)
    const token = process.env.GITHUB_TOKEN || undefined;
    const people = await getPeopleWithSource('githubUsername');
    let succeeded = 0;
    let failed = 0;

    for (const person of people) {
      const username = person.sources.githubUsername;
      if (!username) continue;

      const { user, status } = await fetchGitHubUser(username, token);

      if (!user) {
        console.warn(
          `  GitHub: skipped ${person.name} (@${username}) — HTTP ${status}`
        );
        failed++;
        if (status === 403 || status === 429) {
          console.error('  GitHub: rate limited, stopping early');
          break;
        }
        await delay(1000);
        continue;
      }

      const currentData = {
        name: user.name,
        company: user.company,
        bio: user.bio,
        blog: user.blog,
      };

      await saveSnapshot({
        personId: person.id,
        source: SOURCE,
        data: currentData,
        collectedAt: Timestamp.now(),
      });

      const previous = await getLatestSnapshot(person.id, SOURCE);
      if (previous) {
        const changes = detectChanges(
          previous.data as Record<string, unknown>,
          currentData as Record<string, unknown>,
          ['company', 'bio']
        );

        if (changes.length > 0) {
          await writeRawChange(person.id, {
            source: SOURCE,
            previousValue: Object.fromEntries(changes.map((c) => [c.key, c.oldVal])),
            currentValue: Object.fromEntries(changes.map((c) => [c.key, c.newVal])),
            detectedAt: Timestamp.now(),
          });
        }
      }

      await markScanned(person.id);
      succeeded++;
      // Respect rate limits: 2s unauthenticated, 1s with token
      await delay(token ? 1000 : 2000);
    }

    console.log(`GitHub: ${succeeded} succeeded, ${failed} failed out of ${people.length}`);
    await updateCollectorStatus(SOURCE, failed > 0 && succeeded === 0 ? 'error' : 'success');
  } catch (error) {
    console.error('GitHub bios collector error:', error);
    await updateCollectorStatus(SOURCE, 'error');
  }
}

export const githubBiosCollector = onSchedule(
  { schedule: 'every 12 hours', timeoutSeconds: 540 },
  () => runGithubBios()
);
