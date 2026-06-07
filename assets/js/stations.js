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
    where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const StationsDB = {
    // ── Get Stations ──
    async getStations(adminId = null) {
        try {
            const stationsRef = collection(db, "stations");
            let q;
            if (adminId) {
                q = query(stationsRef, where("adminId", "==", adminId));
            } else {
                q = stationsRef; // Super Admin sees all
            }
            
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
