import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  user:       null,
  isLoggedIn: false,
  isLoading:  true,

  setUser:    (user) => set({ user, isLoggedIn: !!user, isLoading: false }),
  logout:     ()     => set({ user: null, isLoggedIn: false }),
  setLoading: (v)    => set({ isLoading: v }),

  credits:     0,
  setCredits:  (n) => set({ credits: n }),
  addCredits:  (n) => set((s) => ({ credits: Math.max(0, s.credits + n) })),
  spendCredits:(n) => {
    const current = get().credits;
    if (current < n) return false;
    set({ credits: current - n });
    return true;
  },

  toast: null,
  showToast: (msg, type = 'info') => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));

export default useAppStore;