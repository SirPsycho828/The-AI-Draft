import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'the-ai-draft' });
const db = getFirestore();

async function backfillPhotos() {
  const snap = await db.collection('people').get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data();

    // Skip if already has a photo
    if (data.photoUrl) {
      skipped++;
      continue;
    }

    const github = data.sources?.githubUsername;
    if (github) {
      // GitHub serves avatar redirects at /{username}.png
      const photoUrl = `https://github.com/${github}.png`;
      await doc.ref.update({ photoUrl });
      console.log(`  Updated ${data.name} -> ${photoUrl}`);
      updated++;
    } else {
      console.log(`  Skipped ${data.name} (no GitHub username)`);
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

backfillPhotos().catch(console.error);
