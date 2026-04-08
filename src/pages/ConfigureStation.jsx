import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStation, createStation, updateStation } from '../utils/api';

const ConfigureStation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    pricePerKwh: 0.45,
    operatingStatus: 'Opened',
    totalPorts: 1,
    availablePorts: 1,
    connectorTypes: ['Type 2'],
    address: '',
    location: { type: 'Point', coordinates: [122.0575, 37.3875] },
  });

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const loadStation = async () => {
        try {
          const response = await getStation(id);
          if (response.data.success) {
            const s = response.data.station;
            setFormData({
              name: s.name || '',
              pricePerKwh: s.pricePerKwh || 0.45,
              operatingStatus: s.operatingStatus || 'Opened',
              totalPorts: s.totalPorts || 1,
              availablePorts: s.availablePorts || 1,
              connectorTypes: s.connectorTypes || ['Type 2'],
              address: s.address || '',
              location: s.location || { type: 'Point', coordinates: [122.0575, 37.3875] },
            });
          }
        } catch (error) {
          console.error('Failed to load station:', error);
        } finally {
          setLoading(false);
        }
      };
      loadStation();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateStation(id, formData);
      } else {
        await createStation(formData);
      }
      navigate('/stations');
    } catch (error) {
      console.error('Failed to save station:', error);
      alert('Error saving station configuration. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectorToggle = (type) => {
    setFormData(prev => {
      const types = prev.connectorTypes.includes(type)
        ? prev.connectorTypes.filter(t => t !== type)
        : [...prev.connectorTypes, type];
      return { ...prev, connectorTypes: types };
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex gap-2 text-on-surface-variant text-sm mb-2 font-medium">
            <span>Stations</span>
            <span className="material-symbols-outlined text-xs leading-none self-center">chevron_right</span>
            <span className="text-primary font-semibold">Configure Station</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Configure Station</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Define operational parameters and hardware configuration for the grid node.</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/stations')} className="px-6 py-2.5 rounded-full font-semibold text-primary border border-primary/20 hover:bg-primary/5 transition-all">Cancel</button>
          <button type="submit" className="px-8 py-2.5 rounded-full font-semibold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
            {isEdit ? 'Update Configuration' : 'Create Station'}
          </button>
        </div>
      </div>

      {/* Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* Core Details */}
          <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white/50">
            <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Core Details
            </h3>
            <div className="space-y-6">
              <FormField 
                label="Station Name" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. North Plaza Hub - Unit 4" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Price per kWh" 
                  name="pricePerKwh"
                  value={formData.pricePerKwh}
                  onChange={handleInputChange}
                  placeholder="0.45" 
                  type="number" 
                  prefix="$" 
                />
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Status</label>
                  <select 
                    name="operatingStatus"
                    value={formData.operatingStatus}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-high border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all appearance-none outline-none"
                  >
                    <option value="Opened">Operational</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="Total Ports" 
                  name="totalPorts"
                  value={formData.totalPorts}
                  onChange={handleInputChange}
                  type="number" 
                />
                <FormField 
                  label="Available Ports" 
                  name="availablePorts"
                  value={formData.availablePorts}
                  onChange={handleInputChange}
                  type="number" 
                />
              </div>
              <FormField 
                label="Address" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Energy Way, City, State" 
              />
            </div>
          </section>

          {/* Charging Ports */}
          <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white/50">
            <h3 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">electric_bolt</span>
              Charging Ports
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <PortCheckbox 
                id="ccs2" label="CCS2" sub="Fast DC" icon="ev_station" 
                checked={formData.connectorTypes.includes('CCS')} 
                onChange={() => handleConnectorToggle('CCS')}
              />
              <PortCheckbox 
                id="chademo" label="CHAdeMO" sub="Rapid Charge" icon="ev_station" 
                checked={formData.connectorTypes.includes('CHAdeMO')} 
                onChange={() => handleConnectorToggle('CHAdeMO')}
              />
              <PortCheckbox 
                id="type2" label="Type 2" sub="AC Standard" icon="bolt" 
                checked={formData.connectorTypes.includes('Type 2')} 
                onChange={() => handleConnectorToggle('Type 2')}
              />
              <PortCheckbox 
                id="type1" label="Type 1" sub="Standard" icon="bolt" 
                checked={formData.connectorTypes.includes('Type 1')} 
                onChange={() => handleConnectorToggle('Type 1')}
              />
              <PortCheckbox 
                id="tesla" label="Tesla" sub="Supercharger" icon="electric_car" 
                checked={formData.connectorTypes.includes('Tesla')} 
                onChange={() => handleConnectorToggle('Tesla')}
              />
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-outline-variant text-outline hover:text-primary hover:border-primary transition-all cursor-pointer group">
                <span className="material-symbols-outlined text-3xl mb-1 group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-xs font-bold uppercase tracking-tighter">Add Custom</span>
              </div>
            </div>
          </section>
        </div>

        {/* Geographic Node */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-surface-container-lowest overflow-hidden rounded-3xl shadow-[0px_24px_48px_rgba(0,83,91,0.04)] border border-white/50 h-full flex flex-col">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Geographic Node
              </h3>
              <div className="space-y-4">
                <FormField label="Search Address" placeholder="Silicon Valley Tech Center, CA" icon="search" />
                <div className="grid grid-cols-2 gap-4">
                  <Coordinates label="Latitude" value="37.3875° N" />
                  <Coordinates label="Longitude" value="122.0575° W" />
                </div>
              </div>
            </div>
            
            {/* Map Mockup */}
            <div className="relative flex-1 min-h-[400px] mt-4 bg-slate-200 flex items-center justify-center">
               <span className="material-symbols-outlined text-6xl text-slate-300">map</span>
               <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-primary text-white p-3 rounded-full shadow-2xl animate-pulse">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ev_station</span>
                    </div>
                    <div className="mt-2 glass-panel px-4 py-2 rounded-full shadow-lg border border-white/50 text-xs font-bold text-primary whitespace-nowrap">
                       Station Node A-12
                    </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

const FormField = ({ label, name, value, onChange, placeholder, type = "text", prefix, icon }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
    <div className="relative group">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">{icon}</span>}
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">{prefix}</span>}
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-surface-container-high border-none rounded-2xl py-3 focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none placeholder:text-outline/50 ${icon ? 'pl-12 pr-4' : prefix ? 'pl-8 pr-4' : 'px-4'}`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const PortCheckbox = ({ label, sub, icon, checked, onChange }) => (
  <label className="group relative flex flex-col p-4 rounded-2xl border-2 border-transparent bg-surface-container-low hover:bg-white hover:shadow-md cursor-pointer transition-all">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      className="absolute top-3 right-3 rounded text-primary focus:ring-primary h-5 w-5 border-outline-variant" 
    />
    <span className={`material-symbols-outlined text-3xl mb-2 ${checked ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
    <span className="font-bold text-on-surface">{label}</span>
    <span className="text-xs text-on-surface-variant font-medium">{sub}</span>
  </label>
);

const Coordinates = ({ label, value }) => (
  <div className="flex-1 space-y-1">
    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</span>
    <div className="bg-surface-container-low px-3 py-2 rounded-xl text-sm font-mono text-on-surface border border-white/50 shadow-inner">
      {value}
    </div>
  </div>
);

export default ConfigureStation;
