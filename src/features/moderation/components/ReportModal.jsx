// 📁 src/features/moderation/components/ReportModal.jsx
import { useState } from "react";
import Modal  from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { supabase } from "../../../services/api/supabase";
import useAppStore from "../../../app/store/useAppStore";

export default function ReportModal({ theme = "dark", onClose, reportedId }) {
  const { user } = useAppStore();
  const [reason, setReason]   = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus]   = useState("idle"); // 'idle' | 'sending' | 'done' | 'error'

  const styles = {
    dark: {
      label: "text-[#7a748f]",
      input: "bg-[#111018] border border-[rgba(201,168,76,.14)] text-[#ede8ff] placeholder-[#7a748f]",
      focus: "focus:border-[#c9a84c]",
    },
    light: {
      label: "text-[#9a7a84]",
      input: "bg-[#f5ece6] border border-[rgba(196,96,122,.15)] text-[#2a1a20] placeholder-[#9a7a84]",
      focus: "focus:border-[#c4607a]",
    },
  };

  const s = styles[theme];

  const handleSubmit = async () => {
    if (!reason) return;
    setStatus("sending");

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportedId,
      reason,
      details: details || null,
      status: "pendiente",
    });

    if (error) {
      console.error("Error al enviar reporte:", error);
      setStatus("error");
      return;
    }

    setStatus("done");
    setTimeout(() => onClose?.(), 1500);
  };

  return (
    <Modal open={true} onClose={onClose} title="Reportar contenido" theme={theme}>

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

          {status === "error" && (
            <p className="text-red-400 text-xs mb-3 text-center">
              Hubo un error al enviar el reporte. Intentá de nuevo.
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant={theme === "dark" ? "primary" : "secondary"}
              fullWidth
              disabled={!reason || status === "sending"}
              onClick={handleSubmit}
            >
              {status === "sending" ? "Enviando..." : "Enviar reporte"}
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