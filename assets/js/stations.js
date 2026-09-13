import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://plugme-app-backend.onrender.com';

export const StationsDB = {
    // ── Realtime Listener for Stations ──
    listenToStations(adminId = null, callback) {
        try {
            const stationsRef = collection(db, "stations");
            let q = adminId ? query(stationsRef, where("adminId", "==", adminId)) : stationsRef;
            
            return onSnapshot(q, (snapshot) => {
                const stations = [];
                snapshot.forEach((doc) => {
                    stations.push({ id: doc.id, ...doc.data() });
                });
                callback(stations);
            }, (err) => {
                console.error('Error listening to stations:', err);
                callback([]);
            });
        } catch (err) {
            console.error('Error setting up station listener:', err);
            return () => {};
        }
    },

    // ── Get Stations (Promise) ──
    async getStations(adminId = null) {
        try {
            const stationsRef = collection(db, "stations");
            let q = adminId ? query(stationsRef, where("adminId", "==", adminId)) : stationsRef;
            
            const querySnapshot = await getDocs(q);
            const stations = [];
            querySnapshot.forEach((doc) => {
                stations.push({ id: doc.id, ...doc.data() });
            });
            return stations;
        } catch (err) {
            console.error('Error fetching stations:', err);
            return [];
        }
    },

    // ── Get Single Station ──
    async getStation(stationId) {
        try {
            const docRef = doc(db, "stations", stationId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (err) {
            console.error('Error fetching station details:', err);
            return null;
        }
    },

    // ── Save (Create or Update) ──
    async saveStation(stationData) {
        try {
            let docRef;
            const { id, ...data } = stationData;
            
            // Clean up any undefined fields to avoid Firestore errors
            const cleanData = {};
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            });

            if (id) {
                docRef = doc(db, "stations", id);
                await setDoc(docRef, cleanData, { merge: true });
            } else {
                docRef = doc(collection(db, "stations"));
                await setDoc(docRef, cleanData);
            }

            // Trigger backend sync asynchronously to notify app immediately
            fetch(`${BACKEND_URL}/api/health`).catch(() => {});

            return true;
        } catch (err) {
            console.error('Error saving station:', err);
            return false;
        }
    },

    // ── Delete Station ──
    async deleteStation(stationId) {
        try {
            await deleteDoc(doc(db, "stations", stationId));
            return true;
        } catch (err) {
            console.error('Error deleting station:', err);
            return false;
        }
    },

    // ── Toggle Status ──
    async toggleStatus(stationId) {
        try {
            const docRef = doc(db, "stations", stationId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const currentStatus = docSnap.data().status || 'active';
                let newStatus;
                if (currentStatus === 'active') {
                    newStatus = 'maintaining';
                } else if (currentStatus === 'maintaining') {
                    newStatus = 'inactive';
                } else {
                    newStatus = 'active';
                }
                await updateDoc(docRef, { status: newStatus });
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error toggling station status:', err);
            return false;
        }
    }
};

// Also expose globally for inline script compatibility
window.StationsDB = StationsDB;

