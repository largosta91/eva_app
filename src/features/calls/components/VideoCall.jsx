// 📁 src/features/calls/components/VideoCall.jsx
//
// Pantalla completa de videollamada entre un hombre y una chica.
// Incluye el panel de regalos reducido (solo nivel 1 y nivel 3)
// y los controles de micrófono y cámara.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora muestra un layout animado con mock data. Cuando tengas backend:
//
//   1. Conectar con WebRTC para el video real:
//      const pc = new RTCPeerConnection(ICE_SERVERS)
//      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//      stream.getTracks().forEach(track => pc.addTrack(track, stream))
//      localVideoRef.current.srcObject = stream
//
//   2. Señalización via socket:
//      socket.on('offer',  async (offer)  => { await pc.setRemoteDescription(offer); ... })
//      socket.on('answer', async (answer) => { await pc.setRemoteDescription(answer) })
//      socket.on('ice-candidate', async (candidate) => { await pc.addIceCandidate(candidate) })
//
//   3. Descontar créditos en el servidor cada minuto:
//      socket.on('call_tick', (data) => useAppStore.getState().setCredits(data.credits))
//
//   4. Terminar la llamada:
//      socket.emit('end_call', { callId })
//      pc.close()
//
// Props:
//   user    → objeto con { id, name, credits } — mock por defecto
//   creator → objeto con { id, name, avatar }  — mock por defecto
//   onEnd   → función para volver a la pantalla anterior
//   theme   → 'dark' | 'light'

import { useState, useEffect, useRef } from "react";
import GiftPanel    from "../../chat/components/GiftPanel";
import CallControls from "./CallControls";

// Función helper para formatear el timer de la llamada
const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function VideoCall({
  // Mock data por defecto — cuando llegue el backend estos valores
  // van a venir del router o del store de Zustand
  user    = { id: 'mock_user_1',    name: 'Carlos', credits: 120 },
  creator = { id: 'mock_creator_1', name: 'Sofía',  avatar: null },
  onEnd,
  theme = 'dark',
}) {

  const [secs, setSecs]           = useState(0);
  const [status, setStatus]       = useState('connecting'); // 'connecting' | 'connected' | 'ended'
  const [credits, setCredits]     = useState(user.credits);
  const [muted, setMuted]         = useState(false);
  const [camOff, setCamOff]       = useState(false);
  const [showGifts, setShowGifts] = useState(false);

  // Referencias a los elementos de video — cuando llegue el backend
  // se conectan al stream de WebRTC:
  //   localVideoRef.current.srcObject = localStream
  //   remoteVideoRef.current.srcObject = remoteStream
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  // Timer de la llamada — descuenta 1 crédito cada 30 segundos
  // → Cuando llegue el backend: el servidor controla el descuento real
  //   y lo comunica via socket.on('call_tick', data => setCredits(data.credits))
  useEffect(() => {
    const t1 = setTimeout(() => setStatus('connected'), 1500);
    const t2 = setInterval(() => {
      setSecs(s => s + 1);
      // Mock: descuenta 1 crédito cada 30 segundos
      // → Reemplazar con el tick del servidor cuando llegue el backend
      setSecs(prev => {
        if ((prev + 1) % 30 === 0) setCredits(c => Math.max(0, c - 1));
        return prev + 1;
      });
    }, 1000);

    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // Manejador de regalos durante la llamada
  // Igual que en el chat pero con context="call" — solo nivel 1 y nivel 3
  const sendGift = (gift) => {
    setCredits(c => Math.max(0, c - gift.cost));
    // → Cuando llegue el backend: socket.emit('gift', { giftId: gift.id, callId })
    console.log("Regalo enviado durante llamada (mock):", gift);
  };

  const handleEnd = () => {
    setStatus('ended');
    // → Cuando llegue el backend: socket.emit('end_call', { callId })
    onEnd?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── VIDEO REMOTO (la chica) — ocupa toda la pantalla ── */}
      <div className="absolute inset-0">
        {/* Cuando llegue el backend: <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" /> */}
        {/* Por ahora mostramos el fondo animado con el emoji de la creadora */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a0830, #09080f)' }}
        >
          <span style={{ fontSize: 160, opacity: 0.15 }}>🌺</span>
        </div>
      </div>

      {/* ── BARRA SUPERIOR — timer y costo ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.7), transparent)' }}
      >
        <div className="text-white font-mono text-base font-semibold">
          {fmtTime(secs)}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(201,168,76,.2)', border: '1px solid rgba(201,168,76,.4)' }}>
          <span className="text-sm">💎</span>
          <span className="text-[#c9a84c] text-xs font-bold">{credits}</span>
          <span className="text-[#7a748f] text-xs">· −2/min</span>
        </div>
      </div>

      {/* ── CENTRO — nombre y estado de conexión ── */}
      {status === 'connecting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-6xl mb-4">🌺</div>
          <div className="text-white text-2xl font-semibold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {creator.name}
          </div>
          <div className="text-white/60 text-sm">Conectando...</div>
        </div>
      )}

      {/* ── VIDEO LOCAL (el hombre) — esquina inferior derecha ── */}
      <div
        className="absolute z-20 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ bottom: 140, right: 16, width: 100, height: 140, background: '#1a1826', border: '2px solid rgba(255,255,255,.2)' }}
      >
        {/* Cuando llegue el backend: <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} /> */}
        <span style={{ fontSize: 40, filter: camOff ? 'grayscale(1) opacity(.3)' : 'none' }}>
          {camOff ? '🚫' : '🤳'}
        </span>
      </div>

      {/* ── BOTÓN DE REGALOS — sobre los controles ── */}
      <div className="absolute z-20" style={{ bottom: 120, left: 20 }}>
        <button
          onClick={() => setShowGifts(true)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer active:scale-90 transition-transform"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(10px)' }}>
            <span className="text-2xl">🎁</span>
          </div>
          <span className="text-white/60 text-[10px]">Regalo</span>
        </button>
      </div>

      {/* ── CONTROLES DE LLAMADA ── */}
      {/* Importados desde CallControls.jsx para mantener el código limpio */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <CallControls
          muted={muted}
          camOff={camOff}
          onToggleMute={() => setMuted(m => !m)}
          onToggleCam={() => setCamOff(c => !c)}
          onEnd={handleEnd}
        />
      </div>

      {/* ── PANEL DE REGALOS ── */}
      {/* context="call" → solo muestra nivel 1 (Rompehielos) y nivel 3 (Estatus Supremo) */}
      {showGifts && (
        <GiftPanel
          context="call"
          onSend={sendGift}
          onClose={() => setShowGifts(false)}
          credits={credits}
          theme={theme}
        />
      )}
    </div>
  );
}