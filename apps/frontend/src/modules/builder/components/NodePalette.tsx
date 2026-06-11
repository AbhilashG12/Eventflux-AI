import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Webhook, Sparkles, Globe, MessageSquare, Mail, GripVertical, UserCheck } from 'lucide-react';

const NODE_ITEMS = {
  triggers: [
    {
      id: 'webhook',
      nodeType: 'TRIGGER',
      actionType: 'webhook_trigger',
      label: 'Webhook Event',
      description: 'Start on HTTP POST',
      icon: Webhook,
      color: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      border: 'group-hover:border-emerald-500/40',
      bg: 'group-hover:bg-emerald-500/10',
    }
  ],
  actions: [
    {
      id: 'ai_gen',
      nodeType: 'ACTION',
      actionType: 'ai_generate',
      label: 'Llama 3 AI Task',
      description: 'Generate text via Groq',
      icon: Sparkles,
      color: 'text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
      border: 'group-hover:border-purple-500/40',
      bg: 'group-hover:bg-purple-500/10',
    },
    {
      id: 'http_req',
      nodeType: 'ACTION',
      actionType: 'http_request',
      label: 'External API Call',
      description: 'Fetch or push data',
      icon: Globe,
      color: 'text-blue-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      border: 'group-hover:border-blue-500/40',
      bg: 'group-hover:bg-blue-500/10',
    },
    {
      id: 'slack_msg',
      nodeType: 'ACTION',
      actionType: 'slack_message',
      label: 'Slack Message',
      description: 'Send to channel',
      icon: MessageSquare,
      color: 'text-pink-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
      border: 'group-hover:border-pink-500/40',
      bg: 'group-hover:bg-pink-500/10',
    },
    {
      id: 'email_send',
      nodeType: 'ACTION',
      actionType: 'email_send',
      label: 'Send Email',
      description: 'SMTP delivery',
      icon: Mail,
      color: 'text-orange-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
      border: 'group-hover:border-orange-500/40',
      bg: 'group-hover:bg-orange-500/10',
    },
    // 🚀 NEW: The Human Approval Node
    {
      id: 'human_approval',
      nodeType: 'APPROVAL',
      actionType: 'human_approval',
      label: 'Human Approval',
      description: 'Pause for manager review',
      icon: UserCheck,
      color: 'text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      border: 'group-hover:border-amber-500/40',
      bg: 'group-hover:bg-amber-500/10',
    }
  ]
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, actionType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, actionType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const renderNode = (item: any) => {
    const Icon = item.icon;
    
    return (
      <motion.div
        key={item.id}
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        onDragStart={(e: any) => onDragStart(e, item.nodeType, item.actionType, item.label)}
        draggable
        className={`group relative flex items-center gap-3 p-3 bg-white/2 border border-white/5 rounded-xl cursor-grab transition-colors duration-300 ${item.border} ${item.bg} ${item.glow}`}
      >
        <div className="absolute left-2 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
          <GripVertical size={14} className="text-gray-500 group-hover:text-gray-300" />
        </div>

        <div className={`w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:translate-x-3 relative`}>
          <Icon size={16} className={item.color} />
        </div>

        <div className="flex flex-col transition-transform duration-300 ease-out group-hover:translate-x-3">
          <span className="text-sm text-gray-200 font-medium tracking-wide drop-shadow-md">{item.label}</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-wider">{item.description}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-72 bg-[#0a0a0a]/40 backdrop-blur-2xl border-r border-white/8 h-full flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] relative overflow-hidden">
      
      {/* 🚀 THE FIX: Replaced expensive blur-[50px] with zero-cost radial gradient */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)' }}
      />

      <div className="p-5 border-b border-white/10 bg-linear-to-b from-white/2 to-transparent relative z-10">
        <h3 className="text-sm font-semibold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-wide uppercase drop-shadow-sm">Node Palette</h3>
        <p className="text-[11px] text-gray-500 font-mono mt-1">Drag elements to canvas</p>
      </div>

      <div className="p-5 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10 pb-20">
        
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <motion.h4 
            variants={itemVariants}
            className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest"
          >
            <span className="w-2 h-px bg-gray-500/50" />
            Triggers
            <span className="flex-1 h-px bg-linear-to-r from-gray-500/50 to-transparent" />
          </motion.h4>
          <div className="flex flex-col gap-2">
            {NODE_ITEMS.triggers.map(renderNode)}
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <motion.h4 
            variants={itemVariants}
            className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest"
          >
            <span className="w-2 h-px bg-gray-500/50" />
            Actions
            <span className="flex-1 h-px bg-linear-to-r from-gray-500/50 to-transparent" />
          </motion.h4>
          <div className="flex flex-col gap-3">
            {NODE_ITEMS.actions.map(renderNode)}
          </div>
        </motion.div>

      </div>
    </div>
  );
};