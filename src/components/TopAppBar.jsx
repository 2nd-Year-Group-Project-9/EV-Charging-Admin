const TopAppBar = ({ title }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md flex justify-between items-center px-8 py-3 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-teal-800 dark:text-teal-200">
          {title || "Dashboard Overview"}
        </h2>
        <div className="relative max-w-md w-full hidden lg:block">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 z-10">search</span>
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none" 
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
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">{user.firstName || 'Admin'} {user.lastName || ''}</p>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">{user.role || 'Super Admin'}</p>
          </div>
          <img 
            src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=00535b&color=fff`}
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
          />
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
