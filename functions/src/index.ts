import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { semanticScholarCollector } from './collectors/semantic-scholar';
export { githubBiosCollector } from './collectors/github-bios';
export { newsRssCollector } from './collectors/news-rss';
export { apifyLinkedinCollector } from './collectors/apify-linkedin';
export { apifyXCollector } from './collectors/apify-x';
export { aiBrain } from './ai/brain';
export { setAdminRole } from './admin/set-admin';
export { runCollectorNow } from './admin/run-collector';
