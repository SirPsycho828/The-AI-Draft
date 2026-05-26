import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';

export const setAdminRole = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  const caller = await getAuth().getUser(callerUid);
  const isFirstAdmin = !(caller.customClaims?.admin === true);

  if (isFirstAdmin) {
    await getAuth().setCustomUserClaims(callerUid, { admin: true });
    return { message: `Admin role granted to ${caller.email} (bootstrap)` };
  }

  if (!caller.customClaims?.admin) {
    throw new HttpsError('permission-denied', 'Only admins can set admin roles');
  }

  const targetEmail = request.data?.email;
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  const targetUser = await getAuth().getUserByEmail(targetEmail);
  await getAuth().setCustomUserClaims(targetUser.uid, { admin: true });
  return { message: `Admin role granted to ${targetEmail}` };
});
