import { create } from 'zustand';

interface ErrorState {
  message: string | null;
  showError: (msg: string) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  message: null,
  showError: (msg) => {
    let cleanMessage = msg;
    
    // Intercept and format ugly Zod JSON arrays
    try {
      const jsonMatch = msg.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          cleanMessage = parsed.map(err => `• ${err.path.join('.')}: ${err.message}`).join('\n');
        }
      }
    } catch (e) {
      // If parsing fails, just use the original message
    }

    set({ message: cleanMessage });
    setTimeout(() => set({ message: null }), 5000);
  },
  clearError: () => set({ message: null }),
}));