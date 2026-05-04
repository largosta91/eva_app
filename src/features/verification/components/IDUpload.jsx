// 📁 src/features/verification/components/IDUpload.jsx
import { useState } from "react";
import { supabase } from "../../../services/api/supabase";
import useAppStore from "../../../app/store/useAppStore";

export default function IDUpload({ theme = "light", onDone }) {
  const { user, setUser } = useAppStore();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | selected | uploading | done | error

  const styles = {
    dark: {
      bg: "bg-[#1a1826]", border: "border border-[rgba(201,168,76,.14)]",
      dropzone: "border-2 border-dashed border-[rgba(201,168,76,.3)] bg-[#111018]",
      text: "text-[#ede8ff]", accent: "text-[#c9a84c]", muted: "text-[#7a748f]",
      grad: "linear-gradient(135deg, #c9a84c, #f0d882)", btnText: "text-[#09080f]",
    },
    light: {
      bg: "bg-[#fff9f5]", border: "border border-[rgba(196,96,122,.15)]",
      dropzone: "border-2 border-dashed border-[rgba(196,96,122,.3)] bg-[#fdf6f0]",
      text: "text-[#2a1a20]", accent: "text-[#c4607a]", muted: "text-[#9a7a84]",
      grad: "linear-gradient(135deg, #c4607a, #e8a0b0)", btnText: "text-white",
    },
  };
  const s = styles[theme];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setStatus("selected");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async () => {
    if (!file || !user?.id) return;
    setStatus("uploading");

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/id_document.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Marcar como pendiente en la tabla users
      const { error: dbError } = await supabase
        .from("users")
        .update({ verification_status: "pending" })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setUser({ ...user, verification_status: "pending" });
      setStatus("done");
      onDone?.();
    } catch (err) {
      console.error("Error subiendo documento:", err);
      setStatus("error");
    }
  };

  return (
    <div className={`flex flex-col gap-5 p-6 rounded-2xl ${s.bg} ${s.border}`}>
      <div>
        <h2 className={`text-xl font-semibold mb-1 ${s.accent}`}>
          Verificación de identidad
        </h2>
        <p className={`text-sm leading-relaxed ${s.muted}`}>
          Subí una foto clara de tu documento de identidad para activar tu cuenta.
          Tu información está protegida y solo la revisa el equipo de Eva.
        </p>
      </div>

      <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-200 ${preview ? "" : s.dropzone}`}>
        {preview ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
            <p className={`text-xs ${s.muted}`}>✅ {file.name}</p>
            <p className={`text-xs ${s.accent} underline`}>Cambiar archivo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-4xl">🪪</span>
            <p className={`text-sm font-medium ${s.text}`}>Tocá para subir tu documento</p>
            <p className={`text-xs ${s.muted}`}>JPG, PNG o PDF · Máximo 10MB</p>
          </div>
        )}
        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
      </label>

      {status === "selected" && (
        <button
          className={`w-full py-4 rounded-full font-semibold text-sm border-none cursor-pointer active:scale-95 ${s.btnText}`}
          style={{ background: s.grad }}
          onClick={handleSubmit}
        >
          Enviar para verificación
        </button>
      )}

      {status === "uploading" && (
        <div className="text-center py-3">
          <p className={`text-sm ${s.muted} animate-pulse`}>⏳ Subiendo documento...</p>
        </div>
      )}

      {status === "done" && (
        <div className="text-center py-3 rounded-2xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-sm font-medium">✅ Documento enviado — revisaremos en 24 hs</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm font-medium">❌ Error al subir. Intentá de nuevo.</p>
        </div>
      )}

      <p className={`text-xs text-center ${s.muted}`}>
        🔒 Tu documento se guarda de forma segura y nunca se comparte con terceros
      </p>
    </div>
  );
}