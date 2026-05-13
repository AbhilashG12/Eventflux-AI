import { create } from 'zustand';

interface SuccessState {
  message: string | null;
  showSuccess: (msg: string) => void;
  clearSuccess: () => void;
}

export const useSuccessStore = create<SuccessState>((set) => ({
  message: null,
  showSuccess: (msg) => {
    set({ message: msg });
    setTimeout(() => set({ message: null }), 4000);
  },
  clearSuccess: () => set({ message: null }),
}));