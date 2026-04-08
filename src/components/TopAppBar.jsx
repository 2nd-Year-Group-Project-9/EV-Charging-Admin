const TopAppBar = ({ title }) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl flex justify-between items-center px-8 py-3 shadow-[0px_24px_48px_rgba(0,83,91,0.06)]">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-teal-800 dark:text-teal-200">
          {title || "Dashboard Overview"}
        </h2>
        <div className="relative max-w-md w-full hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">search</span>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50" 
            placeholder="Search infrastructure..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-500">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Super Admin</p>
          </div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Id8rqWPEra2yhIUZCSNLCJSmty4OKIRpLK6uWv8ojJmqDLGiNpSsiwZEUPep09AtkLYSVhuwRegTC3uLvtebVz18-16W-f4SKBcTvU8iYBF9_O_Sj1Ae9xAYASa4zcAWkrGx5IL-OI4QbLFON4_c78G1xQs7oei4mgFNd0tyGWfYBtssL2RY5KrZ5MTW0W0kq6Fy9RtsNpdW7m7QqfkGaWg1HyFLJONawfPyhFrjkYWMKQtFToEM4ZOyZSKVya44XX6VwpOaDb-4" 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
          />
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
