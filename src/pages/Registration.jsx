import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/api';

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await register({ ...formData, role: 'admin' });
      if (response.data.success) {
        // Automatically redirect to login page as requested
        navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
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
        className="max-w-xl w-full glass-card p-10 rounded-[2.5rem] shadow-[0px_48px_96px_rgba(0,83,91,0.08)] relative z-10 border border-white"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-3xl">how_to_reg</span>
          </div>
          <h1 className="font-headline text-3xl font-black text-primary tracking-tight">Create Admin Account</h1>
          <p className="text-on-surface-variant mt-2 font-medium">Join the Plug Me infrastructure network</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-error-container text-error text-xs font-bold rounded-2xl border border-error/10 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">warning</span>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">First Name</label>
              <input 
                type="text" 
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-full py-3.5 px-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Identity (Email)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-full py-3.5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
                placeholder="admin@plugme.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Secure Code (Password)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-full py-3.5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-2">Contact Node (Phone)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">call</span>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-full py-3.5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-outline/50 font-medium" 
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[0.98] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                Register Administrator
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">person_add</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-on-surface-variant font-medium">Already have an admin node?</p>
          <Link to="/login" className="text-sm font-bold text-primary mt-1 inline-block hover:underline">Sign In to Console</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Registration;
