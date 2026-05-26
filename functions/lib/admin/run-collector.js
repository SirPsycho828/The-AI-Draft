"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCollectorNow = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
const params_1 = require("firebase-functions/params");
const apifyApiKey = (0, params_1.defineSecret)('APIFY_API_KEY');
async function loadCollector(name) {
    switch (name) {
        case 'semantic_scholar': {
            const { runSemanticScholar } = await Promise.resolve().then(() => __importStar(require('../collectors/semantic-scholar')));
            return runSemanticScholar;
        }
        case 'github': {
            const { runGithubBios } = await Promise.resolve().then(() => __importStar(require('../collectors/github-bios')));
            return runGithubBios;
        }
        case 'news': {
            const { runNewsRss } = await Promise.resolve().then(() => __importStar(require('../collectors/news-rss')));
            return runNewsRss;
        }
        case 'linkedin': {
            const { runLinkedin } = await Promise.resolve().then(() => __importStar(require('../collectors/apify-linkedin')));
            return () => runLinkedin();
        }
        case 'x': {
            const { runX } = await Promise.resolve().then(() => __importStar(require('../collectors/apify-x')));
            return () => runX();
        }
        default:
            throw new https_1.HttpsError('invalid-argument', `Unknown collector: ${name}`);
    }
}
exports.runCollectorNow = (0, https_1.onCall)({ timeoutSeconds: 540, secrets: [apifyApiKey] }, async (request) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in');
    }
    const caller = await (0, auth_1.getAuth)().getUser(callerUid);
    if (!caller.customClaims?.admin) {
        throw new https_1.HttpsError('permission-denied', 'Admin only');
    }
    const collectorName = request.data?.collector;
    if (!collectorName) {
        throw new https_1.HttpsError('invalid-argument', 'collector name is required');
    }
    const run = await loadCollector(collectorName);
    await run();
    return { message: `${collectorName} completed successfully` };
});
//# sourceMappingURL=run-collector.js.map