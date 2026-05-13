import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/store/auth.store';

export const RegisterPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/register', { 
        email, 
        password, 
        companyName 
      });
      
      login(data.token, data.user);
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />

      <div className="relative z-10 w-full max-w-md p-10 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-white tracking-tight">Start building</h2>
          <p className="text-sm text-gray-400 mt-3">Deploy intelligent workflows in minutes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase ml-1">Organization Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black mt-2 py-4 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-white hover:text-purple-400 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};