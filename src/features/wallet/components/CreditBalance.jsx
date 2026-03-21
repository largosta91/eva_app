// 📁 src/features/wallet/components/CreditBalance.jsx
//
// Muestra el saldo actual de créditos del usuario.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora usa un valor mockeado. Cuando tengas backend:
//   - Reemplazar el valor fijo por el saldo real desde API.
//   - Actualizar en tiempo real cuando se compren créditos.
//
// → Cuando llegue el backend reemplazar por:
//   const { credits } = useAppStore()
//   y eliminar el prop balance — el saldo va a venir del store global de Zustand
//   que a su vez se actualiza desde el servidor cada vez que el usuario compra o gasta.
//
// Props:
//   theme   → 'dark' | 'light'
//   balance → número — saldo actual en diamantes (mock por ahora)

// → Cuando llegue el backend, este import reemplaza el prop balance:
// import { useAppStore } from '../../../app/store/useAppStore'

export default function CreditBalance({ theme = "dark", balance = 120 }) {

  // → Cuando llegue el backend, esta línea reemplaza el prop balance:
  // const { credits } = useAppStore()
  // y usás credits en vez de balance en todo el componente

  const styles = {
    dark: {
      bg:   "bg-[#1a1826]",
      text: "text-[#c9a84c]",
    },
    light: {
      bg:   "bg-[#fdf6f0]",
      text: "text-[#c4607a]",
    },
  };

  const s = styles[theme];

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${s.bg}`}>
      <span className="text-sm text-[#7a748f]">Tu saldo actual</span>
      <span className={`text-lg font-bold ${s.text}`}>💎 {balance}</span>
    </div>
  );
}