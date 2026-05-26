import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSecrets } from '../../hooks/useSecrets';

export const SecretsVault = () => {
  const { secrets, isLoading, isSubmitting, addSecret, deleteSecret } = useSecrets();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    
    const success = await addSecret(name, value);
    if (success) {
      setName('');
      setValue('');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Encrypted Secrets Vault</h3>
      <p className="text-sm text-gray-400 mb-6">
        Manage your encrypted integration keys and environment variables. These are never exposed in plain text.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end mb-8">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-400 mb-1">SECRET NAME</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
            placeholder="OPENAI_API_KEY"
            className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-400 mb-1">SECRET VALUE</label>
          <input 
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-[#0a0a0a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || !name || !value}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
        >
          {isSubmitting ? 'Saving...' : 'Save Secret'}
        </motion.button>
      </form>

      <div className="border border-border rounded-xl overflow-hidden bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-black/40">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 tracking-wider">NAME</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 tracking-wider">ADDED ON</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 tracking-wider text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">Loading secrets...</td></tr>
            ) : secrets.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No secrets found. Add one above.</td></tr>
            ) : (
              secrets.map(secret => (
                <tr key={secret.id} className="border-b border-border last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                      {secret.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteSecret(secret.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};