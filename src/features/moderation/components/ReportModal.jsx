// 📁 src/features/moderation/components/ReportModal.jsx
//
// Modal para reportar contenido o comportamiento inapropiado.
// Usa el componente Modal de components/ui/ para mantener consistencia visual.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora solo simula el envío. Cuando tengas backend:
//   - Enviar el reporte a la API:
//     await api.post('/moderation/reports', {
//       reportedId,   ← ID del usuario o creadora reportada
//       reason,
//       details,
//       chatId,       ← opcional, si el reporte viene desde el chat
//     })
//   - Manejar el estado de envío:
//     setStatus('sending') → setStatus('done') → cerrar modal
//   - El admin ve todos los reportes en el panel de administración:
//     api.get('/admin/reports') → AdminDashboard.jsx
//
// Props:
//   theme      → 'dark' | 'light'
//   onClose    → función para cerrar el modal
//   reportedId → ID del usuario o creadora reportada (mock por defecto)

import { useState } from "react";
import Modal  from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

export default function ReportModal({ theme = "dark", onClose, reportedId = "mock_user_1" }) {

  const [reason, setReason]   = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus]   = useState("idle"); // 'idle' | 'sending' | 'done'

  const styles = {
    dark: {
      label:    "text-[#7a748f]",
      input:    "bg-[#111018] border border-[rgba(201,168,76,.14)] text-[#ede8ff] placeholder-[#7a748f]",
      focus:    "focus:border-[#c9a84c]",
    },
    light: {
      label:    "text-[#9a7a84]",
      input:    "bg-[#f5ece6] border border-[rgba(196,96,122,.15)] text-[#2a1a20] placeholder-[#9a7a84]",
      focus:    "focus:border-[#c4607a]",
    },
  };

  const s = styles[theme];

  const handleSubmit = async () => {
    if (!reason) return;

    setStatus("sending");

    // TODO: conectar con backend
    // → Reemplazar con:
    //   await api.post('/moderation/reports', { reportedId, reason, details })
    console.log("Reporte enviado (mock):", { reportedId, reason, details });

    // Simulamos el delay de la llamada a la API
    setTimeout(() => {
      setStatus("done");
      setTimeout(() => onClose?.(), 1500);
    }, 800);
  };

  return (
    <Modal open={true} onClose={onClose} title="Reportar contenido" theme={theme}>

      {/* Estado de éxito — reemplaza el formulario cuando se envió */}
      {status === "done" ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="text-5xl">✅</span>
          <p className="text-green-400 font-semibold text-base">Reporte enviado</p>
          <p className={`text-sm ${s.label}`}>
            Gracias por reportarlo. El equipo de Eva va a revisarlo en las próximas 24 hs.
          </p>
        </div>
      ) : (
        <>
          {/* Motivo del reporte */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className={`text-xs font-semibold uppercase tracking-wider ${s.label}`}>
              Motivo del reporte
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl text-sm outline-none transition-colors ${s.input} ${s.focus}`}
            >
              <option value="">Seleccioná un motivo</option>
              <option value="spam">Spam o mensajes repetitivos</option>
              <option value="acoso">Acoso o comportamiento agresivo</option>
              <option value="contenido_no_solicitado">Contenido no solicitado</option>
              <option value="lenguaje_ofensivo">Lenguaje ofensivo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Detalles adicionales */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label className={`text-xs font-semibold uppercase tracking-wider ${s.label}`}>
              Detalles adicionales <span className={`normal-case font-normal ${s.label}`}>(opcional)</span>
            </label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Contanos qué pasó..."
              rows={3}
              className={`w-full px-4 py-3 rounded-2xl text-sm outline-none transition-colors resize-none ${s.input} ${s.focus}`}
            />
          </div>

          {/* Advertencia si no seleccionó un motivo */}
          {!reason && status !== 'idle' && (
            <p className="text-red-400 text-xs mb-3 text-center">
              Por favor seleccioná un motivo para continuar
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'secondary'}
              fullWidth
              disabled={!reason || status === 'sending'}
              onClick={handleSubmit}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar reporte'}
            </Button>
          </div>

          <p className={`text-xs text-center mt-4 ${s.label}`}>
            🔒 Los reportes son anónimos y confidenciales
          </p>
        </>
      )}
    </Modal>
  );
}