import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAdmins as fetchAdmins } from '../utils/api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await fetchAdmins();
        if (response.data.success && response.data.admins.length > 0) {
          setAdmins(response.data.admins);
        } else {
          setAdmins(mockAdmins);
        }
      } catch (error) {
        console.error('Failed to fetch admins:', error);
        setAdmins(mockAdmins);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);

  const mockAdmins = [
    { name: 'Alex Rivers', role: 'Regional Supervisor', email: 'alex.rivers@plugme.com', phone: '+1 (555) 0123 456', status: 'Approved', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTIaMeiPEioBsGcZnFNfbMMPUJ9qRjTqpRGOLWCbTXogILS4u-Ze8tgFcX3CR38sduTx2C7SLL1ekCp2kXqUfjJd80vbTDN0nOQy4p_9zon4MD2-eyim0YrIQamhUdLHPu8UtFfrsv_lJv33FmZcDPWTFRSiwfYq0D-XySkD6LZIS2E23M8j6s_nOb0AgAbk8AKEw6i5FwXL1RKrvgWPCGR_lkdY0pdpWZj_xnR_u5Ps_d4SXyDd9AHqxLYxaTrpyYiHv-qKpgHIL' },
    { name: 'Jordan Smith', role: 'Maintenance Lead', email: 'j.smith@plugme.com', phone: '+1 (555) 0987 654', status: 'Pending', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiknaBQKb_Nj7u0qUMS2_ReGyls1qm51KOuezIjr6zipc4bvZ5WylstVKPnY4E8tKTdV0PVYXJX60fS4eC-blzn-hB971ZIFEe73rDabCfYiliuI5yAptR8vF-oyeeW46jHHdk2VPpJAC6rTFbe9g_90AGWX-4R3N6BcC9Mc4YLkKqx96sGzws67yk2TGY1abJAxLJYlDEuAtfHdPAqIs99aTGrkFWoSYBp4mUE7QL_TBrGGqST-q9deI2IjmD8JBTgyWspIJB4vLZ' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">User Management</h2>
          <p className="text-on-surface-variant text-lg">System-wide administrative control and access review.</p>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
          <span className="material-symbols-outlined">person_add</span>
          Invite New Admin
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-sm border border-white/50">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
          <div className="flex-1 w-full relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">filter_list</span>
            <input 
              type="text" 
              className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400 outline-none" 
              placeholder="Filter by admin name or email address..." 
            />
          </div>
          <div className="flex gap-1 p-1 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
              <button 
                key={filter}
                className={`px-6 py-2 rounded-full text-[10px] font-bold transition-all ${
                  filter === 'ALL' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-1">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-left text-on-surface-variant">
                <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.15em]">Admin User</th>
                <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.15em]">Contact Info</th>
                <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.15em]">Access Status</th>
                <th className="px-6 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-on-surface-variant font-bold">Retrieving administrative personnel...</p>
                  </td>
                </tr>
              ) : admins.map((admin, i) => (
                <motion.tr 
                  key={admin.id || admin.email}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group hover:translate-y-[-2px] transition-transform duration-200"
                >
                  <td className="bg-white px-6 py-5 rounded-l-3xl shadow-sm border-y border-l border-surface-container-high">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-fixed-dim flex items-center justify-center overflow-hidden ring-2 ring-primary/5">
                        <img src={admin.img || `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=00535b&color=fff`} alt={admin.firstName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{admin.firstName} {admin.lastName}</p>
                        <p className="text-xs text-on-surface-variant font-medium capitalize">{admin.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="bg-white px-6 py-5 shadow-sm border-y border-surface-container-high">
                    <p className="text-sm font-semibold text-primary">{admin.email}</p>
                    <p className="text-xs text-on-surface-variant">{admin.phoneNumber || 'N/A'}</p>
                  </td>
                  <td className="bg-white px-6 py-5 shadow-sm border-y border-surface-container-high">
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      admin.status === 'Approved' || admin.role === 'superadmin' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    }`}>
                      {admin.status || 'Active'}
                    </span>
                  </td>
                  <td className="bg-white px-6 py-5 rounded-r-3xl shadow-sm border-y border-r border-surface-container-high text-right">
                    <div className="flex justify-end gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-primary-fixed-dim text-primary transition-all" title="View Profile">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-error-container text-error transition-all" title="Revoke">
                          <span className="material-symbols-outlined">block</span>
                        </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
