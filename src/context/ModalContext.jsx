import React, { createContext, useContext, useState } from 'react';
import { createStation } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openAddStation = () => setIsAddStationOpen(true);
  const closeAddStation = () => setIsAddStationOpen(false);

  const handleCreateStation = async (formData) => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        },
        totalPorts: parseInt(formData.totalPorts),
        availablePorts: parseInt(formData.totalPorts),
        pricePerKwh: parseFloat(formData.pricePerKwh)
      };

      const response = await createStation(submissionData);
      if (response.data.success) {
        closeAddStation();
        setRefreshTrigger(prev => prev + 1); // Trigger refresh for any listeners (like Stations page)
        return { success: true };
      }
    } catch (error) {
      console.error('Global Modal: Failed to create station:', error);
      return { success: false, error: 'Failed to synchronize with grid.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalContext.Provider value={{ 
      openAddStation, 
      closeAddStation, 
      isAddStationOpen, 
      handleCreateStation, 
      isSubmitting,
      refreshTrigger 
    }}>
      {children}
      <AnimatePresence>
        {isAddStationOpen && (
          <StationModal 
            onClose={closeAddStation} 
            onSubmit={handleCreateStation}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModals = () => useContext(ModalContext);

const StationModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    totalPorts: '1',
    pricePerKwh: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/20 backdrop-blur-2xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-white rounded-[3.5rem] shadow-[0px_32px_128px_rgba(0,0,0,0.15)] w-full max-w-2xl overflow-hidden border border-white"
      >
        <div className="p-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="font-headline text-4xl font-black text-primary tracking-tight">Expansion Portal</h3>
              <p className="text-on-surface-variant font-bold mt-2 uppercase text-[10px] tracking-widest opacity-60">Grid Infrastructure Registration</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200/50">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Identity (Station Name)</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
                placeholder="e.g. VoltHub Prime-01"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Geographic Node Address</label>
              <input 
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
                placeholder="Street address, City, County"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Latitude Coordinate</label>
              <input 
                required
                type="number"
                step="any"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
                placeholder="40.7128"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Longitude Coordinate</label>
              <input 
                required
                type="number"
                step="any"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
                placeholder="-74.0060"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Energy Ports</label>
              <input 
                required
                type="number"
                min="1"
                name="totalPorts"
                value={formData.totalPorts}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-6 mb-2 block">Rate per kWh (Rs.)</label>
              <input 
                required
                type="number"
                step="0.01"
                name="pricePerKwh"
                value={formData.pricePerKwh}
                onChange={handleChange}
                className="w-full px-8 py-5 bg-slate-50 rounded-full border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-on-surface shadow-inner"
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2 mt-10 flex gap-5">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-5 bg-slate-100 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                className="flex-[2] py-5 bg-primary text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Synchronizing Grid...' : 'Commission Node'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
