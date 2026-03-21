// 📁 src/features/calls/components/CallControls.jsx
//
// Controles de la videollamada — mic, cámara y colgar.
// Componente puramente visual que recibe funciones desde VideoCall.jsx.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora solo simula acciones. Cuando tengas backend:
//
//   Silenciar micrófono:
//     localStream.getAudioTracks()[0].enabled = !muted
//     socket.emit('mute', { callId, muted: !muted })
//
//   Apagar cámara:
//     localStream.getVideoTracks()[0].enabled = !camOff
//     socket.emit('cam_off', { callId, camOff: !camOff })
//
//   Colgar:
//     socket.emit('end_call', { callId })
//     pc.close()
//     localStream.getTracks().forEach(t => t.stop())
//
// Props:
//   theme        → 'dark' | 'light'
//   onEndCall    → función para terminar la llamada
//   muted        → boolean — estado actual del mic (controlado desde VideoCall)
//   camOff       → boolean — estado actual de la cámara (controlado desde VideoCall)
//   onToggleMute → función para alternar el mic
//   onToggleCam  → función para alternar la cámara

export default function CallControls({
  theme        = "dark",
  onEndCall,
  muted        = false,
  camOff       = false,
  onToggleMute,
  onToggleCam,
}) {

  const handleMute = () => {
    // TODO: localStream.getAudioTracks()[0].enabled = muted
    // TODO: socket.emit('mute', { callId, muted: !muted })
    console.log("Micrófono:", muted ? "activado" : "muteado");
    if (onToggleMute) onToggleMute();
  };

  const handleToggleCamera = () => {
    // TODO: localStream.getVideoTracks()[0].enabled = camOff
    // TODO: socket.emit('cam_off', { callId, camOff: !camOff })
    console.log("Cámara:", camOff ? "activada" : "apagada");
    if (onToggleCam) onToggleCam();
  };

  const handleEndCall = () => {
    // TODO: socket.emit('end_call', { callId })
    // TODO: pc.close() y localStream.getTracks().forEach(t => t.stop())
    console.log("Llamada finalizada");
    if (onEndCall) onEndCall();
  };

  const buttons = [
    {
      icon:    muted  ? '🔇' : '🎤',
      label:   muted  ? 'Activar mic'    : 'Silenciar',
      onClick: handleMute,
      active:  muted,
    },
    {
      icon:    '📵',
      label:   'Colgar',
      onClick: handleEndCall,
      isEnd:   true,
    },
    {
      icon:    camOff ? '🚫' : '📷',
      label:   camOff ? 'Activar cámara' : 'Apagar cámara',
      onClick: handleToggleCamera,
      active:  camOff,
    },
  ];

  return (
    <div
      className="flex items-center justify-center gap-6 pb-10 pt-4 px-6"
      style={{ background: 'linear-gradient(to top, rgba(0,0,0,.8), transparent)' }}
    >
      {buttons.map((btn, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <button
            onClick={btn.onClick}
            className="flex items-center justify-center rounded-full border-none cursor-pointer transition-transform active:scale-90"
            style={{
              width:          btn.isEnd ? 68 : 56,
              height:         btn.isEnd ? 68 : 56,
              fontSize:       btn.isEnd ? 26 : 22,
              background:     btn.isEnd ? '#ef4444' : 'rgba(255,255,255,.15)',
              backdropFilter: 'blur(10px)',
              boxShadow:      btn.isEnd ? '0 8px 24px rgba(239,68,68,.4)' : 'none',
              border:         btn.active ? '2px solid #ef4444' : '2px solid transparent',
            }}
          >
            {btn.icon}
          </button>
          <span className="text-white/50 text-[10px]">{btn.label}</span>
        </div>
      ))}
    </div>
  );
}