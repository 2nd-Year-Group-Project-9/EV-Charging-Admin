const StationsDB = {
    STORAGE_KEY: 'plugme_stations_list',

    // ── Helper: Get All Stations ──────────────────────────────────────────
    getAll: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            this.seedData();
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        }
        return JSON.parse(data);
    },

    // ── Get Stations (Filtered by Admin if provided) ──────────────────────
    getStations: function(adminId = null) {
        const allStations = this.getAll();
        if (adminId) {
            return allStations.filter(s => s.adminId === adminId);
        }
        return allStations;
    },

    // ── Get Single Station ────────────────────────────────────────────────
    getStation: function(stationId) {
        return this.getAll().find(s => s.id === stationId);
    },

    // ── Save (Create or Update) ───────────────────────────────────────────
    saveStation: function(stationData) {
        const stations = this.getAll();
        const index = stations.findIndex(s => s.id === stationData.id);

        if (index > -1) {
            // Update existing
            stations[index] = { ...stations[index], ...stationData };
        } else {
            // Create new
            const newStation = {
                id: 'PM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                createdAt: new Date().toISOString(),
                ...stationData
            };
            stations.push(newStation);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stations));
        return true;
    },

    // ── Delete Station ────────────────────────────────────────────────────
    deleteStation: function(stationId) {
        const stations = this.getAll();
        const filtered = stations.filter(s => s.id !== stationId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // ── Toggle Status ─────────────────────────────────────────────────────
    toggleStatus: function(stationId) {
        const stations = this.getAll();
        const station = stations.find(s => s.id === stationId);
        if (station) {
            station.status = station.status === 'active' ? 'inactive' : 'active';
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stations));
            return true;
        }
        return false;
    },

    // ── Seed Initial Data ─────────────────────────────────────────────────
    seedData: function() {
        const seed = [
            {
                id: 'PM-290-X1',
                adminId: 'admin_seed_1', // Will be linked to a real admin
                name: 'Tesla Superhub Alpha',
                location: 'San Francisco, CA',
                chargerType: 'DC Fast (CCS2)',
                ports: 6,
                status: 'active',
                contact: '+1 415-555-0198',
                createdAt: new Date().toISOString()
            },
            {
                id: 'PM-449-Y2',
                adminId: 'admin_seed_1',
                name: 'Berlin Tiergarten Express',
                location: 'Berlin, Germany',
                chargerType: 'AC Type 2',
                ports: 4,
                status: 'active',
                contact: '+49 30 123456',
                createdAt: new Date().toISOString()
            },
            {
                id: 'PM-082-Z3',
                adminId: 'admin_seed_2',
                name: 'London Soho Square',
                location: 'London, UK',
                chargerType: 'DC Fast (CHAdeMO)',
                ports: 2,
                status: 'inactive',
                contact: '+44 20 7946 0958',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
    }
};
