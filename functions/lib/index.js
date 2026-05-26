"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiBrain = exports.apifyXCollector = exports.apifyLinkedinCollector = exports.newsRssCollector = exports.githubBiosCollector = exports.semanticScholarCollector = void 0;
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
var semantic_scholar_1 = require("./collectors/semantic-scholar");
Object.defineProperty(exports, "semanticScholarCollector", { enumerable: true, get: function () { return semantic_scholar_1.semanticScholarCollector; } });
var github_bios_1 = require("./collectors/github-bios");
Object.defineProperty(exports, "githubBiosCollector", { enumerable: true, get: function () { return github_bios_1.githubBiosCollector; } });
var news_rss_1 = require("./collectors/news-rss");
Object.defineProperty(exports, "newsRssCollector", { enumerable: true, get: function () { return news_rss_1.newsRssCollector; } });
var apify_linkedin_1 = require("./collectors/apify-linkedin");
Object.defineProperty(exports, "apifyLinkedinCollector", { enumerable: true, get: function () { return apify_linkedin_1.apifyLinkedinCollector; } });
var apify_x_1 = require("./collectors/apify-x");
Object.defineProperty(exports, "apifyXCollector", { enumerable: true, get: function () { return apify_x_1.apifyXCollector; } });
var brain_1 = require("./ai/brain");
Object.defineProperty(exports, "aiBrain", { enumerable: true, get: function () { return brain_1.aiBrain; } });
//# sourceMappingURL=index.js.map