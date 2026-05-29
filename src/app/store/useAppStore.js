import { create } from 'zustand';
import { supabase } from '../../services/api/supabase';

let creditsChannel = null; // Canal realtime de créditos

const useAppStore = create((set, get) => ({
  user:      null,
  isLoggedIn: false,
  isLoading:  true,

  setUser: (userOrFn) => {
  const user = typeof userOrFn === 'function' ? userOrFn(get().user) : userOrFn;
  set({ user, isLoggedIn: !!user, isLoading: false });

  if (user) {
    supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) set({ credits: data.credits });
      });

    if (creditsChannel) supabase.removeChannel(creditsChannel);

    creditsChannel = supabase
      .channel(`credits_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new?.credits !== undefined) {
          set({ credits: payload.new.credits });
        }
      })
      .subscribe();
  }
},

  logout: () => {
    // Limpiar canal al cerrar sesión
    if (creditsChannel) {
      supabase.removeChannel(creditsChannel);
      creditsChannel = null;
    }
    set({ user: null, isLoggedIn: false, credits: 0 });
  },

  setLoading: (v) => set({ isLoading: v }),

  // Créditos — fuente de verdad: Supabase
  credits:      0,
  setCredits:  (n) => set({ credits: n }),
  addCredits:  (n) => set((s) => ({ credits: Math.max(0, s.credits + n) })),
  spendCredits: (n) => {
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