// ============================================================
//  Plug Me – Role-Based Authentication Engine
//  Roles   : 'superadmin' | 'admin'
//  Statuses: 'pending_onboarding' | 'pending_approval' | 'approved' | 'rejected'
//  isApproved: 0 = Not Approved, 1 = Approved
// ============================================================

const AUTH_KEY    = 'plugme_auth_user';
const ADMINS_KEY  = 'plugme_admins_list';
const SCHEMA_VER  = 'plugme_schema_v3';   // bump this to force a re-seed

// ----------------------------------------------------------
//  Seed initial mock data (or re-seed on schema upgrade)
// ----------------------------------------------------------
(function seedData() {
    // If old schema, wipe everything and re-seed
    if (!localStorage.getItem(SCHEMA_VER)) {
        localStorage.removeItem(ADMINS_KEY);
        localStorage.removeItem(AUTH_KEY);
        localStorage.setItem(SCHEMA_VER, '1');
    }
    if (localStorage.getItem(ADMINS_KEY)) return;

    const seed = [
        {
            id          : 'super_1',
            name        : 'Super Admin',
            email       : 'superadmin@gmail.com',
            password    : '123456',
            role        : 'superadmin',
            isApproved  : 1,
            status      : 'approved',
            createdAt   : new Date().toISOString()
        },
        {
            id          : 'admin_1',
            name        : 'Alex Rivera',
            email       : 'admin@plugme.com',
            password    : 'password123',
            role        : 'admin',
            isApproved  : 1,
            status      : 'approved',
            onboardingData: {
                company    : 'Rivera Energy',
                taxId      : 'DE-123456',
                stations   : '6-20',
                location   : 'Berlin, Germany',
                description: 'EV charging network for urban fleets.'
            },
            createdAt   : new Date().toISOString()
        }
    ];

    localStorage.setItem(ADMINS_KEY, JSON.stringify(seed));
})();

// ----------------------------------------------------------
//  Helper – resolve path prefix from current URL
// ----------------------------------------------------------
function _pathPrefix() {
    const p = window.location.pathname;
    return (p.includes('/admin/') || p.includes('/super-admin/') || p.includes('/auth/'))
        ? '../'
        : '';
}

// ----------------------------------------------------------
//  Auth API
// ----------------------------------------------------------
const Auth = {

    // ---- Create a new Admin account -----------------------
    signup(name, email, password) {
        const admins = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];

        if (admins.find(a => a.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newAdmin = {
            id          : 'admin_' + Date.now(),
            name        : name.trim(),
            email       : email.toLowerCase().trim(),
            password,
            role        : 'admin',
            isApproved  : 0,               // Not Approved by default
            status      : 'pending_onboarding',
            onboardingData: null,
            createdAt   : new Date().toISOString()
        };

        admins.push(newAdmin);
        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
        // Automatically start a session so the onboarding page can read the user
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAdmin));

        return { success: true, user: newAdmin };
    },

    // ---- Authenticate and open a session ------------------
    login(email, password) {
        const admins = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
        const user   = admins.find(
            a => a.email.toLowerCase() === email.toLowerCase().trim()
              && a.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password. Please try again.' };
        }

        // Persist session
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return { success: true, user };
    },

    // ---- Destroy session and go to login ------------------
    logout() {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = _pathPrefix() + 'auth/login.html';
    },

    // ---- Read current session user ------------------------
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
        } catch {
            return null;
        }
    },

    // ---- Refresh session from master list (keeps data fresh)
    refreshSession() {
        const session = Auth.getCurrentUser();
        if (!session) return null;

        const admins  = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
        const fresh   = admins.find(a => a.id === session.id);
        if (fresh) {
            localStorage.setItem(AUTH_KEY, JSON.stringify(fresh));
            return fresh;
        }
        return session;
    },

    // ---- Save onboarding form data and mark pending -------
    updateOnboarding(onboardingData) {
        const user = Auth.getCurrentUser();
        if (!user) return { success: false, message: 'Not authenticated.' };

        const admins = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
        const idx    = admins.findIndex(a => a.id === user.id);

        if (idx === -1) return { success: false, message: 'User not found.' };

        admins[idx].onboardingData = onboardingData;
        admins[idx].status         = 'pending_approval';
        // isApproved stays 0 until super admin approves

        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
        localStorage.setItem(AUTH_KEY, JSON.stringify(admins[idx]));

        return { success: true };
    },

    // ---- Super Admin: Approve an admin --------------------
    approveAdmin(adminId) {
        const admins = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
        const idx    = admins.findIndex(a => a.id === adminId);

        if (idx === -1) return { success: false };

        admins[idx].isApproved  = 1;
        admins[idx].status      = 'approved';
        admins[idx].approvedAt  = new Date().toISOString();

        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
        return { success: true };
    },

    // ---- Super Admin: Reject an admin ---------------------
    rejectAdmin(adminId) {
        const admins = JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
        const idx    = admins.findIndex(a => a.id === adminId);

        if (idx === -1) return { success: false };

        admins[idx].isApproved  = 0;
        admins[idx].status      = 'rejected';
        admins[idx].rejectedAt  = new Date().toISOString();

        localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
        return { success: true };
    },

    // ---- Page guard: redirect if wrong role / not logged in
    // Usage examples:
    //   Auth.requireRole('superadmin')   → only super admins
    //   Auth.requireRole('admin')        → only admins (any status)
    //   Auth.requireRole('admin', true)  → only APPROVED admins
    requireRole(requiredRole, requireApproved = false) {
        const user   = Auth.refreshSession();
        const prefix = _pathPrefix();

        if (!user) {
            window.location.replace(prefix + 'auth/login.html');
            return null;
        }

        if (user.role !== requiredRole) {
            // Wrong role → redirect to own dashboard
            const dest = user.role === 'superadmin'
                ? prefix + 'super-admin/dashboard.html'
                : prefix + 'admin/dashboard.html';
            window.location.replace(dest);
            return null;
        }

        if (requireApproved && user.isApproved !== 1) {
            // Admin exists but isn't approved yet
            if (user.status === 'pending_onboarding') {
                window.location.replace(prefix + 'admin/onboarding.html');
            } else {
                // pending_approval or rejected → stay on dashboard (overlay shown)
            }
        }

        return user;
    },

    // ---- Get redirect URL for a user after login ----------
    getRedirectUrl(user) {
        const prefix = _pathPrefix();
        if (user.role === 'superadmin') {
            return prefix + 'super-admin/dashboard.html';
        }
        // Admin
        if (user.status === 'pending_onboarding') {
            return prefix + 'admin/onboarding.html';
        }
        return prefix + 'admin/dashboard.html';
    }
};
