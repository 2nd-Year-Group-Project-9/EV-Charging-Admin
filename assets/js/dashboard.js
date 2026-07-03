import { db } from './firebase-config.js';
import { collection, query, where, onSnapshot, getDocs, Timestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Auth } from './auth.js';

let statusChart;
let stationsUnsubscribe = null;
let sessionsUnsubscribe = null;
let historyUnsubscribe = null;
let adminStations = [];

export const DashboardController = {
    async init() {
        const user = Auth.refreshSession();
        if (!user || user.role !== 'admin') return;

        this.initCharts();
        this.listenToStations(user.uid);
    },

    initCharts() {
        // Initialize Status Chart
        const ctxStatus = document.getElementById('statusChart').getContext('2d');
        statusChart = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Available', 'Busy', 'Offline'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
        });
    },

    listenToStations(adminId) {
        const stationsRef = collection(db, "stations");
        const q = query(stationsRef, where("adminId", "==", adminId));
        
        stationsUnsubscribe = onSnapshot(q, (snapshot) => {
            adminStations = [];
            let available = 0, busy = 0, offline = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                adminStations.push(data);
                
                const currentStatus = data.liveStatus || data.status;
                if (currentStatus === 'Available' || currentStatus === 'active') available++;
                else if (currentStatus === 'Busy') busy++;
                else offline++;
            });

            this.updateTopLevelStats();
            this.updateStatusChart(available, busy, offline);
            
            // Re-bind session listener whenever stations change (if needed)
            this.listenToActiveSessions();
            this.listenToHistorySessions();
        });
    },

    listenToActiveSessions() {
        if (adminStations.length === 0) return;
        
        const stationIds = adminStations.map(s => s.id);
        const sessionsRef = collection(db, "sessions");
        
        // We only listen to active sessions to show live active session count
        const q = query(sessionsRef, where("status", "==", "active"));
        
        if (sessionsUnsubscribe) sessionsUnsubscribe();
        
        sessionsUnsubscribe = onSnapshot(q, (snapshot) => {
            let activeSessionsCount = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (stationIds.includes(data.station)) {
                    activeSessionsCount++;
                }
            });
            
            document.getElementById('stat-active-sessions').innerText = activeSessionsCount;
            this.renderActiveSessionsList(snapshot, stationIds);
        });
    },

    async updateTopLevelStats() {
        document.getElementById('stat-total-stations').innerText = adminStations.length;
        
        // Compute uptime %
        const online = adminStations.filter(s => s.status !== 'inactive' && s.status !== 'maintaining').length;
        const uptime = adminStations.length > 0 ? Math.round((online / adminStations.length) * 100) : 0;
        document.getElementById('stat-uptime').innerText = `${uptime}%`;

        // Fetch today's sessions to calculate daily revenue
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const sessionsRef = collection(db, "sessions");
        const q = query(sessionsRef, where("createdAt", ">=", today));
        
        const snap = await getDocs(q);
        let dailyRevenue = 0;
        const stationIds = adminStations.map(s => s.id);
        
        snap.forEach(doc => {
            const data = doc.data();
            if (stationIds.includes(data.station) && data.totalCost) {
                dailyRevenue += data.totalCost;
            }
        });
        
        document.getElementById('stat-total-revenue').innerText = `Rs. ${dailyRevenue.toLocaleString()}`;
    },

    updateStatusChart(available, busy, offline) {
        statusChart.data.datasets[0].data = [available, busy, offline];
        statusChart.update();
    },

    renderActiveSessionsList(snapshot, stationIds) {
        const container = document.getElementById('active-sessions-list');
        if (!container) return;
        
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            if (stationIds.includes(data.station)) {
                // Find station name
                const station = adminStations.find(s => s.id === data.station);
                const sName = station ? station.name : data.stationName;
                
                html += `
                    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 relative shrink-0">
                                <span class="material-symbols-outlined text-xl animate-pulse">bolt</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm">${sName}</h4>
                                <p class="text-[10px] text-slate-500 font-medium">Connector Port ${data.portNumber}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">Charging</span>
                        </div>
                    </div>
                `;
            }
        });
        
        if (html === '') {
            html = `
                <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <span class="material-symbols-outlined text-3xl text-slate-300">power_off</span>
                    <span class="text-xs italic">No active sessions right now.</span>
                </div>
            `;
        }
        
        container.innerHTML = html;
    },

    listenToHistorySessions() {
        if (adminStations.length === 0) {
            this.renderHistoryTable([]);
            return;
        }

        const stationIds = adminStations.map(s => s.id);
        const sessionsRef = collection(db, "sessions");

        // Fetch completed sessions for the admin's stations (limit to first 30 stations chunk to avoid Firestore 'in' limits)
        const chunk = stationIds.slice(0, 30);
        const q = query(
            sessionsRef, 
            where("station", "in", chunk),
            where("status", "==", "completed")
        );

        if (historyUnsubscribe) historyUnsubscribe();

        historyUnsubscribe = onSnapshot(q, (snapshot) => {
            const sessions = [];
            snapshot.forEach(doc => {
                sessions.push({ id: doc.id, ...doc.data() });
            });
            this.renderHistoryTable(sessions);
        }, (error) => {
            console.error("Error listening to completed sessions:", error);
        });
    },

    renderHistoryTable(sessions) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        if (sessions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400 italic">No completed sessions found.</td></tr>`;
            return;
        }

        // Sort by createdAt descending
        sessions.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
            return bTime - aTime;
        });

        let html = '';
        sessions.forEach(s => {
            const station = adminStations.find(st => st.id === s.station);
            const stationName = station ? station.name : (s.stationName || 'Unknown');
            const portText = s.portNumber ? `Port ${s.portNumber}` : 'Port 1';
            
            const dateStr = s.createdAt?.toDate 
                ? s.createdAt.toDate().toLocaleString() 
                : (s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A');

            let durationStr = 'N/A';
            if (s.startTime && s.endTime) {
                const start = s.startTime.toDate ? s.startTime.toDate() : new Date(s.startTime);
                const end = s.endTime.toDate ? s.endTime.toDate() : new Date(s.endTime);
                const diffMs = end - start;
                const mins = Math.floor(diffMs / 60000);
                durationStr = `${mins} min`;
            }

            const energy = typeof s.energyDelivered === 'number' ? s.energyDelivered.toFixed(2) : '0.00';
            const cost = typeof s.totalCost === 'number' ? `Rs. ${s.totalCost.toFixed(2)}` : 'Rs. 0.00';
            const payMethod = s.paymentMethod ? s.paymentMethod.toUpperCase() : 'WALLET';

            const userId = s.user || 'unknown';
            const shortId = userId.substring(0, 8);
            const placeholderInitials = shortId.substring(0, 2).toUpperCase();
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
            const colorClass = colors[userId.charCodeAt(0) % colors.length];

            html += `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td class="py-3.5 px-2" id="user-cell-${s.id}">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                ${placeholderInitials}
                            </div>
                            <div>
                                <p class="font-bold text-slate-800">${shortId}...</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3.5 px-2 text-slate-600">
                        <span class="font-medium text-slate-800">${stationName}</span>
                        <span class="text-[10px] text-slate-400 block font-medium">${portText}</span>
                    </td>
                    <td class="py-3.5 px-2 text-slate-500">${dateStr}</td>
                    <td class="py-3.5 px-2 font-bold text-primary">${energy} kWh</td>
                    <td class="py-3.5 px-2 font-bold text-emerald-600">${cost}</td>
                    <td class="py-3.5 px-2 text-slate-600">${durationStr}</td>
                    <td class="py-3.5 px-2">
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">${payMethod}</span>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Fetch user profiles asynchronously to populate names
        sessions.forEach(s => {
            if (s.user) {
                this.fetchAndPopulateUser(s.user, `user-cell-${s.id}`);
            }
        });
    },

    userCache: {},
    async fetchAndPopulateUser(userId, cellId) {
        let name = '';
        let subtitle = userId.substring(0, 8) + '...';
        if (this.userCache[userId]) {
            name = this.userCache[userId].name;
            subtitle = this.userCache[userId].subtitle;
        } else {
            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const uData = userDoc.data();
                    name = (uData.first_name || uData.last_name)
                        ? `${uData.first_name || ''} ${uData.last_name || ''}`.trim()
                        : uData.email || userId;
                    if (uData.email) subtitle = uData.email;
                    this.userCache[userId] = { name, subtitle };
                } else {
                    name = `User (${userId.substring(0, 6)})`;
                    this.userCache[userId] = { name, subtitle };
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                name = `User (${userId.substring(0, 6)})`;
                this.userCache[userId] = { name, subtitle };
            }
        }

        const cached = this.userCache[userId];
        name = cached.name;
        subtitle = cached.subtitle;

        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
        const colorClass = colors[userId.charCodeAt(0) % colors.length];

        const cellEl = document.getElementById(cellId);
        if (cellEl) {
            cellEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        ${initials}
                    </div>
                    <div>
                        <p class="font-bold text-slate-800 text-left">${name}</p>
                        <p class="text-[10px] text-slate-400 block text-left">${subtitle}</p>
                    </div>
                </div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DashboardController.init();
});
