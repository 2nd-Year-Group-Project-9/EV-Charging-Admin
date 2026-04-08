import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStation } from '../utils/api';

const StationDetails = () => {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        const response = await getStation(id);
        if (response.data.success) {
          setStation(response.data.station);
        }
      } catch (error) {
        console.error('Failed to fetch station details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStationDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-on-surface-variant font-bold">Accessing station node...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-error">Station Not Found</h2>
        <p className="text-on-surface-variant mt-2">The requested station node could not be located in the grid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Detail Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${station.isActive ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-surface-dim text-on-surface-variant'}`}>
              {station.isActive ? 'Operational' : 'Maintenance'}
            </span>
            <span className="text-on-surface-variant font-mono text-sm tracking-tight">ID: {station.stationId || station._id.substring(0, 8)}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight font-headline">{station.name}</h2>
          <p className="text-on-surface-variant max-w-lg">{station.locationName || (station.address ? `${station.address.city}, ${station.address.street}` : 'No location info available.')}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Flag Maintenance
          </button>
          <button className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">edit</span>
            Override Price/kWh
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Global Performance */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl shadow-[0px_24px_48px_rgba(0,83,91,0.06)] flex flex-col justify-between overflow-hidden relative border border-outline-variant/10"
        >
          <div className="relative z-10">
            <h3 className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-bold mb-1">Global Performance</h3>
            <p className="text-5xl font-headline font-extrabold text-primary">#14</p>
            <p className="text-sm text-tertiary font-semibold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">trending_up</span> Top 2% Network-wide
            </p>
          </div>
          <div className="mt-8 flex items-end gap-2 h-24">
            <div className="flex-1 bg-primary/10 rounded-t-lg h-1/2"></div>
            <div className="flex-1 bg-primary/10 rounded-t-lg h-2/3"></div>
            <div className="flex-1 bg-primary/20 rounded-t-lg h-3/4"></div>
            <div className="flex-1 bg-primary/40 rounded-t-lg h-4/5"></div>
            <div className="flex-1 bg-gradient-to-t from-primary to-primary-container rounded-t-lg h-full"></div>
          </div>
        </motion.div>

        {/* Live Metrics */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-3xl flex flex-col gap-8 shadow-sm">
          <div className="grid grid-cols-3 gap-8">
            <MetricBlock label="Active Power Load" value={station.isBusy ? "10.5" : "0.0"} unit="kW" />
            <MetricBlock label="Station Health" value={station.healthStatus} unit="" />
            <MetricBlock label="Rate / kWh" value={`$${station.pricePerKwh}`} unit="USD" />
          </div>
          <div className="h-32 w-full bg-surface-container-lowest rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 flex items-end px-4 gap-1">
              {[40, 45, 38, 50, 65, 75, 60, 55, 68, 80, 72, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-tertiary/20 rounded-t-full transition-all duration-1000" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <span className="relative z-10 text-xs font-bold text-tertiary uppercase tracking-tighter bg-white/80 px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-tertiary/10">Live Flow Monitoring</span>
          </div>
        </div>

        {/* Connector Status */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-6 rounded-3xl shadow-[0px_24px_48px_rgba(0,83,91,0.06)] border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-headline font-bold text-lg text-primary">Connector Status</h3>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
              {station.availablePorts} / {station.totalPorts} AVAILABLE
            </span>
          </div>
          <div className="space-y-4">
            {station.connectorTypes?.map((type, idx) => (
              <ConnectorItem 
                key={idx}
                label={`Port #${idx + 1} (${type})`} 
                desc={idx === 0 && station.isBusy ? "In Use" : "Standby"} 
                value={idx === 0 && station.isBusy ? "Charging" : "Available"} 
                status={idx === 0 && station.isBusy ? "reserved" : "active"} 
              />
            )) || <p className="text-center py-4 text-on-surface-variant">No connectors configured.</p>}
          </div>
        </div>

        {/* Grid Map Mockup */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-6 rounded-3xl relative overflow-hidden h-[400px] shadow-sm">
          <div className="absolute inset-0 z-0 bg-slate-200">
             {/* Map Placeholder */}
             <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-slate-400">map</span>
             </div>
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline font-bold text-lg text-primary">Local Grid Dynamics</h3>
                <p className="text-xs text-on-surface-variant">Kensington & Chelsea District</p>
              </div>
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-white/50">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">GRID STATUS</p>
                <p className="text-lg font-headline font-extrabold text-secondary">Optimal (42%)</p>
              </div>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-4">
              <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-white/50 shadow-sm">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Surrounding Demand</p>
                <p className="text-xl font-headline font-bold text-primary mt-1">High Intensity</p>
              </div>
              <div className="bg-white/90 backdrop-blur p-4 rounded-xl border border-white/50 shadow-sm">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Local Renewables</p>
                <p className="text-xl font-headline font-bold text-tertiary mt-1">12.5% Input</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBlock = ({ label, value, unit }) => (
  <div>
    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{label}</span>
    <p className="text-3xl font-headline font-extrabold text-primary mt-1">{value} <span className="text-lg font-medium opacity-60">{unit}</span></p>
  </div>
);

const ConnectorItem = ({ label, desc, value, status }) => {
  const statusClasses = {
    active: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    idle: 'bg-surface-variant text-on-surface-variant opacity-60',
    reserved: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm ${status === 'active' ? 'bg-white' : 'bg-surface-container-low'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusClasses[status]}`}>
          <span className="material-symbols-outlined">{status === 'reserved' ? 'bolt' : 'ev_charger'}</span>
        </div>
        <div>
          <p className="font-bold text-sm text-on-surface">{label}</p>
          <p className="text-xs text-on-surface-variant">{desc}</p>
        </div>
      </div>
      <span className={`text-xs font-bold ${status === 'active' ? 'text-tertiary' : status === 'reserved' ? 'text-secondary' : 'text-on-surface-variant'}`}>{value}</span>
    </div>
  );
};

export default StationDetails;
