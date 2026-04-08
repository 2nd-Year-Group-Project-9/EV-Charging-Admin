import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getStations as fetchStations } from '../utils/api';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetchStations();
        if (response.data.success && response.data.data.length > 0) {
          setStations(response.data.data);
        } else {
          // Fallback to mock data if empty
          setStations(mockStations);
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        setStations(mockStations);
      } finally {
        setLoading(false);
      }
    };
    loadStations();
  }, []);

  const statCards = [
    { title: 'Total Stations', value: '1,248', icon: 'ev_station', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Online Now', value: '1,192', icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary-fixed/30' },
    { title: 'Maintenance', value: '14', icon: 'warning', color: 'text-error', bg: 'bg-error-container/50' },
    { title: 'Avg Load', value: '84.2%', icon: 'bolt', color: 'text-secondary', bg: 'bg-secondary-fixed/50' },
  ];

  const mockStations = [
    { _id: 'PM-4402-NY', name: 'VoltHub Prime-01', owner: 'Solarize Infrastructure', tier: 'Tier 1 Partner', location: 'Midtown, New York', address: '42nd St & 5th Ave', status: 'Available', pricing: '$0.42', pricingType: 'DYNAMIC' },
    { _id: 'PM-2918-CH', name: 'EchoCharge North', owner: 'Metropolis Energy', tier: 'Fleet Account', location: 'Loop, Chicago', address: 'W Wacker Dr', status: 'Busy', pricing: '$0.38', pricingType: 'FIXED' },
    { _id: 'PM-8812-SF', name: 'Pacific Grid Terminal', owner: 'WestCoast Power', tier: 'Direct Utility', location: 'SoMa, San Francisco', address: 'Brannan St', status: 'Maintenance', pricing: '$0.55', pricingType: 'PEAK RATE' },
    { _id: 'PM-3301-AT', name: 'NeoCharge Express', owner: 'Urban Renewables', tier: 'Strategic Partner', location: 'Buckhead, Atlanta', address: 'Peachtree Rd', status: 'Available', pricing: '$0.35', pricingType: 'OFF-PEAK' },
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
            className="bg-surface-container-low p-6 rounded-full flex items-center gap-5"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">{stat.title}</p>
              <p className={`font-headline text-2xl font-bold ${stat.color === 'text-primary' ? '' : stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Table */}
      <section className="bg-surface-container-lowest rounded-full overflow-hidden shadow-[0px_24px_48px_rgba(0,83,91,0.04)]">
        <div className="p-8 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold flex items-center gap-3">
            Infrastructure Inventory
            <span className="text-xs font-bold bg-primary-container/20 text-primary px-2 py-0.5 rounded text-center">428 Active</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">sort</span>
              Sorted by: <span className="font-bold text-on-surface">Most Recent</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Station Name & ID</th>
                <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Network Owner</th>
                <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Location</th>
                <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Status</th>
                <th className="text-left px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Pricing (kWh)</th>
                <th className="text-right px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-on-surface-variant font-bold">Synchronizing with grid...</p>
                  </td>
                </tr>
              ) : stations.map((station) => (
                <tr key={station._id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-8 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">charger</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{station.name}</p>
                        <p className="text-xs text-on-surface-variant">ID: {station.stationId || station._id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10">
                    <p className="font-semibold text-sm">{station.owner || 'Independent'}</p>
                    <p className="text-xs text-on-surface-variant">{station.tier || 'Fleet Node'}</p>
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-dim border border-outline-variant/10">
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xs">map</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{station.locationName || station.address?.city || 'Unknown Location'}</p>
                        <p className="text-[10px] text-on-surface-variant">{station.address?.street || 'No Address Provided'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10">
                    <StatusBadge status={station.status || (station.isActive ? 'Available' : 'Maintenance')} />
                  </td>
                  <td className="px-8 py-10">
                    <p className="font-headline font-bold text-primary">${station.pricePerKwh || '0.00'}</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold">{station.pricingType || 'DYNAMIC'}</p>
                  </td>
                  <td className="px-8 py-10 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationFooter />
      </section>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const configs = {
    'Available': 'bg-tertiary-fixed text-on-tertiary-fixed-variant dot-bg-tertiary',
    'Busy': 'bg-secondary-fixed text-on-secondary-fixed-variant dot-bg-secondary',
    'Maintenance': 'bg-surface-dim text-on-surface-variant dot-bg-outline',
  };

  const getDotClass = () => {
    if (status === 'Available') return 'bg-tertiary';
    if (status === 'Busy') return 'bg-secondary';
    return 'bg-outline';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${configs[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotClass()}`}></span>
      {status}
    </span>
  );
};

const PaginationFooter = () => (
  <div className="px-8 py-6 flex items-center justify-between bg-surface-container-low/30 border-t border-surface-container/20">
    <p className="text-sm text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-4</span> of 428 stations</p>
    <div className="flex items-center gap-2">
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white text-on-surface-variant disabled:opacity-30" disabled>
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-on-primary font-bold text-sm">1</button>
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white text-on-surface font-bold text-sm">2</button>
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white text-on-surface font-bold text-sm">3</button>
      <span className="mx-1 text-on-surface-variant">...</span>
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white text-on-surface font-bold text-sm">107</button>
      <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white text-on-surface-variant">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
);

export default Stations;
