import { NavLink, useNavigate } from 'react-router-dom';
import { useModals } from '../context/ModalContext';

const SideNavBar = () => {
  const navigate = useNavigate();
  const { openAddStation } = useModals();
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Charging Stations', icon: 'ev_station', path: '/stations' },
    { name: 'Energy Grid', icon: 'bolt', path: '/grid' },
    { name: 'Revenue', icon: 'payments', path: '/revenue' },
    { name: 'User Management', icon: 'group', path: '/admins' },
    { name: 'System Logs', icon: 'history', path: '/logs' },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-950 flex flex-col p-4 gap-2 z-50">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-white">bolt</span>
        </div>
        <div>
          <h1 className="text-teal-900 dark:text-teal-100 font-black text-xl leading-tight">Plug Me</h1>
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500">Energy Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 uppercase text-xs font-semibold tracking-wide ${
                isActive
                  ? 'text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-500 hover:translate-x-1'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
        <button 
          onClick={openAddStation}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-transform duration-200 mb-6"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="text-sm">Add New Station</span>
        </button>
        <div className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide hover:text-teal-500 transition-colors">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideNavBar;
