import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';

type SourceType = 'github' | 'linkedin' | 'semanticScholar' | 'x';

interface VerifyRequest {
  type: SourceType;
  value: string;
}

interface VerifyResult {
  valid: boolean;
  label?: string;
}

async function verifyGithub(username: string): Promise<VerifyResult> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { 'User-Agent': 'AI-Talent-Tracker/1.0' },
  });
  if (!res.ok) return { valid: false };
  const data = await res.json();
  return { valid: true, label: data.name || username };
}

async function verifyLinkedin(slug: string): Promise<VerifyResult> {
  // LinkedIn blocks most bot requests, so we verify format and do a HEAD check.
  // A 200/301/302 means the profile exists; 404/999 means it doesn't.
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return { valid: false };
  }
  try {
    const res = await fetch(`https://www.linkedin.com/in/${encodeURIComponent(slug)}/`, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Talent-Tracker/1.0)' },
    });
    // LinkedIn returns 200 for valid profiles, 404 for missing, 999 for rate limit
    if (res.status === 999) {
      // Rate limited — can't verify, assume format-valid is OK
      return { valid: true, label: `linkedin.com/in/${slug} (format OK, rate limited)` };
    }
    // 200 or 3xx redirects to the profile = valid
    if (res.status >= 200 && res.status < 400) {
      return { valid: true, label: `linkedin.com/in/${slug}` };
    }
    return { valid: false };
  } catch {
    // Network error — can't verify, pass on format alone
    return { valid: true, label: `linkedin.com/in/${slug} (format OK, couldn't reach)` };
  }
}

async function verifySemanticScholar(authorId: string): Promise<VerifyResult> {
  if (!/^\d+$/.test(authorId)) return { valid: false };
  const res = await fetch(
    `https://api.semanticscholar.org/graph/v1/author/${authorId}?fields=name`
  );
  if (!res.ok) return { valid: false };
  const data = await res.json();
  return { valid: true, label: data.name || authorId };
}

async function verifyX(handle: string): Promise<VerifyResult> {
  // X API requires auth, so just validate format
  const clean = handle.startsWith('@') ? handle.slice(1) : handle;
  if (!/^[a-zA-Z0-9_]{1,15}$/.test(clean)) {
    return { valid: false };
  }
  return { valid: true, label: `@${clean}` };
}

export const verifySource = onCall(
  { timeoutSeconds: 30 },
  async (request) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
      throw new HttpsError('unauthenticated', 'Must be signed in');
    }

    const caller = await getAuth().getUser(callerUid);
    if (!caller.customClaims?.admin) {
      throw new HttpsError('permission-denied', 'Admin only');
    }

    const { type, value } = request.data as VerifyRequest;
    if (!type || !value) {
      throw new HttpsError('invalid-argument', 'type and value are required');
    }

    switch (type) {
      case 'github':
        return verifyGithub(value);
      case 'linkedin':
        return verifyLinkedin(value);
      case 'semanticScholar':
        return verifySemanticScholar(value);
      case 'x':
        return verifyX(value);
      default:
        throw new HttpsError('invalid-argument', `Unknown source type: ${type}`);
    }
  }
);
