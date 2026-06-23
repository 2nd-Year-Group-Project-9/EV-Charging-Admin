import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const NotificationsDB = {
    // ── Get Notifications ──
    async getNotifications() {
        try {
            const notificationsRef = collection(db, "notifications");
            const q = query(notificationsRef, orderBy("createdAt", "desc"));
            
            const querySnapshot = await getDocs(q);
            const notifications = [];
            querySnapshot.forEach((doc) => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            return notifications;
        } catch (err) {
            console.error('Error fetching notifications:', err);
            return [];
        }
    },

    // ── Get Single Notification ──
    async getNotification(id) {
        try {
            const docRef = doc(db, "notifications", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (err) {
            console.error('Error fetching notification details:', err);
            return null;
        }
    },

    // ── Save (Create or Update) ──
    async saveNotification(notificationData) {
        try {
            let docRef;
            const { id, ...data } = notificationData;
            
            const cleanData = {};
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            });

            // Always make sure updatedAt is set
            cleanData.updatedAt = new Date().toISOString();

            if (id) {
                docRef = doc(db, "notifications", id);
                await setDoc(docRef, cleanData, { merge: true });
            } else {
                cleanData.createdAt = new Date().toISOString();
                docRef = doc(collection(db, "notifications"));
                await setDoc(docRef, cleanData);
            }
            return true;
        } catch (err) {
            console.error('Error saving notification:', err);
            return false;
        }
    },

    // ── Delete Notification ──
    async deleteNotification(id) {
        try {
            await deleteDoc(doc(db, "notifications", id));
            return true;
        } catch (err) {
            console.error('Error deleting notification:', err);
            return false;
        }
    }
};

// Expose globally for HTML scripts
window.NotificationsDB = NotificationsDB;
