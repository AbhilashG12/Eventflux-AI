import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useWorkflowStore } from '../../core/store/workflow.store';

const WorkflowBuilder = lazy(() => import('../builder/pages/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder })));
const ExecutionDashboard = lazy(() => import('../dashboard/components/ExecutionDashboard').then(m => ({ default: m.ExecutionDashboard })));
const TenantDashboard = lazy(() => import('../builder/pages/TenantDashboard').then(m => ({ default: m.TenantDashboard })));
const DLQDashboard = lazy(() => import('../dashboard/components/DLQDashboard').then(m => ({ default: m.DLQDashboard })));
const AnalyticsDashboard = lazy(() => import('../dashboard/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));

export const GlobalLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#090514] z-[9999]">
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }} 
        className="absolute inset-0 border border-indigo-500/20 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
        className="absolute inset-4 border border-purple-500/20 border-b-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
      />
      <motion.div 
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
        className="w-10 h-10 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)]" 
      />
    </div>
    
    <motion.h1 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="mt-8 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-[0.2em] uppercase"
    >
      EventFlux
    </motion.h1>
    
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-3 text-xs text-gray-500 tracking-[0.3em] uppercase"
    >
      Initializing Workspace...
    </motion.p>
  </div>
);

const LocalLoader = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          className="w-2.5 h-2.5 bg-purple-500/80 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        />
      ))}
    </div>
  </div>
);

export const MainWorkspace = () => {
  const [activeView, setActiveView] = useState<'BUILDER' | 'DASHBOARD' | 'TENANT' | 'DLQ' | 'ANALYTICS'>('BUILDER');
  const nodes = useWorkflowStore((state) => state.nodes);

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } }
  };

  return (
    <div className="relative w-full h-screen bg-[#090514] overflow-hidden font-sans text-gray-100 flex flex-col">
      <motion.div 
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-[0.15] pointer-events-none z-0" />

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
                <div className="w-full h-[calc(100vh-125px)] relative">
                  <WorkflowBuilder />
                </div>
              )}
              {activeView === 'DASHBOARD' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><ExecutionDashboard workflowNodes={nodes} /></div>}
              {activeView === 'ANALYTICS' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><AnalyticsDashboard /></div>}
              {activeView === 'TENANT' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><TenantDashboard /></div>}
              {activeView === 'DLQ' && <div className="pt-10 px-6 h-full overflow-y-auto pb-32"><DLQDashboard /></div>}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-white/3 backdrop-blur-2xl border border-white/8 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-[95vw] overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={() => setActiveView('BUILDER')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
            activeView === 'BUILDER' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Canvas
        </button>

        <button
          onClick={() => setActiveView('DASHBOARD')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeView === 'DASHBOARD' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Telemetry
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </button>

        <button
          onClick={() => setActiveView('ANALYTICS')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeView === 'ANALYTICS' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Analytics
        </button>

        <button
          onClick={() => setActiveView('TENANT')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
            activeView === 'TENANT' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Settings
        </button>

        <button
          onClick={() => setActiveView('DLQ')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
            activeView === 'DLQ' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Operations
        </button>
      </motion.div>
    </div>
  );
};