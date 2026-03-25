import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  user:       null,
  isLoggedIn: false,
  isLoading:  true,

  setUser:    (user) => set({ user, isLoggedIn: !!user, isLoading: false }),
  logout:     ()     => set({ user: null, isLoggedIn: false }),
  setLoading: (v)    => set({ isLoading: v }),

  // ✅ Créditos actuales (mock local)
  credits:     100, // DESDE AQUI SE MANEJA EL CRÉDITO DEL USUARIO EN LA APP, PARA COMPRAS Y REGALOS
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

/* 
  ────────────────────────────────────────────────
  ✅ FUTURO: Integración con backend
  - Cuando tengas tu API lista, podés agregar funciones para sincronizar créditos:

  const useAppStore = create((set, get) => ({
    credits: 0,
    setCredits: (n) => set({ credits: n }),
    addCredits: (n) => set((s) => ({ credits: Math.max(0, s.credits + n) })),
    spendCredits: (n) => { ... },

    // 🔗 Acción para cargar créditos desde backend
    fetchCredits: async () => {
      try {
        const res = await fetch('/api/wallet/credits');
        const data = await res.json();
        set({ credits: data.credits });
      } catch (err) {
        console.error('Error al cargar créditos', err);
      }
    },

    // 🔗 Acción para comprar créditos (ejemplo)
    buyCredits: async (packId) => {
      try {
        const res = await fetch(`/api/wallet/buy/${packId}`, { method: 'POST' });
        const data = await res.json();
        set({ credits: data.newBalance });
      } catch (err) {
        console.error('Error al comprar créditos', err);
      }
    },
  }));

  ────────────────────────────────────────────────
*/
