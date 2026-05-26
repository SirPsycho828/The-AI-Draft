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

async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'The-AI-Draft',
    },
  });
  if (!res.ok) return null;
  return res.json() as Promise<GitHubUser>;
}

export async function runGithubBios() {
  try {
      const people = await getPeopleWithSource('githubUsername');

      for (const person of people) {
        const username = person.sources.githubUsername!;
        const user = await fetchGitHubUser(username);
        if (!user) continue;

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
      }

      await updateCollectorStatus(SOURCE, 'success');
    } catch (error) {
      console.error('GitHub bios collector error:', error);
      await updateCollectorStatus(SOURCE, 'error');
    }
}

export const githubBiosCollector = onSchedule(
  { schedule: 'every 12 hours', timeoutSeconds: 540 },
  () => runGithubBios()
);
