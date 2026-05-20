import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useWorkflowStore } from '../../core/store/workflow.store';

const WorkflowBuilder = lazy(() => import('../builder/pages/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder })));
const ExecutionDashboard = lazy(() => import('../dashboard/components/ExecutionDashboard').then(m => ({ default: m.ExecutionDashboard })));
const TenantDashboard = lazy(() => import('../builder/pages/TenantDashboard').then(m => ({ default: m.TenantDashboard })));
const DLQDashboard = lazy(() => import('../dashboard/components/DLQDashboard').then(m => ({ default: m.DLQDashboard })));
const AnalyticsDashboard = lazy(() => import('../dashboard/components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));

export const GlobalLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#090514] z-9999">
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
      className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" 
    />
  </div>
);

const LocalLoader = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
      className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" 
    />
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
        className="absolute top-[-10%] left-[-10%] w-100 h-100 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" 
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-[0.15] pointer-events-none z-0" />

      <div className="relative grow w-full h-full z-10 overflow-y-auto overflow-x-hidden pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full min-h-full"
          >
            <Suspense fallback={<LocalLoader />}>
              {activeView === 'BUILDER' && <WorkflowBuilder />}
              {activeView === 'DASHBOARD' && <div className="pt-10 px-6 h-full"><ExecutionDashboard workflowNodes={nodes} /></div>}
              {activeView === 'ANALYTICS' && <div className="pt-10 px-6"><AnalyticsDashboard /></div>}
              {activeView === 'TENANT' && <div className="pt-10 px-6"><TenantDashboard /></div>}
              {activeView === 'DLQ' && <div className="pt-10 px-6"><DLQDashboard /></div>}
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