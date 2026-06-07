import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    getDocs, 
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const AUTH_KEY = 'plugme_auth_user';

function _pathPrefix() {
    const p = window.location.pathname;
    return (p.includes('/admin/') || p.includes('/super-admin/') || p.includes('/auth/'))
        ? '../'
        : '';
}

export const Auth = {
    async signup(name, email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;
            
            const userData = {
                name: name,
                email: email,
                role: 'admin',
                status: 'pending_onboarding',
                isApproved: 0,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", fbUser.uid), userData);
            userData.uid = fbUser.uid;
            
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (err) {
            console.error('Signup error:', err);
            return { success: false, message: err.message };
        }
    },

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;
            
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userData.uid = fbUser.uid;
                localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
                return { success: true, user: userData };
            } else {
                if (email === 'superadmin@gmail.com') {
                    const superAdminData = {
                        name: 'Super Admin',
                        email: email,
                        role: 'superadmin',
                        status: 'approved',
                        isApproved: 1,
                        createdAt: new Date().toISOString()
                    };
                    await setDoc(doc(db, "users", fbUser.uid), superAdminData);
                    superAdminData.uid = fbUser.uid;
                    localStorage.setItem(AUTH_KEY, JSON.stringify(superAdminData));
                    return { success: true, user: superAdminData };
                }
                return { success: false, message: 'User profile not found.' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: err.message };
        }
    },

    async logout() {
        try {
            await signOut(auth);
            localStorage.removeItem(AUTH_KEY);
            window.location.href = _pathPrefix() + 'auth/login.html';
        } catch (err) {
            console.error('Logout error:', err);
        }
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
        } catch {
            return null;
        }
    },

    refreshSession() {
        const session = Auth.getCurrentUser();
        if (!session) return null;

        // Background update using Firestore
        if (auth.currentUser) {
            getDoc(doc(db, "users", auth.currentUser.uid)).then(userDoc => {
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    data.uid = auth.currentUser.uid;
                    const oldStatus = session.status;
                    const oldApproved = session.isApproved;
                    
                    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
                    
                    if (data.status !== oldStatus || data.isApproved !== oldApproved) {
                        window.location.reload();
                    }
                }
            }).catch(err => console.error("Session refresh error:", err));
        }

        return session;
    },

    async updateOnboarding(onboardingData) {
        const session = Auth.getCurrentUser();
        if (!session || !session.uid) return { success: false, message: 'Not authenticated.' };

        try {
            const userRef = doc(db, "users", session.uid);
            await updateDoc(userRef, {
                onboardingData: onboardingData,
                status: 'pending_approval'
            });
            
            const updatedDoc = await getDoc(userRef);
            const data = updatedDoc.data();
            data.uid = session.uid;
            localStorage.setItem(AUTH_KEY, JSON.stringify(data));
            
            return { success: true, user: data };
        } catch (err) {
            console.error('Onboarding error:', err);
            return { success: false, message: err.message };
        }
    },

    async updateProfile(name, company) {
        const session = Auth.getCurrentUser();
        if (!session || !session.uid) return { success: false, message: 'Not authenticated.' };

        try {
            const userRef = doc(db, "users", session.uid);
            await updateDoc(userRef, { name, company });
            
            const updatedDoc = await getDoc(userRef);
            const data = updatedDoc.data();
            data.uid = session.uid;
            localStorage.setItem(AUTH_KEY, JSON.stringify(data));
            
            return { success: true, user: data };
        } catch (err) {
            console.error('Profile update error:', err);
            return { success: false, message: err.message };
        }
    },

    async getAdminsList() {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const admins = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.role === 'admin') {
                    // Normalize onboardingData if it was stored at the root level
                    if (!data.onboardingData && data.company) {
                        data.onboardingData = {
                            company: data.company,
                            taxId: data.taxId,
                            stations: data.stations,
                            location: data.location,
                            description: data.description
                        };
                    }
                    admins.push({ id: doc.id, ...data });
                }
            });
            return admins;
        } catch (err) {
            console.error('Error fetching admins:', err);
            return [];
        }
    },

    async approveAdmin(adminId) {
        try {
            await updateDoc(doc(db, "users", adminId), {
                isApproved: 1,
                status: 'approved'
            });
            return { success: true };
        } catch (err) {
            console.error('Approve error:', err);
            return { success: false };
        }
    },

    async rejectAdmin(adminId) {
        try {
            await updateDoc(doc(db, "users", adminId), {
                isApproved: 0,
                status: 'rejected'
            });
            return { success: true };
        } catch (err) {
            console.error('Reject error:', err);
            return { success: false };
        }
    },

    async deleteAdmin(adminId) {
        try {
            await deleteDoc(doc(db, "users", adminId));
            return { success: true };
        } catch (err) {
            console.error('Delete error:', err);
            return { success: false };
        }
    },

    requireRole(requiredRole, requireApproved = false) {
        const user = Auth.refreshSession();
        const prefix = _pathPrefix();

        if (!user) {
            window.location.replace(prefix + 'auth/login.html');
            return null;
        }

        if (user.role !== requiredRole) {
            const dest = user.role === 'superadmin'
                ? prefix + 'super-admin/dashboard.html'
                : prefix + 'admin/dashboard.html';
            window.location.replace(dest);
            return null;
        }

        if (requireApproved && user.isApproved !== 1) {
            if (user.status === 'pending_onboarding') {
                window.location.replace(prefix + 'admin/onboarding.html');
            } else {
                // E.g., pending approval or rejected
                window.location.replace(prefix + 'admin/onboarding.html'); 
            }
        }

        return user;
    },

    getRedirectUrl(user) {
        const prefix = _pathPrefix();
        if (user.role === 'superadmin') {
            return prefix + 'super-admin/dashboard.html';
        }
        if (user.status === 'pending_onboarding') {
            return prefix + 'admin/onboarding.html';
        }
        return prefix + 'admin/dashboard.html';
    }
};

// Make it available globally for inline scripts that might still rely on window.Auth
window.Auth = Auth;
