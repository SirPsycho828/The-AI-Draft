import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { defineSecret } from 'firebase-functions/params';

const apifyApiKey = defineSecret('APIFY_API_KEY');

async function loadCollector(name: string): Promise<() => Promise<void>> {
  switch (name) {
    case 'semantic_scholar': {
      const { runSemanticScholar } = await import('../collectors/semantic-scholar');
      return runSemanticScholar;
    }
    case 'github': {
      const { runGithubBios } = await import('../collectors/github-bios');
      return runGithubBios;
    }
    case 'news': {
      const { runNewsRss } = await import('../collectors/news-rss');
      return runNewsRss;
    }
    case 'linkedin': {
      const { runLinkedin } = await import('../collectors/apify-linkedin');
      return () => runLinkedin();
    }
    case 'x': {
      const { runX } = await import('../collectors/apify-x');
      return () => runX();
    }
    case 'arxiv': {
      const { runArxiv } = await import('../collectors/arxiv');
      return runArxiv;
    }
    case 'company_site': {
      const { runCompanySite } = await import('../collectors/company-site');
      return runCompanySite;
    }
    default:
      throw new HttpsError('invalid-argument', `Unknown collector: ${name}`);
  }
}

export const runCollectorNow = onCall(
  { timeoutSeconds: 540, secrets: [apifyApiKey] },
  async (request) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
      throw new HttpsError('unauthenticated', 'Must be signed in');
    }

    const caller = await getAuth().getUser(callerUid);
    if (!caller.customClaims?.admin) {
      throw new HttpsError('permission-denied', 'Admin only');
    }

    const collectorName = request.data?.collector as string;
    if (!collectorName) {
      throw new HttpsError('invalid-argument', 'collector name is required');
    }

    const run = await loadCollector(collectorName);
    await run();

    return { message: `${collectorName} completed successfully` };
  }
);
