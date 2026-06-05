import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export const AppLoader = () => {
  const bootPhases = [
    "Initializing Event Bus",
    "Mounting Plugin Registry",
    "Bootstrapping Orchestrator",
    "Awaiting Webhooks"
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-mono">
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" 
      />
      <div className="relative flex items-center justify-center mb-16">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 2.5 + i * 0.5], 
              opacity: [0.6, 0],
              rotate: [0, 180] 
            }}
            transition={{ 
              duration: 4.5, 
              repeat: Infinity, 
              ease: "easeOut", 
              delay: i * 1.1 
            }}
            className="absolute w-20 h-20 border border-indigo-400/20"
            style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} 
          />
        ))}

        <motion.div
          animate={{ boxShadow: ["0 0 20px rgba(99,102,241,0.1)", "0 0 50px rgba(99,102,241,0.4)", "0 0 20px rgba(99,102,241,0.1)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative bg-black/50 border border-white/5 p-5 rounded-2xl z-10 backdrop-blur-xl"
        >
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-8 h-8 text-indigo-400 opacity-90" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
      <div className="flex flex-col items-center z-10">
        <motion.h1
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-xl font-bold tracking-[0.5em] text-white uppercase mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ml-3"
        >
          EventFlux
        </motion.h1>
        <div className="relative h-6 w-full flex justify-center items-center mt-2">
          {bootPhases.map((phase, i) => (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: [10, 0, 0, -10],
                filter: ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1, 
                ease: "easeInOut"
              }}
              className="absolute flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-indigo-200/50 font-medium"
            >
              <span className="w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
              {phase}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};