// 📁 src/components/ui/Toast.jsx
// Notificación temporal que aparece desde abajo y desaparece sola.
// Se exporta en dos partes: el hook (lógica) y el componente (visual).
//
// Uso:
//   1. En el componente raíz de cada panel:
//      const toast = useToast()
//      <Toast msg={toast.msg} visible={toast.visible} theme="dark" />
//
//   2. En cualquier hijo, pasás toast.show como prop:
//      toast.show('Mensaje enviado ✅')
//      toast.show('Error al conectar', 5000) ← duración personalizada en ms

import { useState } from "react";

// ── HOOK ─────────────────────────────────────────────────────────────────────
// Encapsula el estado del toast para que el componente que lo usa
// no tenga que manejar timers ni visibilidad manualmente.
export function useToast() {
  const [msg, setMsg]         = useState('');
  const [visible, setVisible] = useState(false);

  const show = (message, duration = 3000) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  };

  // Retornamos msg, visible y show para que el padre pueda:
  // - Pasar msg y visible al componente Toast
  // - Pasar show() a cualquier hijo que necesite mostrar notificaciones
  return { msg, visible, show };
}

// ── COMPONENTE VISUAL ─────────────────────────────────────────────────────────
// El tema 'dark' usa el fondo oscuro del panel masculino (#09080f).
// El tema 'light' usa el fondo crema del panel femenino (#fdf6f0).
// La animación de entrada/salida se logra con Tailwind transition + translate.
export default function Toast({ msg, visible, theme = 'dark' }) {

  const themes = {
    dark:  'bg-[#1a1826] border-[rgba(201,168,76,.2)]  text-[#ede8ff]',
    light: 'bg-[#fff9f5] border-[rgba(196,96,122,.2)]  text-[#2a1a20]',
  };

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 z-[999]
        px-6 py-3 rounded-full border text-sm font-medium
        whitespace-nowrap pointer-events-none select-none
        transition-all duration-300 ease-out
        -translate-x-1/2
        ${themes[theme]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {msg}
    </div>
  );
}