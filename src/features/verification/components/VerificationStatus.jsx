// 📁 src/features/verification/components/VerificationStatus.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../../services/api/supabase";
import useAppStore from "../../../app/store/useAppStore";

export default function VerificationStatus({ theme = "light", onRetry }) {
  const { user } = useAppStore();
  const [status, setStatus] = useState(user?.verification_status ?? "none");

  // Escuchar cambios en tiempo real por si el admin aprueba/rechaza
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`verify_${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new?.verification_status) {
          setStatus(payload.new.verification_status);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const styles = {
    dark: { bg: "bg-[#1a1826]", border: "border border-[rgba(201,168,76,.14)]", text: "text-[#ede8ff]", muted: "text-[#7a748f]" },
    light: { bg: "bg-[#fff9f5]", border: "border border-[rgba(196,96,122,.15)]", text: "text-[#2a1a20]", muted: "text-[#9a7a84]" },
  };
  const s = styles[theme];

  const statusConfig = {
    none:     { icon: "📋", title: "Sin verificar", description: "Todavía no subiste tu documento.", badge: "bg-gray-500/10 border border-gray-500/30 text-gray-400", label: "Sin verificar" },
    pending:  { icon: "⏳", title: "Verificación en proceso", description: "Estamos revisando tu documento. Esto puede tardar hasta 24 horas.", badge: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400", label: "En revisión" },
    approved: { icon: "✅", title: "Verificación aprobada", description: "Tu identidad fue confirmada. Ya podés recibir mensajes y cobrar.", badge: "bg-green-500/10 border border-green-500/30 text-green-400", label: "Aprobada" },
    rejected: { icon: "❌", title: "Verificación rechazada", description: "No pudimos confirmar tu identidad. Revisá que la foto sea clara y volvé a intentarlo.", badge: "bg-red-500/10 border border-red-500/30 text-red-400", label: "Rechazada" },
  };

  const cfg = statusConfig[status] ?? statusConfig.none;

  return (
    <div className={`flex flex-col gap-4 p-6 rounded-2xl ${s.bg} ${s.border}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold uppercase tracking-widest ${s.muted}`}>Estado de verificación</h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
      </div>

      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="text-5xl">{cfg.icon}</span>
        <p className={`text-base font-semibold ${s.text}`}>{cfg.title}</p>
        <p className={`text-sm leading-relaxed ${s.muted}`}>{cfg.description}</p>
      </div>

      {status === "rejected" && (
        <button
          className="w-full py-3 rounded-full font-semibold text-sm border-none cursor-pointer active:scale-95 text-white"
          style={{ background: theme === "dark" ? "linear-gradient(135deg, #c9a84c, #f0d882)" : "linear-gradient(135deg, #c4607a, #e8a0b0)" }}
          onClick={onRetry}
        >
          Volver a intentarlo
        </button>
      )}

      <p className={`text-xs text-center ${s.muted}`}>
        🔒 Tu información es confidencial y solo la revisa el equipo de Eva
      </p>
    </div>
  );
}