import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clear state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-[0px_48px_96px_rgba(0,83,91,0.08)] relative z-10 border border-white"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-3xl">bolt</span>
          </div>
          <h1 className="font-headline text-3xl font-black text-primary tracking-tight">Plug Me Console</h1>
          <p className="text-on-surface-variant mt-2 font-medium">Infrastructure Management Portal</p>
        </div>

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold rounded-2xl border border-tertiary/10 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {successMsg}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-error-container text-error text-xs font-bold rounded-2xl border border-error/10 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">warning</span>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Grid Identity (Email)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
              <input 
                type="email" 
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-full py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Access Key (Password)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
              <input 
                type="password" 
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-high border-none rounded-full py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[0.98] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                Initiate Secure Access
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-on-surface-variant font-medium">New administrator terminal needed?</p>
          <Link to="/register" className="text-sm font-bold text-primary mt-1 inline-block hover:underline">Register New Admin Node</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
