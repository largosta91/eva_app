// 📁 src/features/verification/components/VerificationStatus.jsx
//
// Muestra el estado actual de la verificación KYC de la creadora.
// Se usa después de que la chica sube su documento con IDUpload.jsx.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora usa estado mockeado. Cuando tengas backend:
//   - Consultar estado real desde API al cargar la pantalla:
//     const [status, setStatus] = useState('pending')
//     useEffect(() => {
//       api.get('/creators/verification').then(res => setStatus(res.data.status))
//     }, [])
//   - Escuchar cambios en tiempo real via socket:
//     socket.on('verification_status', (data) => setStatus(data.status))
//   - Si el estado es 'approved', redirigir al panel:
//     if (status === 'approved') navigate('/creator/home')
//   - Si es 'rejected', mostrar el motivo del rechazo:
//     setRejectionReason(data.reason)
//
// Props:
//   theme  → 'dark' | 'light'
//   status → 'pending' | 'approved' | 'rejected' — mock por defecto

export default function VerificationStatus({ theme = "dark", status = "pending" }) {

  const styles = {
    dark: {
      bg:     "bg-[#1a1826]",
      border: "border border-[rgba(201,168,76,.14)]",
      text:   "text-[#ede8ff]",
      muted:  "text-[#7a748f]",
    },
    light: {
      bg:     "bg-[#fff9f5]",
      border: "border border-[rgba(196,96,122,.15)]",
      text:   "text-[#2a1a20]",
      muted:  "text-[#9a7a84]",
    },
  };

  const s = styles[theme];

  // Cada estado tiene su propio color, ícono, título y descripción.
  // Cuando llegue el backend, el texto puede venir del servidor
  // para dar más detalle (ej: motivo del rechazo).
  const statusConfig = {
    pending: {
      icon:        "⏳",
      title:       "Verificación en proceso",
      description: "Estamos revisando tu documento. Esto puede tardar hasta 24 horas.",
      badge:       "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
      label:       "En revisión",
    },
    approved: {
      icon:        "✅",
      title:       "Verificación aprobada",
      description: "Tu identidad fue confirmada. Ya podés recibir mensajes y cobrar.",
      badge:       "bg-green-500/10 border border-green-500/30 text-green-400",
      label:       "Aprobada",
    },
    rejected: {
      icon:        "❌",
      title:       "Verificación rechazada",
      description: "No pudimos confirmar tu identidad. Revisá que la foto sea clara y volvé a intentarlo.",
      badge:       "bg-red-500/10 border border-red-500/30 text-red-400",
      label:       "Rechazada",
    },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`flex flex-col gap-4 p-6 rounded-2xl ${s.bg} ${s.border}`}>

      {/* Encabezado con ícono y badge de estado */}
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold uppercase tracking-widest ${s.muted}`}>
          Estado de verificación
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Cuerpo — ícono grande, título y descripción */}
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="text-5xl">{cfg.icon}</span>
        <p className={`text-base font-semibold ${s.text}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {cfg.title}
        </p>
        <p className={`text-sm leading-relaxed ${s.muted}`}>
          {cfg.description}
        </p>
      </div>

      {/* Botón para reintentar — solo aparece cuando fue rechazada */}
      {status === 'rejected' && (
        <button
          className="w-full py-3 rounded-full font-semibold text-sm border-none cursor-pointer active:scale-95 transition-all text-white"
          style={{ background: theme === 'dark'
            ? 'linear-gradient(135deg, #c9a84c, #f0d882)'
            : 'linear-gradient(135deg, #c4607a, #e8a0b0)'
          }}
          onClick={() => {
            // TODO: conectar con backend
            // → Reemplazar con: navigate('/creator/verify') para volver al IDUpload
            console.log("Reintentando verificación (mock)...");
          }}
        >
          Volver a intentarlo
        </button>
      )}

      {/* Nota de privacidad */}
      <p className={`text-xs text-center ${s.muted}`}>
        🔒 Tu información es confidencial y solo la revisa el equipo de Eva
      </p>
    </div>
  );
}