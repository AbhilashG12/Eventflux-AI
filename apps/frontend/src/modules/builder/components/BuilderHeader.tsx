import { useAuthStore } from '../../../core/store/auth.store';

export const BuilderHeader = ({ 
  onSave, 
  isSaving, 
  onTestRun 
}: { 
  onSave: () => void; 
  isSaving: boolean; 
  onTestRun: () => void; 
}) => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="h-16 border-b border-white/8 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 z-20">
      
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          <span className="text-white font-bold tracking-tighter">EF</span>
        </div>
        <h1 className="text-white font-semibold text-lg tracking-tight">
          EventFlux <span className="text-gray-500 font-normal">/ Canvas</span>
        </h1>
      </div>
      
      {/* Right: Aligned Action Group */}
      <div className="flex items-center gap-4">
        
        <button 
          onClick={onTestRun} 
          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Run Test
        </button>
        
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-white text-black px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-gray-200 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Publish'}
        </button>

        {/* Subtle visual divider */}
        <div className="w-px h-6 bg-white/10 mx-1 rounded-full"></div>

        <button 
          onClick={logout}
          className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        >
          Sign Out
        </button>

      </div>
    </div>
  );
};