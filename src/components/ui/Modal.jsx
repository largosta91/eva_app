// 📁 src/components/ui/Modal.jsx
// Panel deslizante desde abajo (bottom sheet), sirve para regalos,
// confirmaciones de videollamada, y cualquier acción secundaria.
//
// Uso:
//   const [open, setOpen] = useState(false)
//   <Modal open={open} onClose={() => setOpen(false)} title="Enviar regalo" theme="dark">
//     {/* contenido adentro */}
//   </Modal>
//
// Props:
//   open    → boolean — controla si el modal se muestra o no
//   onClose → función que se llama al cerrar (click fuera o botón ×)
//   title   → string opcional — aparece como encabezado dentro del modal
//   theme   → 'dark' (masculino) | 'light' (femenino)
//   children→ cualquier JSX que quieras mostrar adentro

export default function Modal({
  open = false,
  onClose,
  title = '',
  children,
  theme = 'dark',
}) {

  // Colores según el tema de la interfaz activa
  const themes = {
    dark: {
      overlay:  'bg-black/75',
      modal:    'bg-[#111018] border-[rgba(201,168,76,.15)]',
      text:     'text-[#ede8ff]',
      handle:   'bg-[#232134]',
      closeBtn: 'text-[#7a748f] hover:text-[#ede8ff]',
    },
    light: {
      overlay:  'bg-black/50',
      modal:    'bg-[#fff9f5] border-[rgba(196,96,122,.15)]',
      text:     'text-[#2a1a20]',
      handle:   'bg-[#ede0d8]',
      closeBtn: 'text-[#9a7a84] hover:text-[#2a1a20]',
    },
  };

  const t = themes[theme];

  // Si open === false, no renderizamos nada en el DOM
  // Esto evita que el modal ocupe espacio cuando está cerrado
  if (!open) return null;

  return (
    // Fondo oscuro semitransparente — al hacer click afuera cierra el modal
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center ${t.overlay} backdrop-blur-sm`}
      onClick={onClose}
    >
      {/* Contenedor del modal — stopPropagation evita que el click adentro
          llegue al fondo y cierre el modal sin querer */}
      <div
        className={`
          w-full max-w-[480px]
          ${t.modal} border-t
          rounded-t-[28px] px-6 pb-8 pt-4
        `}
        style={{ animation: 'slideUp .35s cubic-bezier(.4,0,.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Manija visual — indica que el panel se puede deslizar */}
        <div className={`w-10 h-1 ${t.handle} rounded-full mx-auto mb-5`} />

        {/* Encabezado con título y botón cerrar — solo si se pasa un título */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3
              className={`text-xl font-semibold ${t.text}`}
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`text-2xl leading-none bg-transparent border-none cursor-pointer transition-colors ${t.closeBtn}`}
            >
              ×
            </button>
          </div>
        )}

        {/* Contenido — lo que sea que se le pase como children */}
        {children}
      </div>
    </div>
  );
}