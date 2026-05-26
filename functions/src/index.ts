import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { semanticScholarCollector } from './collectors/semantic-scholar';
export { githubBiosCollector } from './collectors/github-bios';
export { newsRssCollector } from './collectors/news-rss';
// Requires secrets — deploy after running: firebase functions:secrets:set APIFY_API_KEY
// export { apifyLinkedinCollector } from './collectors/apify-linkedin';
// export { apifyXCollector } from './collectors/apify-x';
// Requires secrets — deploy after running: firebase functions:secrets:set OPENROUTER_API_KEY
// export { aiBrain } from './ai/brain';
export { setAdminRole } from './admin/set-admin';
