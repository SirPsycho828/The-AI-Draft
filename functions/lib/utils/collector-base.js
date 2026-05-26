"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeopleWithSource = getPeopleWithSource;
exports.getLatestSnapshot = getLatestSnapshot;
exports.saveSnapshot = saveSnapshot;
exports.writeRawChange = writeRawChange;
exports.markScanned = markScanned;
exports.updateCollectorStatus = updateCollectorStatus;
exports.detectChanges = detectChanges;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
async function getPeopleWithSource(sourceField, tiers) {
    const query = db.collection('people');
    const snap = await query.get();
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => {
        if (!p.sources[sourceField])
            return false;
        if (tiers && !tiers.includes(p.tier))
            return false;
        return true;
    });
}
async function getLatestSnapshot(personId, source) {
    const snap = await db
        .collection('snapshots')
        .where('personId', '==', personId)
        .where('source', '==', source)
        .orderBy('collectedAt', 'desc')
        .limit(1)
        .get();
    if (snap.empty)
        return null;
    return snap.docs[0].data();
}
async function saveSnapshot(snapshot) {
    await db.collection('snapshots').add(snapshot);
}
async function writeRawChange(personId, change) {
    await db
        .collection('people')
        .doc(personId)
        .collection('rawChanges')
        .add({ ...change, processed: false });
}
async function markScanned(personId) {
    await db.collection('people').doc(personId).update({
        lastScannedAt: firestore_1.Timestamp.now(),
    });
}
async function updateCollectorStatus(collectorName, status) {
    await db
        .collection('config')
        .doc('app')
        .set({
        collectors: {
            [collectorName]: {
                lastRunAt: firestore_1.Timestamp.now(),
                lastRunStatus: status,
            },
        },
    }, { merge: true });
}
function detectChanges(previous, current, keysToWatch) {
    const changes = [];
    for (const key of keysToWatch) {
        const oldVal = previous[key];
        const newVal = current[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes.push({ key, oldVal, newVal });
        }
    }
    return changes;
}
//# sourceMappingURL=collector-base.js.map