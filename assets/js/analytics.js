import { db } from './firebase-config.js';
import { collection, query, where, getDocs, Timestamp, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Auth } from './auth.js';
import { StationsDB } from './stations.js';

let utilizationChart;
let stationsUnsubscribe = null;
let sessionsUnsubscribe = null;

export const AnalyticsController = {
    currentSessions: [],
    currentStations: [],
    sortField: 'date',
    sortAsc: false,

    async init() {
        const user = Auth.refreshSession();
        if (!user || user.role !== 'admin') return;

        this.initChart();
        this.listenToData(user.uid, 'Today');

        document.getElementById('date-filter').addEventListener('change', (e) => {
            this.listenToData(user.uid, e.target.value);
        });

        // Search sessions filter
        const searchInput = document.getElementById('search-sessions');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterAndRender();
            });
        }

        // Station select filter
        const stationFilter = document.getElementById('station-filter');
        if (stationFilter) {
            stationFilter.addEventListener('change', () => {
                this.filterAndRender();
            });
        }

        // Status select filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterAndRender();
            });
        }

        // Export report button
        const exportBtn = document.getElementById('export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportCSV();
            });
        }

        // Add event listeners for table sorting headers
        const headers = document.querySelectorAll('thead th[data-sort]');
        headers.forEach(h => {
            h.addEventListener('click', () => {
                const field = h.getAttribute('data-sort');
                this.handleSort(field);
            });
        });
        this.updateSortHeaders();
    },

    initChart() {
        const ctx = document.getElementById('utilizationChart').getContext('2d');
        utilizationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Energy Consumption (kWh)',
                    data: [],
                    borderColor: '#1A2FA0',
                    backgroundColor: 'rgba(26, 47, 160, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    listenToData(adminId, filter) {
        try {
            const stationsRef = collection(db, "stations");
            const qStations = query(stationsRef, where("adminId", "==", adminId));

            if (stationsUnsubscribe) stationsUnsubscribe();

            stationsUnsubscribe = onSnapshot(qStations, (snapshot) => {
                const stations = [];
                snapshot.forEach(doc => {
                    stations.push({ id: doc.id, ...doc.data() });
                });

                if (stations.length === 0) {
                    this.renderEmptyState();
                    return;
                }

                this.currentStations = stations;

                // Populate Top Performer in realtime
                this.renderTopPerformer(stations);

                // Populate Station Filter select box
                const stationFilterSelect = document.getElementById('station-filter');
                if (stationFilterSelect) {
                    const currentValue = stationFilterSelect.value;
                    stationFilterSelect.innerHTML = '<option value="All">All Stations</option>';
                    stations.forEach(st => {
                        const option = document.createElement('option');
                        option.value = st.id;
                        option.innerText = st.name || 'Unnamed Station';
                        stationFilterSelect.appendChild(option);
                    });
                    if (currentValue && [...stationFilterSelect.options].some(o => o.value === currentValue)) {
                        stationFilterSelect.value = currentValue;
                    }
                }

                // Listen to sessions in realtime using these stations
                this.listenToSessions(stations, filter);
            }, (err) => {
                console.error("Error listening to stations:", err);
                this.renderEmptyState();
            });
        } catch (err) {
            console.error("Error setting up data listeners:", err);
            this.renderEmptyState();
        }
    },

    listenToSessions(stations, filter) {
        const stationIds = stations.map(s => s.id);
        const sessionsRef = collection(db, "sessions");

        if (sessionsUnsubscribe) sessionsUnsubscribe();

        const unsubscribes = [];
        const sessionsMap = {};

        const handleSessionsUpdate = () => {
            const sessions = Object.values(sessionsMap);

            // Calculate date range for in-memory filtering
            let startDate = new Date();
            if (filter === 'Today') {
                startDate.setHours(0,0,0,0);
            } else if (filter === 'Yesterday') {
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0,0,0,0);
            } else if (filter === 'Last 7 Days') {
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0,0,0,0);
            } else if (filter === 'Last 30 Days') {
                startDate.setDate(startDate.getDate() - 30);
                startDate.setHours(0,0,0,0);
            } else if (filter === 'All Time') {
                startDate = new Date(0);
            }

            // Filter by date range in-memory
            let filteredSessions = sessions.filter(s => {
                const d = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt ? new Date(s.createdAt) : new Date(0));
                return d >= startDate;
            });

            // If "Yesterday", filter out anything from today
            if (filter === 'Yesterday') {
                const today = new Date();
                today.setHours(0,0,0,0);
                filteredSessions = filteredSessions.filter(s => {
                    const d = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt ? new Date(s.createdAt) : new Date(0));
                    return d < today;
                });
            }

            // Cache globally for sorting and filtering
            this.allPeriodSessions = filteredSessions;
            this.currentSessions = filteredSessions;

            this.updateStats(filteredSessions, filter);
            this.updateChart(filteredSessions, filter);
            
            // Re-apply filters and sort dynamically
            this.filterAndRender();
        };

        for (let i = 0; i < stationIds.length; i += 30) {
            const chunk = stationIds.slice(i, i + 30);
            const q = query(
                sessionsRef, 
                where("station", "in", chunk)
            );
            
            const unsub = onSnapshot(q, (snapshot) => {
                // Clear out older sessions for these stations first
                chunk.forEach(stationId => {
                    for (const id in sessionsMap) {
                        if (sessionsMap[id].station === stationId) {
                            delete sessionsMap[id];
                        }
                    }
                });

                snapshot.forEach(doc => {
                    sessionsMap[doc.id] = { id: doc.id, ...doc.data() };
                });

                handleSessionsUpdate();
            }, (err) => {
                console.error("Error listening to sessions chunk:", err);
            });

            unsubscribes.push(unsub);
        }

        sessionsUnsubscribe = () => {
            unsubscribes.forEach(unsub => unsub());
        };
    },

    updateStats(sessions, filter) {
        let totalRevenue = 0;
        let totalEnergy = 0;
        
        sessions.forEach(s => {
            if (s.totalCost) totalRevenue += s.totalCost;
            if (s.energyDelivered) totalEnergy += s.energyDelivered;
        });

        document.getElementById('analytics-revenue').innerText = `Rs. ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('analytics-energy').innerHTML = `${totalEnergy.toFixed(2)} <span class="text-xl text-slate-400">kWh</span>`;
        document.getElementById('analytics-sessions').innerText = sessions.length;

        // Dynamically update summaries period labels
        let periodText = "Monthly";
        if (filter === "Today") periodText = "Today's";
        else if (filter === "Yesterday") periodText = "Yesterday's";
        else if (filter === "Last 7 Days") periodText = "Weekly";
        else if (filter === "Last 30 Days") periodText = "Monthly";
        else if (filter === "All Time") periodText = "All Time";

        const revEl = document.getElementById('revenue-period-label');
        const nrgEl = document.getElementById('energy-period-label');
        const sesEl = document.getElementById('sessions-period-label');
        if (revEl) revEl.innerText = `${periodText} Revenue`;
        if (nrgEl) nrgEl.innerText = `Energy Delivered (${periodText})`;
        if (sesEl) sesEl.innerText = `Charging Sessions (${periodText})`;
    },

    updateChart(sessions, filter) {
        // Group by day or hour depending on filter
        const dataMap = {};
        
        sessions.forEach(s => {
            if (!s.energyDelivered) return;
            const date = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt ? new Date(s.createdAt) : new Date());
            
            let key;
            if (filter === 'Last 7 Days' || filter === 'Last 30 Days' || filter === 'All Time') {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                key = `${yyyy}-${mm}-${dd}`;
            } else {
                key = `${String(date.getHours()).padStart(2, '0')}:00`;
            }
            
            dataMap[key] = (dataMap[key] || 0) + s.energyDelivered;
        });

        // Sort keys
        let labels = Object.keys(dataMap);
        labels.sort(); // String sorting works perfectly for YYYY-MM-DD and HH:00!

        const data = labels.map(l => dataMap[l]);

        // Format labels for display (e.g. "YYYY-MM-DD" -> "Month Day")
        const displayLabels = labels.map(l => {
            if (l.includes('-')) {
                const [y, m, d] = l.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[parseInt(m) - 1]} ${parseInt(d)}`;
            }
            return l;
        });

        utilizationChart.data.labels = displayLabels;
        utilizationChart.data.datasets[0].data = data;
        utilizationChart.update();
    },

    renderTopPerformer(stations) {
        const performerContainer = document.getElementById('top-performer-container');
        if (!performerContainer || stations.length === 0) return;
        const sorted = [...stations].sort((a, b) => b.ports - a.ports);
        const topStation = sorted[0];

        const isOnline = topStation.status === 'active';
        const statusBadge = isOnline
            ? '<span class="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Online</span>'
            : '<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Maintenance</span>';

        performerContainer.innerHTML = `
            <div class="space-y-6">
                <div class="p-6 bg-primary/[0.03] rounded-2xl border border-primary/10 relative overflow-hidden group hover:bg-primary/[0.05] transition-colors duration-300">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h4 class="font-headline font-extrabold text-lg text-primary text-left">${topStation.name || 'Unnamed Station'}</h4>
                            <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">location_on</span>
                                ${topStation.location || 'Unknown location'}
                            </p>
                        </div>
                        ${statusBadge}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Total Ports</p>
                        <p class="text-2xl font-black text-primary mt-1 text-left">${topStation.ports || 1}</p>
                    </div>
                    <div class="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Price per kWh</p>
                        <p class="text-lg font-black text-emerald-600 mt-1 text-left">Rs. ${topStation.pricePerKwh || 0}</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderHistoryTable(sessions, stations) {
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        if (sessions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400 italic">No charging sessions found matching current filters.</td></tr>`;
            return;
        }

        let html = '';
        sessions.forEach(s => {
            const station = stations.find(st => st.id === s.station);
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
            const statusClass = s.status === 'completed' ? 'bg-green-50 text-green-700 font-bold' : 'bg-amber-50 text-amber-700 font-bold';

            const userId = s.user || 'unknown';
            const shortId = userId.substring(0, 8);
            const placeholderInitials = shortId.substring(0, 2).toUpperCase();
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
            const colorClass = colors[userId.charCodeAt(0) % colors.length];

            html += `
                <tr class="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                    <td class="py-4 px-4" id="user-cell-${s.id}">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                ${placeholderInitials}
                            </div>
                            <div>
                                <p class="font-bold text-slate-800 text-sm text-left">${shortId}...</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4 text-sm text-slate-600 text-left">
                        <span class="font-medium text-slate-800">${stationName}</span>
                        <span class="text-[10px] text-slate-400 block font-medium">${portText}</span>
                    </td>
                    <td class="py-4 px-4 text-sm text-slate-500 text-left">${dateStr}</td>
                    <td class="py-4 px-4 text-sm text-slate-600 font-medium text-left">${durationStr}</td>
                    <td class="py-4 px-4 text-sm font-bold text-primary text-left">${energy} kWh</td>
                    <td class="py-4 px-4 text-sm font-bold text-emerald-600 text-left">${cost}</td>
                    <td class="py-4 px-4 text-sm text-left">
                        <span class="px-3 py-1 rounded-full text-xs ${statusClass} uppercase tracking-wider">${s.status}</span>
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

    filterAndRender() {
        const searchQuery = (document.getElementById('search-sessions')?.value || '').toLowerCase().trim();
        const statusFilter = document.getElementById('status-filter')?.value || 'All';
        const stationFilter = document.getElementById('station-filter')?.value || 'All';

        let sessions = [...(this.allPeriodSessions || [])];

        // 1. Filter by Status
        if (statusFilter !== 'All') {
            sessions = sessions.filter(s => s.status === statusFilter);
        }

        // 2. Filter by Station
        if (stationFilter !== 'All') {
            sessions = sessions.filter(s => s.station === stationFilter);
        }

        // 3. Filter by Search Query (User name, email, station name)
        if (searchQuery !== '') {
            sessions = sessions.filter(s => {
                const station = this.currentStations.find(st => st.id === s.station);
                const stationName = (station ? station.name : (s.stationName || '')).toLowerCase();
                const userId = (s.user || '').toLowerCase();
                
                const cachedUser = this.userCache[s.user] || {};
                const userName = (cachedUser.name || '').toLowerCase();
                const userEmail = (cachedUser.subtitle || '').toLowerCase();

                return stationName.includes(searchQuery) ||
                       userId.includes(searchQuery) ||
                       userName.includes(searchQuery) ||
                       userEmail.includes(searchQuery);
            });
        }

        this.currentSessions = sessions;
        this.sortSessions();
        this.renderHistoryTable(this.currentSessions, this.currentStations);
        this.updateSortHeaders();
    },

    exportCSV() {
        if (!this.currentSessions || this.currentSessions.length === 0) {
            alert('No session data available to export.');
            return;
        }

        let csv = 'User ID,Customer Name,Customer Email,Station,Date,Duration (min),Energy (kWh),Amount (Rs),Status\n';
        this.currentSessions.forEach(s => {
            const station = this.currentStations.find(st => st.id === s.station);
            const stationName = station ? station.name : (s.stationName || 'Unknown');
            
            const dateStr = s.createdAt?.toDate 
                ? s.createdAt.toDate().toISOString() 
                : (s.createdAt ? new Date(s.createdAt).toISOString() : 'N/A');

            let durationMins = 0;
            if (s.startTime && s.endTime) {
                const start = s.startTime.toDate ? s.startTime.toDate() : new Date(s.startTime);
                const end = s.endTime.toDate ? s.endTime.toDate() : new Date(s.endTime);
                durationMins = Math.floor((end - start) / 60000);
            }

            const cachedUser = this.userCache[s.user] || {};
            const userName = cachedUser.name || s.user || 'Unknown';
            const userEmail = cachedUser.subtitle || 'N/A';

            const cleanUser = userName.replace(/,/g, '');
            const cleanEmail = userEmail.replace(/,/g, '');
            const cleanStation = stationName.replace(/,/g, '');

            csv += `"${s.user || ''}","${cleanUser}","${cleanEmail}","${cleanStation}","${dateStr}",${durationMins},${s.energyDelivered || 0},${s.totalCost || 0},"${s.status || ''}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `EV_Sessions_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    handleSort(field) {
        if (this.sortField === field) {
            this.sortAsc = !this.sortAsc;
        } else {
            this.sortField = field;
            this.sortAsc = true;
        }
        
        this.sortSessions();
        this.renderHistoryTable(this.currentSessions, this.currentStations);
        this.updateSortHeaders();
    },

    sortSessions() {
        this.currentSessions.sort((a, b) => {
            let valA, valB;
            
            switch (this.sortField) {
                case 'user':
                    valA = a.user || '';
                    valB = b.user || '';
                    break;
                case 'station':
                    const sA = this.currentStations.find(st => st.id === a.station);
                    const sB = this.currentStations.find(st => st.id === b.station);
                    valA = sA ? sA.name : (a.stationName || '');
                    valB = sB ? sB.name : (b.stationName || '');
                    break;
                case 'date':
                    valA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
                    valB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
                    break;
                case 'duration':
                    valA = 0;
                    valB = 0;
                    if (a.startTime && a.endTime) {
                        const start = a.startTime.toDate ? a.startTime.toDate() : new Date(a.startTime);
                        const end = a.endTime.toDate ? a.endTime.toDate() : new Date(a.endTime);
                        valA = end - start;
                    }
                    if (b.startTime && b.endTime) {
                        const start = b.startTime.toDate ? b.startTime.toDate() : new Date(b.startTime);
                        const end = b.endTime.toDate ? b.endTime.toDate() : new Date(b.endTime);
                        valB = end - start;
                    }
                    break;
                case 'energy':
                    valA = typeof a.energyDelivered === 'number' ? a.energyDelivered : 0;
                    valB = typeof b.energyDelivered === 'number' ? b.energyDelivered : 0;
                    break;
                case 'cost':
                    valA = typeof a.totalCost === 'number' ? a.totalCost : 0;
                    valB = typeof b.totalCost === 'number' ? b.totalCost : 0;
                    break;
                case 'status':
                    valA = a.status || '';
                    valB = b.status || '';
                    break;
                default:
                    return 0;
            }
            
            if (valA < valB) return this.sortAsc ? -1 : 1;
            if (valA > valB) return this.sortAsc ? 1 : -1;
            return 0;
        });
    },

    updateSortHeaders() {
        const headers = document.querySelectorAll('thead th[data-sort]');
        headers.forEach(h => {
            const field = h.getAttribute('data-sort');
            const icon = h.querySelector('.sort-icon');
            if (icon) {
                if (field === this.sortField) {
                    icon.innerText = this.sortAsc ? ' ▲' : ' ▼';
                } else {
                    icon.innerText = '';
                }
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
    },

    renderEmptyState() {
        document.getElementById('analytics-revenue').innerText = 'Rs. 0';
        document.getElementById('analytics-energy').innerHTML = `0 <span class="text-xl text-slate-400">kWh</span>`;
        document.getElementById('analytics-sessions').innerText = '0';
        document.getElementById('top-performer-container').innerHTML = '<p class="text-slate-400 italic text-center">No stations added yet.</p>';
        const tbody = document.getElementById('history-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400 italic">No stations or sessions found.</td></tr>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AnalyticsController.init();
});
