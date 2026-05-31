import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { LayoutGrid, Activity, BarChart2, Settings, Database } from 'lucide-react';

const WorkflowBuilder = lazy(() => import('../builder/pages/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder })));
const ObservabilityDashboard = lazy(() => import('../dashboard/components/ObservabilityDashboard').then(m => ({ default: m.ObservabilityDashboard })));
const AnalyticsDashboard = lazy(() => import('../dashboard/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const TenantDashboard = lazy(() => import('../builder/pages/TenantDashboard').then(m => ({ default: m.TenantDashboard })));
const DLQDashboard = lazy(() => import('../dashboard/components/DLQDashboard').then(m => ({ default: m.DLQDashboard })));

const TABS = [
  { id: 'BUILDER', label: 'Canvas', icon: LayoutGrid,dot:false },
  { id: 'DASHBOARD', label: 'Telemetry', icon: Activity, dot: true },
  { id: 'ANALYTICS', label: 'Analytics', icon: BarChart2,dot:false },
  { id: 'TENANT', label: 'Settings', icon: Settings,dot:false },
  { id: 'DLQ', label: 'Operations', icon: Database,dot:false }
] as const;

export const GlobalLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-9999">
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
        className="absolute inset-0 border border-indigo-500/10 border-t-indigo-500/80 rounded-full blur-[1px]" 
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
        className="absolute inset-3 border border-purple-500/10 border-b-purple-500/80 rounded-full blur-[1px]" 
      />
      <motion.div 
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
        className="w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]" 
      />
    </div>
    
    <motion.h1 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="mt-8 text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300 tracking-[0.25em] uppercase"
    >
      EventFlux
    </motion.h1>
    
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-2 text-[10px] text-gray-500 tracking-[0.3em] uppercase font-mono"
    >
      Initializing Workspace
    </motion.p>
  </div>
);

const LocalLoader = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <div className="flex items-center gap-2 p-4 bg-white/2 border border-white/5 backdrop-blur-md rounded-2xl shadow-2xl">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"
        />
      ))}
    </div>
  </div>
);

export const MainWorkspace = () => {
  const [activeView, setActiveView] = useState<typeof TABS[number]['id']>('BUILDER');
  
  // Premium Blur-Fade Transitions
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 10, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.3, ease: "easeInOut" } }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans text-gray-100 flex flex-col">
      
      {/* Ambient Background Orbs */}
      <motion.div 
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-10 pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative grow w-full h-full z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <Suspense fallback={<LocalLoader />}>
              {activeView === 'BUILDER' && (
                <div className="w-full h-screen relative -mt-px">
                  <WorkflowBuilder />
                </div>
              )}
              {activeView === 'DASHBOARD' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><ObservabilityDashboard /></div>}
              {activeView === 'ANALYTICS' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><AnalyticsDashboard /></div>}
              {activeView === 'TENANT' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><TenantDashboard /></div>}
              {activeView === 'DLQ' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><DLQDashboard /></div>}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The Floating Dock */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-w-[95vw] overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab) => {
          const isActive = activeView === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className="relative px-5 py-2.5 cursor-pointer rounded-full text-xs font-semibold transition-colors duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 group focus:outline-none"
            >
              {/* Sliding Active Background (The Magic) */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-full shadow-inner"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Text & Icon Content */}
              <div className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                <Icon size={14} className={isActive ? "text-indigo-400" : "opacity-70"} />
                {tab.label}
                
                {/* Optional Pulse Dot */}
                {tab.dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-500/50'} transition-all duration-300`} />
                )}
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};