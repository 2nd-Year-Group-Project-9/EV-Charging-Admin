// appointments.js
// Reads & writes appointments directly from the plug-me-app Firestore
// (the same DB the mobile app uses), giving instant real-time sync
// with zero polling lag.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Secondary Firebase app pointing to the USER app's Firestore ──────────────
const APP_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCycAMFqZuKDFYbcV6z8XMvMVGLOu3MBVY',
    authDomain: 'plug-me-app.firebaseapp.com',
    projectId: 'plug-me-app',
    storageBucket: 'plug-me-app.firebasestorage.app',
    messagingSenderId: '595170774884',
    appId: '1:595170774884:web:0f7c22262d644d70b777a1'
};

// Avoid re-initializing if already initialized (e.g., in HMR / reload)
const appFirebase = getApps().find(a => a.name === 'plug-me-app')
    || initializeApp(APP_FIREBASE_CONFIG, 'plug-me-app');
const appDb = getFirestore(appFirebase);

export const AppointmentsDB = {

    // ── Real-time listener (primary method) ──────────────────────────────────
    // adminId: pass user.uid for station admins; null for super-admin (all)
    listenAppointments(adminId, callback) {
        try {
            const appointmentsRef = collection(appDb, 'appointments');
            let q;
            if (adminId) {
                // Station admin sees only their own station's appointments
                q = query(
                    appointmentsRef,
                    where('adminId', '==', adminId),
                    orderBy('createdAt', 'desc')
                );
            } else {
                // Super-admin sees ALL appointments
                q = query(appointmentsRef, orderBy('createdAt', 'desc'));
            }

            return onSnapshot(q,
                (snapshot) => {
                    const appointments = [];
                    snapshot.forEach(d => appointments.push({ id: d.id, ...d.data() }));
                    callback(appointments);
                },
                (err) => {
                    console.error('[AppointmentsDB] Firestore listener error:', err);
                    // Retry with no filter on index error as fallback
                    if (err.code === 'failed-precondition' && adminId) {
                        console.warn('[AppointmentsDB] Index missing — falling back to unfiltered query.');
                        const fallbackQ = query(appointmentsRef, orderBy('createdAt', 'desc'));
                        return onSnapshot(fallbackQ, (snap) => {
                            const all = [];
                            snap.forEach(d => all.push({ id: d.id, ...d.data() }));
                            callback(all.filter(a => a.adminId === adminId));
                        });
                    }
                }
            );
        } catch (err) {
            console.error('[AppointmentsDB] Error setting up listener:', err);
            return () => {};
        }
    },

    // ── Update appointment status (Confirm / Cancel) ─────────────────────────
    // Writes directly to plug-me-app Firestore so the mobile app sees
    // the update instantly via its own real-time listener.
    async updateStatus(id, status) {
        try {
            const docRef = doc(appDb, 'appointments', id);
            await updateDoc(docRef, {
                status: status,
                updatedAt: new Date().toISOString()
            });
            console.log(`[AppointmentsDB] Updated appointment ${id} → ${status}`);
            return true;
        } catch (err) {
            console.error('[AppointmentsDB] Error updating appointment status:', err);
            return false;
        }
    }
};

// Expose globally for inline script handlers
window.AppointmentsDB = AppointmentsDB;
