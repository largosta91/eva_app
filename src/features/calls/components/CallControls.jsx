// 📁 src/features/calls/components/CallControls.jsx
//
// Controles de la videollamada — mic, cámara, colgar y subtítulos.
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
//   theme             → 'dark' | 'light'
//   onEnd             → función para terminar la llamada
//   muted             → boolean — estado actual del mic
//   camOff            → boolean — estado actual de la cámara
//   subtitlesOn       → boolean — estado actual de los subtítulos
//   onToggleMute      → función para alternar el mic
//   onToggleCam       → función para alternar la cámara

export default function CallControls({
  onEnd,
  muted             = false,
  camOff            = false,
  onToggleMute,
  onToggleCam,
  miniChatAbierto   = false, // <-- IMPORTANTE: El padre debe pasar este estado
}) {

  const handleMute = () => {
    onToggleMute?.();
  };

  const handleToggleCamera = () => {
    onToggleCam?.();
  };

  const handleEndCall = () => {
    onEnd?.();
  };

  const buttons = [
    {
      icon:    muted ? "🔇" : "🎤",
      label:   muted ? "Activar mic" : "Silenciar",
      onClick: handleMute,
      active:  muted,
    },
    {
      icon:    "📵",
      label:   "Colgar",
      onClick: handleEndCall,
      isEnd:   true,
    },
    {
      icon:    camOff ? "🚫" : "📷",
      label:   camOff ? "Activar cámara" : "Apagar cámara",
      onClick: handleToggleCamera,
      active:  camOff,
    }
  ];

  return (
    <div
      className="flex items-center justify-evenly pb-10 pt-4 px-8"
      style={{ 
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        // CLAVE 1: El zIndex debe ser menor al del MiniChat (que suele ser 100)
        zIndex: 10, 
        background: "linear-gradient(to top, rgba(0,0,0,.8), transparent)",
        
        // CLAVE 2: LA ANULACIÓN TOTAL
        // 'none' hace que el click pase de largo y lo reciba lo que esté atrás (el MiniChat)
        pointerEvents: miniChatAbierto ? "none" : "auto", 
        
        // Visualmente los "apagamos" para que el usuario no intente tocarlos
        opacity: miniChatAbierto ? 0 : 1, 
        visibility: miniChatAbierto ? "hidden" : "visible",
        transition: "all 0.3s ease"
      }}
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
              background:     btn.isEnd ? "#ef4444" : "rgba(255,255,255,.15)",
              backdropFilter: "blur(10px)",
              boxShadow:      btn.isEnd ? "0 8px 24px rgba(239,68,68,.4)" : "none",
              border:         btn.active
                ? "2px solid rgba(201,168,76,.8)"
                : "2px solid transparent",
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
