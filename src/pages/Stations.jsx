import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getStations as fetchStations } from '../utils/api';
import { useModals } from '../context/ModalContext';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshTrigger } = useModals();

  const loadStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchStations();
      if (response.data.success) {
        setStations(response.data.data || []);
      } else {
        setError('Failed to synchronize infrastructure data.');
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setError('Network error: Unable to connect to the energy grid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, [refreshTrigger]);

  const statCards = [
    { title: 'Total Stations', value: stations.length.toLocaleString(), icon: 'ev_station', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Online Now', value: stations.filter(s => s.operatingStatus === 'Opened').length.toLocaleString(), icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary-fixed/30' },
    { title: 'Maintenance', value: stations.filter(s => s.operatingStatus === 'Maintenance').length.toLocaleString(), icon: 'warning', color: 'text-error', bg: 'bg-error-container/50' },
    { title: 'Avg Load', value: '0.0%', icon: 'bolt', color: 'text-secondary', bg: 'bg-secondary-fixed/50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-primary mb-2">Station Infrastructure</h2>
          <p className="text-on-surface-variant text-lg max-w-2xl">Global overview of all active charging units, maintenance status, and dynamic pricing across the Plug Me network.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-highest rounded-full text-sm font-bold flex items-center gap-2 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Export Report
          </button>
          <button className="px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg shadow-primary/10 flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-xl">tune</span>
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-low p-6 rounded-full flex items-center gap-5 border border-white/50 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">{stat.title}</p>
              <p className={`font-headline text-2xl font-bold ${stat.color.startsWith('text-primary') ? 'text-on-surface' : stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Table */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white">
        <div className="p-8 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold flex items-center gap-3">
            Infrastructure Inventory
            <span className="text-xs font-bold bg-primary-container/20 text-primary px-2 py-0.5 rounded text-center">{stations.length} Registered</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">sort</span>
              Sorted by: <span className="font-bold text-on-surface">Most Recent</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-on-surface-variant font-bold tracking-tight">Synchronizing with grid infrastructure...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-error/30 mb-4">cloud_off</span>
              <p className="text-on-surface font-bold text-lg">{error}</p>
              <p className="text-on-surface-variant text-sm mt-1">Please verify your database connection.</p>
            </div>
          ) : stations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-primary/20 mb-4">ev_station</span>
              <p className="text-on-surface font-bold text-lg">No Stations Detected</p>
              <p className="text-on-surface-variant text-sm mt-1">The infrastructure inventory is currently empty.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-surface-container">
                  <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Station Name & ID</th>
                  <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Hardwware Configuration</th>
                  <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Geographic Node</th>
                  <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                  <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pricing (kWh)</th>
                  <th className="text-right px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/30">
                {stations.map((station) => (
                  <tr key={station._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <span className="material-symbols-outlined text-primary text-2xl">charger</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{station.name}</p>
                          <p className="text-[10px] font-mono text-outline uppercase">UUID: {station._id.substring(18)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {station.connectorTypes?.map(type => (
                          <span key={type} className="text-[8px] font-black bg-surface-container-highest px-1.5 py-0.5 rounded uppercase">{type}</span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-on-surface-variant">{station.totalPorts} Ports Configured</p>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary/40 text-sm mt-0.5">location_on</span>
                        <div>
                          <p className="text-xs font-bold text-on-surface leading-snug truncate max-w-[180px]">{station.address || 'Global Network'}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">Node: {station.location?.coordinates?.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <StatusBadge status={station.operatingStatus || 'Opened'} />
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-headline font-black text-on-surface text-lg">Rs. {station.pricePerKwh?.toFixed(2) || '0.00'}</p>
                      <p className="text-[9px] text-primary font-bold uppercase tracking-tighter">Instant Rate</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => window.location.href=`/stations/${station._id}/edit`} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                           <span className="material-symbols-outlined text-lg">edit</span>
                         </button>
                         <button className="p-2 hover:bg-error/10 hover:text-error rounded-xl transition-all">
                           <span className="material-symbols-outlined text-lg">delete</span>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <PaginationFooter total={stations.length} />
      </section>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isMaintenance = status === 'Maintenance';
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${isMaintenance ? 'bg-error-container/20 text-error' : 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isMaintenance ? 'bg-error' : 'bg-tertiary'}`}></span>
      {isMaintenance ? 'Maintenance' : 'Optimal'}
    </span>
  );
};

const PaginationFooter = ({ total }) => (
  <div className="px-8 py-6 flex items-center justify-between bg-surface-container-low/30 border-t border-surface-container/20">
    <p className="text-sm text-on-surface-variant">Synchronized Infrastructure: <span className="font-bold text-on-surface">{total} Nodes</span></p>
    <div className="flex items-center gap-1.5">
      <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-on-surface-variant disabled:opacity-20 border border-transparent hover:border-surface-container transition-all" disabled>
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white font-bold text-sm shadow-md shadow-primary/20">1</button>
      <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-on-surface-variant border border-transparent hover:border-surface-container transition-all" disabled>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
);

export default Stations;
