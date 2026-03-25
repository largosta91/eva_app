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

export default function Toast({ msg, visible, theme = 'dark' }) {

  const themes = {
    dark:  'bg-[#1a1826] border-[rgba(201,168,76,.2)] text-[#ede8ff]',
    light: 'bg-[#fff9f5] border-[rgba(196,96,122,.2)] text-[#2a1a20]',
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