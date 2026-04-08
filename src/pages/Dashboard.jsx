import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getStations as fetchStations, getActivities } from '../utils/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const incomeData = [
  { name: 'Mon', income: 4200 },
  { name: 'Tue', income: 5900 },
  { name: 'Wed', income: 4800 },
  { name: 'Thu', income: 7200 },
  { name: 'Fri', income: 6800 },
  { name: 'Sat', income: 9400 },
  { name: 'Sun', income: 11200 },
];

const Dashboard = () => {
  const [stations, setStations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, activitiesRes] = await Promise.all([
          fetchStations(),
          getActivities()
        ]);
        if (stationsRes.data.success) {
          setStations(stationsRes.data.data || []);
        }
        if (activitiesRes.data.success) {
          setActivities(activitiesRes.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to format relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary to-primary-container p-6 rounded-full text-white shadow-lg flex flex-col justify-between min-h-[180px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Revenue</p>
              <h2 className="font-headline text-4xl font-extrabold mt-1">Rs. 0.00</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-tertiary-fixed text-xs font-bold bg-tertiary-container/30 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
              +0.0%
            </span>
            <span className="text-[10px] opacity-70 uppercase font-medium">vs last month</span>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined !text-[120px]">monetization_on</span>
          </div>
        </motion.div>

        {/* Total Users Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-6 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.06)] flex flex-col justify-between border border-transparent hover:border-primary/10 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Users</p>
            <h2 className="font-headline text-3xl font-extrabold mt-1 text-on-surface">0</h2>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-tertiary font-bold text-sm">+0</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">New today</span>
            </div>
            <div className="w-12 h-12 bg-primary-fixed-dim/20 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
        </motion.div>

        {/* Active Stations Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest p-6 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.06)] flex flex-col justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Stations</p>
            <h2 className="font-headline text-3xl font-extrabold mt-1 text-on-surface">
              {loading ? '...' : `${stations.filter(s => s.operatingStatus === 'Opened').length} / ${stations.length}`}
            </h2>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex-1 mr-4">
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-tertiary transition-all duration-500" 
                  style={{ width: `${stations.length > 0 ? (stations.filter(s => s.operatingStatus === 'Opened').length / stations.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-tertiary-fixed-dim/20 text-tertiary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">ev_station</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-white">
            <div className="flex justify-between items-center mb-8 px-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-primary">Income Over Time</h3>
                <p className="text-xs text-on-surface-variant mt-1 font-medium italic">Revenue distribution across the Plug Me grid</p>
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2 rounded-full bg-white text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5 hover:bg-slate-50 transition-colors">Daily</button>
                <button className="px-5 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Weekly</button>
                <button className="px-5 py-2 rounded-full bg-white text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5 hover:bg-slate-50 transition-colors">Monthly</button>
              </div>
            </div>
            
            <div className="h-72 w-full px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00535b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00535b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ color: '#00535b', fontWeight: 'bold' }}
                    formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#00535b" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={2000}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#6b7280' }} 
                    dy={15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-xl font-bold text-primary">Station Occupancy</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Optimized</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-around gap-6 px-4">
              {[
                { label: 'HUB-A', height: '60%', color: 'bg-secondary-fixed' },
                { label: 'HUB-B', height: '85%', color: 'bg-primary' },
                { label: 'CITY-W', height: '45%', color: 'bg-secondary-fixed' },
                { label: 'CITY-E', height: '70%', color: 'bg-tertiary' },
                { label: 'MALL-X', height: '90%', color: 'bg-primary' },
                { label: 'AIR-1', height: '30%', color: 'bg-secondary-fixed' },
              ].map(bar => (
                <div key={bar.label} className="w-full flex flex-col items-center gap-2">
                  <div className={`w-full ${bar.color} rounded-t-full transition-all hover:brightness-95`} style={{ height: bar.height }}></div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-surface-container-lowest p-8 rounded-full shadow-[0px_24px_48px_rgba(0,83,91,0.06)] h-fit sticky top-24">
          <h3 className="font-headline text-xl font-bold text-primary mb-6">Live Feed</h3>
          <div className="space-y-8 min-h-[200px]">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                <p className="text-xs font-bold uppercase tracking-widest text-center">No recent activity detected on the grid.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <ActivityItem 
                  key={activity._id}
                  icon={activity.icon || 'history'} 
                  title={activity.action.replace(/_/g, ' ')} 
                  subtitle={`${activity.description} (By ${activity.adminName})`} 
                  time={formatTime(activity.createdAt)} 
                  variant={activity.variant || 'primary'} 
                />
              ))
            )}
          </div>
          <button className="w-full mt-10 py-3 rounded-full border-2 border-primary/10 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, subtitle, time, variant }) => {
  const variantClasses = {
    tertiary: 'bg-tertiary-fixed text-tertiary',
    primary: 'bg-primary-fixed text-primary',
    error: 'bg-error-container text-error',
    secondary: 'bg-secondary-fixed text-secondary',
  };

  return (
    <div className="flex gap-4 group cursor-pointer">
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variantClasses[variant]}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-surface-container-high"></div>
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">{subtitle}</p>
        <p className="text-[10px] text-primary/60 font-bold uppercase mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
