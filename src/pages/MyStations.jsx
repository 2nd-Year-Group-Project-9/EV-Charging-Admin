import { motion } from 'framer-motion';

const MyStations = () => {
  const stationAssets = [
    { id: 'PM-290-X1', name: 'Tesla Superhub Alpha', location: 'San Francisco', status: 'Online', availability: 'Available (4/6)', variant: 'tertiary' },
    { id: 'PM-882-B4', name: 'GreenWay Plaza Connect', location: 'Austin', status: 'Busy', availability: 'Occupied (0/4)', variant: 'secondary' },
    { id: 'PM-115-Z9', name: 'Harbor Side FastCharge', location: 'Seattle', status: 'Maintenance', availability: 'Offline', variant: 'outline' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.04)] flex justify-between items-center overflow-hidden relative border border-white">
          <div className="z-10">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Assets</p>
            <h3 className="font-headline text-4xl font-extrabold text-primary">24 <span className="text-lg font-medium text-on-surface-variant">Units</span></h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <span className="material-symbols-outlined text-9xl">ev_station</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Uptime Rate</p>
          <h3 className="font-headline text-4xl font-extrabold text-tertiary">99.8%</h3>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white">
          <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Users</p>
          <h3 className="font-headline text-4xl font-extrabold text-secondary">1.2k</h3>
        </div>
      </section>

      {/* Stations List */}
      <section className="bg-surface-container-low rounded-full p-2">
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-white/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Station Name</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Location Preview</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant text-center">Availability</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {stationAssets.map((station) => (
                  <tr key={station.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-lg text-primary">{station.name}</span>
                        <span className="text-xs text-on-surface-variant">ID: {station.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-40 h-16 rounded-xl overflow-hidden shadow-inner bg-slate-200">
                        <div className="w-full h-full bg-slate-300 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        station.variant === 'tertiary' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' :
                        station.variant === 'secondary' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' :
                        'bg-surface-dim text-on-surface-variant'
                      }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          station.variant === 'tertiary' ? 'bg-tertiary animate-pulse' :
                          station.variant === 'secondary' ? 'bg-secondary' : 'bg-outline'
                        }`}></span>
                        <span className="text-sm font-semibold text-on-surface">{station.availability}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <ActionButton icon="visibility" />
                        <ActionButton icon="edit" />
                        <ActionButton icon="delete" variant="error" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Insights & Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-white flex flex-col justify-between aspect-square md:aspect-auto shadow-xl"
        >
          <div>
            <span className="material-symbols-outlined text-4xl mb-4">insights</span>
            <h4 className="font-headline text-2xl font-bold mb-2">Network Insights</h4>
            <p className="text-on-primary-container text-sm leading-relaxed max-w-xs">Your stations have seen a 12% increase in traffic this week. Consider upgrading capacity at Harbor Side.</p>
          </div>
          <button className="mt-6 self-start px-6 py-2 rounded-full bg-white text-primary font-bold text-sm hover:translate-x-1 transition-transform">View Analytics</button>
        </motion.div>
        
        <div className="bg-surface-container-highest p-8 rounded-3xl flex flex-col justify-between border border-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-headline text-2xl font-bold text-primary">System Health</h4>
              <p className="text-on-surface-variant text-sm">Real-time infrastructure monitoring</p>
            </div>
            <div className="px-3 py-1 bg-tertiary-fixed rounded-full text-[10px] font-black uppercase text-on-tertiary-fixed-variant shadow-sm border border-tertiary/20">All Clear</div>
          </div>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
            <HealthMetric label="Grid Load" value="120v" />
            <HealthMetric label="kW Flow" value="8.4k" />
            <HealthMetric label="Latency" value="2.1s" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, variant }) => (
  <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
    variant === 'error' ? 'text-on-surface-variant hover:bg-error-container hover:text-error' : 'text-on-surface-variant hover:bg-primary-fixed-dim hover:text-primary'
  }`}>
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
);

const HealthMetric = ({ label, value }) => (
  <div className="flex-shrink-0 w-24 h-24 bg-surface-container-lowest rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm border border-white/50">
    <span className="text-primary font-bold text-xl">{value}</span>
    <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-tighter">{label}</span>
  </div>
);

export default MyStations;
