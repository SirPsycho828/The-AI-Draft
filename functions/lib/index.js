"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = exports.newsRssCollector = exports.githubBiosCollector = exports.semanticScholarCollector = void 0;
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
var semantic_scholar_1 = require("./collectors/semantic-scholar");
Object.defineProperty(exports, "semanticScholarCollector", { enumerable: true, get: function () { return semantic_scholar_1.semanticScholarCollector; } });
var github_bios_1 = require("./collectors/github-bios");
Object.defineProperty(exports, "githubBiosCollector", { enumerable: true, get: function () { return github_bios_1.githubBiosCollector; } });
var news_rss_1 = require("./collectors/news-rss");
Object.defineProperty(exports, "newsRssCollector", { enumerable: true, get: function () { return news_rss_1.newsRssCollector; } });
// Requires secrets — deploy after running: firebase functions:secrets:set APIFY_API_KEY
// export { apifyLinkedinCollector } from './collectors/apify-linkedin';
// export { apifyXCollector } from './collectors/apify-x';
// Requires secrets — deploy after running: firebase functions:secrets:set OPENROUTER_API_KEY
// export { aiBrain } from './ai/brain';
var set_admin_1 = require("./admin/set-admin");
Object.defineProperty(exports, "setAdminRole", { enumerable: true, get: function () { return set_admin_1.setAdminRole; } });
//# sourceMappingURL=index.js.map