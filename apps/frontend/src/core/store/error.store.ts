import { create } from 'zustand';

interface ErrorState {
  message: string | null;
  showError: (msg: string) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  message: null,
  showError: (msg) => {
    set({ message: msg });
    setTimeout(() => set({ message: null }), 5000);
  },
  clearError: () => set({ message: null }),
}));