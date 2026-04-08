import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '$124,592.00', trend: '+12.5%', icon: 'payments', variant: 'primary' },
    { title: 'Total Users', value: '3,842', trend: '+214 today', icon: 'group', variant: 'surface' },
    { title: 'Active Stations', value: '48 / 52', progress: 92, icon: 'ev_station', variant: 'surface' },
  ];

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
              <h2 className="font-headline text-4xl font-extrabold mt-1">$124,592.00</h2>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center text-tertiary-fixed text-xs font-bold bg-tertiary-container/30 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
              +12.5%
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
            <h2 className="font-headline text-3xl font-extrabold mt-1 text-on-surface">3,842</h2>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-tertiary font-bold text-sm">+214</span>
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
            <h2 className="font-headline text-3xl font-extrabold mt-1 text-on-surface">48 / 52</h2>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex-1 mr-4">
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary w-[92%]"></div>
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
          <div className="bg-surface-container-low p-8 rounded-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-headline text-xl font-bold text-primary">Income Over Time</h3>
                <p className="text-xs text-on-surface-variant mt-1">Monthly revenue distribution across all regions</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full bg-white text-xs font-bold shadow-sm">Daily</button>
                <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold">Weekly</button>
                <button className="px-4 py-1.5 rounded-full bg-white text-xs font-bold shadow-sm">Monthly</button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
              <svg className="absolute bottom-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q20,20 40,60 T100,10" fill="none" stroke="#00535b" strokeWidth="2" />
                <path d="M0,80 Q20,20 40,60 T100,10 V100 H0 Z" fill="url(#gradient-chart)" />
                <defs>
                  <linearGradient id="gradient-chart" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00535b', stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: '#00535b', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="border-b border-primary w-full"></div>
                <div className="border-b border-primary w-full"></div>
                <div className="border-b border-primary w-full"></div>
                <div className="border-b border-primary w-full"></div>
              </div>
            </div>
            <div className="flex justify-between mt-4 px-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <span key={day} className="text-[10px] font-bold text-on-surface-variant uppercase">{day}</span>
              ))}
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
          <div className="space-y-8">
            <ActivityItem icon="electric_car" title="Session Started" subtitle="Station HUB-A #4 occupied by Tesla Model 3" time="2 mins ago" variant="tertiary" />
            <ActivityItem icon="paid" title="Payment Received" subtitle="Revenue of $42.50 finalized from session #8492" time="14 mins ago" variant="primary" />
            <ActivityItem icon="warning" title="Station Alert" subtitle="Station MALL-X #2 reported offline" time="48 mins ago" variant="error" />
            <ActivityItem icon="person_add" title="New User Joined" subtitle="Sara Jenkins registered via Apple Pay" time="1 hour ago" variant="secondary" />
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
