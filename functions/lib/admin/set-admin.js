"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
exports.setAdminRole = (0, https_1.onCall)(async (request) => {
    const callerUid = request.auth?.uid;
    if (!callerUid) {
        throw new https_1.HttpsError('unauthenticated', 'Must be signed in');
    }
    const caller = await (0, auth_1.getAuth)().getUser(callerUid);
    const isFirstAdmin = !(caller.customClaims?.admin === true);
    if (isFirstAdmin) {
        await (0, auth_1.getAuth)().setCustomUserClaims(callerUid, { admin: true });
        return { message: `Admin role granted to ${caller.email} (bootstrap)` };
    }
    if (!caller.customClaims?.admin) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can set admin roles');
    }
    const targetEmail = request.data?.email;
    if (!targetEmail) {
        throw new https_1.HttpsError('invalid-argument', 'Email is required');
    }
    const targetUser = await (0, auth_1.getAuth)().getUserByEmail(targetEmail);
    await (0, auth_1.getAuth)().setCustomUserClaims(targetUser.uid, { admin: true });
    return { message: `Admin role granted to ${targetEmail}` };
});
//# sourceMappingURL=set-admin.js.map