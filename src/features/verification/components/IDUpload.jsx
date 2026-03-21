// 📁 src/features/verification/components/IDUpload.jsx
//
// Subida de documento de identidad para verificación de la creadora.
// Es el primer paso del flujo KYC (Know Your Customer) — sin esto
// la chica no puede empezar a recibir mensajes ni cobrar.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora no guarda nada real. Cuando tengas backend:
//   - Subir el archivo a storage (Supabase Storage o AWS S3):
//     const formData = new FormData()
//     formData.append('file', file)
//     const { url } = await api.post('/uploads/id', formData)
//   - Guardar la URL en el perfil de la creadora:
//     await api.post('/creators/verify', { idUrl: url })
//   - Escuchar el estado de verificación (aprobado/rechazado):
//     socket.on('verification_status', (status) => setStatus(status))
//   - Redirigir al panel cuando el admin aprueba:
//     if (status === 'approved') navigate('/creator/home')
//
// Props:
//   theme    → 'dark' | 'light'
//   onUpload → función opcional que recibe el archivo seleccionado
//              → Cuando llegue el backend: reemplazar por la llamada real a la API

import { useState } from "react";

export default function IDUpload({ theme = "dark", onUpload = null }) {

  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);  // preview de la imagen seleccionada
  const [status, setStatus]   = useState('idle'); // 'idle' | 'selected' | 'uploading' | 'done'

  const styles = {
    dark: {
      bg:       "bg-[#1a1826]",
      border:   "border border-[rgba(201,168,76,.14)]",
      dropzone: "border-2 border-dashed border-[rgba(201,168,76,.3)] bg-[#111018]",
      dropHover:"border-[#c9a84c] bg-[rgba(201,168,76,.05)]",
      text:     "text-[#ede8ff]",
      accent:   "text-[#c9a84c]",
      muted:    "text-[#7a748f]",
      grad:     "linear-gradient(135deg, #c9a84c, #f0d882)",
      btnText:  "text-[#09080f]",
    },
    light: {
      bg:       "bg-[#fff9f5]",
      border:   "border border-[rgba(196,96,122,.15)]",
      dropzone: "border-2 border-dashed border-[rgba(196,96,122,.3)] bg-[#fdf6f0]",
      dropHover:"border-[#c4607a] bg-[rgba(196,96,122,.05)]",
      text:     "text-[#2a1a20]",
      accent:   "text-[#c4607a]",
      muted:    "text-[#9a7a84]",
      grad:     "linear-gradient(135deg, #c4607a, #e8a0b0)",
      btnText:  "text-white",
    },
  };

  const s = styles[theme];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setStatus('selected');

    // Generamos un preview local de la imagen para que la chica confirme
    // que subió el documento correcto antes de enviarlo
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);

    // TODO: conectar con backend
    // → Reemplazar con:
    //   const formData = new FormData()
    //   formData.append('file', selected)
    //   setStatus('uploading')
    //   const { url } = await api.post('/uploads/id', formData)
    //   await api.post('/creators/verify', { idUrl: url })
    //   setStatus('done')
    if (onUpload) onUpload(selected);
    console.log("Archivo seleccionado (mock):", selected.name);
  };

  return (
    <div className={`flex flex-col gap-5 p-6 rounded-2xl ${s.bg} ${s.border}`}>

      {/* Encabezado */}
      <div>
        <h2 className={`text-xl font-semibold mb-1 ${s.accent}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Verificación de identidad
        </h2>
        <p className={`text-sm leading-relaxed ${s.muted}`}>
          Subí una foto clara de tu documento de identidad para activar tu cuenta.
          Tu información está protegida y solo la revisa el equipo de Eva.
        </p>
      </div>

      {/* Zona de drop — más profesional que un input pelado en mobile */}
      <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-200 ${preview ? '' : s.dropzone}`}>

        {preview ? (
          // Si ya hay un archivo seleccionado, mostramos el preview
          <div className="flex flex-col items-center gap-3 w-full">
            <img
              src={preview}
              alt="Preview del documento"
              className="w-full max-h-48 object-cover rounded-xl"
            />
            <p className={`text-xs ${s.muted}`}>
              ✅ {file.name}
            </p>
            <p className={`text-xs ${s.accent} underline cursor-pointer`}>
              Cambiar archivo
            </p>
          </div>
        ) : (
          // Si no hay archivo todavía, mostramos el placeholder visual
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-4xl">🪪</span>
            <p className={`text-sm font-medium ${s.text}`}>
              Tocá para subir tu documento
            </p>
            <p className={`text-xs ${s.muted}`}>
              JPG, PNG o PDF · Máximo 10MB
            </p>
          </div>
        )}

        {/* El input real está oculto — la label lo activa al hacer click */}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Botón de confirmar — solo aparece cuando hay un archivo seleccionado */}
      {status === 'selected' && (
        <button
          className={`w-full py-4 rounded-full font-semibold text-sm border-none cursor-pointer transition-all active:scale-95 ${s.btnText}`}
          style={{ background: s.grad }}
          onClick={() => {
            // TODO: conectar con backend
            // → Reemplazar con la llamada real a la API descripta arriba
            setStatus('done');
            console.log("Enviando documento al backend (mock)...");
          }}
        >
          Enviar para verificación
        </button>
      )}

      {/* Estado de éxito — cuando el archivo ya fue enviado */}
      {status === 'done' && (
        <div className={`text-center py-3 rounded-2xl bg-green-500/10 border border-green-500/20`}>
          <p className="text-green-400 text-sm font-medium">
            ✅ Documento enviado — revisaremos en 24 hs
          </p>
        </div>
      )}

      {/* Nota de privacidad */}
      <p className={`text-xs text-center ${s.muted}`}>
        🔒 Tu documento se guarda de forma segura y nunca se comparte con terceros
      </p>
    </div>
  );
}