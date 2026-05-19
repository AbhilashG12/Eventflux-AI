import { useState } from 'react';
import { motion } from 'framer-motion';
import { WorkflowBuilder } from '../builder/pages/WorkflowBuilder';
import { ExecutionDashboard } from '../dashboard/components/ExecutionDashboard';
import { TenantDashboard } from '../builder/pages/TenantDashboard';
import { useWorkflowStore } from '../../core/store/workflow.store';
import { DLQDashboard } from '../dashboard/components/DLQDashboard';
import { AnalyticsDashboard } from '../dashboard/components/AnalyticsDashboard';

export const MainWorkspace = () => {
  const [activeView, setActiveView] = useState<'BUILDER' | 'DASHBOARD' | 'TENANT' | 'DLQ' | 'ANALYTICS'>('BUILDER');
  const nodes = useWorkflowStore((state) => state.nodes);

  return (
    <div className="relative w-full h-screen bg-[#090514] overflow-hidden font-sans text-gray-100">
      <motion.div 
        animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-100 h-100 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-[0.15] pointer-events-none" />

      <div className={`absolute inset-0 transition-opacity duration-700 ${activeView === 'BUILDER' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <WorkflowBuilder />
      </div>

      <div className={`absolute inset-0 overflow-y-auto transition-opacity duration-700 ${activeView === 'DASHBOARD' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="pt-24 pb-32 relative z-20">
          <ExecutionDashboard workflowNodes={nodes} />
        </div>
      </div>

      <div className={`absolute inset-0 overflow-y-auto transition-opacity duration-700 ${activeView === 'ANALYTICS' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="pt-24 pb-32 relative z-20">
          <AnalyticsDashboard />
        </div>
      </div>

      <div className={`absolute inset-0 overflow-y-auto transition-opacity duration-700 ${activeView === 'TENANT' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="pt-24 pb-32 relative z-20">
          <TenantDashboard />
        </div>
      </div>

      <div className={`absolute inset-0 overflow-y-auto transition-opacity duration-700 ${activeView === 'DLQ' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="pt-24 pb-32 relative z-20">
          <DLQDashboard />
        </div>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-white/3 backdrop-blur-2xl border border-white/8 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        <button
          onClick={() => setActiveView('BUILDER')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeView === 'BUILDER' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Canvas
        </button>

        <button
          onClick={() => setActiveView('DASHBOARD')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeView === 'DASHBOARD' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Telemetry
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </button>

        <button
          onClick={() => setActiveView('ANALYTICS')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeView === 'ANALYTICS' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Analytics
        </button>

        <button
          onClick={() => setActiveView('TENANT')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeView === 'TENANT' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Settings
        </button>

        <button
          onClick={() => setActiveView('DLQ')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeView === 'DLQ' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Operations
        </button>
      </motion.div>
    </div>
  );
};