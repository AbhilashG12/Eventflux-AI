import { motion, type Variants } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import { ApiAuthentication } from '../components/settings/ApiAuthentication';
import { TenantDetailsForm } from '../components/settings/TenantDetailsForm';
import { SecretsVault } from '../components/settings/SecretsVault';
import { TeamAccess } from '../components/settings/TeamAccess';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export const TenantDashboard = () => {
  const scrollbarStyles = "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`max-w-5xl mx-auto w-full relative z-10 ${scrollbarStyles}`}
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Settings2 className="w-5 h-5 text-indigo-400" />
          </div>
          Organization Settings
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-mono tracking-wide">Manage API keys, environment secrets, and team access.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemVariants} className="h-full">
          <ApiAuthentication />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <TenantDetailsForm />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mb-6">
        <SecretsVault />
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-10">
        <TeamAccess />
      </motion.div>
    </motion.div>
  );
};