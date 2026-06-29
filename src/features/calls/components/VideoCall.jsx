// 📁 src/features/calls/components/VideoCall.jsx
import { useState, useEffect, useRef } from "react";

// Importaciones de componentes de la interfaz de usuario locales
import GiftPanel                       from "../../chat/components/GiftPanel";
import CallControls                    from "./CallControls";
import MiniChat                        from "./MiniChat.jsx";

// Importaciones de LiveKit para manejar la conexión de video/audio y los renderizadores
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  useLocalParticipant,
  RoomAudioRenderer,
} from "@livekit/components-react";

import { Track } from "livekit-client";
import "@livekit/components-styles";

// Importación de Supabase para la base de datos y backend
import { supabase } from "../../../services/api/supabase";

// Importación de todos los archivos de sonido (assets) utilizados para los regalos
import sonidobasico from "../../../assets/sounds/sonidobasico.mp3";
import rosa         from "../../../assets/sounds/rosa.mp3";
import chocolate    from "../../../assets/sounds/wow.mp3";
import copa         from "../../../assets/sounds/dandy.mp3";
import diamante     from "../../../assets/sounds/diamante.mp3";
import anillo       from "../../../assets/sounds/anillo.mp3";
import asombro      from "../../../assets/sounds/asombro.mp3";
import unicornio    from "../../../assets/sounds/unicornio.mp3";
import Fenix        from "../../../assets/sounds/sonidoFenix.mp3";
import japonTokio   from "../../../assets/sounds/japonTokio.mp3";
import helicopter   from "../../../assets/sounds/helicopter.mp3";
import avion        from "../../../assets/sounds/avion.mp3";
import tragamoneda  from "../../../assets/sounds/tragamoneda.mp3";
import pirotecnia   from "../../../assets/sounds/pirotecnia.mp3";
import oso          from "../../../assets/sounds/oso.mp3";
import colibri      from "../../../assets/sounds/colibri.mp3";

// Objeto constante que mapea los nombres de los sonidos con los archivos importados
const SOUNDS = {
  basico:      sonidobasico,
  rosa:        rosa,
  chocolate:   chocolate,
  copa:        copa,
  diamante:    diamante,
  anillo:      anillo,
  oso:         oso,
  colibri:     colibri,
  asombro:     asombro,
  japonTokio:  japonTokio,
  helicopter:  helicopter,
  avion:       avion,
  pirotecnia:  pirotecnia,
  tragamoneda: tragamoneda,
  unicornio:   unicornio,
  sonidoFenix: Fenix
};

// Función encargada de reproducir el sonido correspondiente al regalo enviado
const playGiftSound = (soundKey) => {
  const src = SOUNDS[soundKey];
  if (!src) return; // Si no existe el sonido, sale de la función
  new Audio(src).play().catch(() => {}); // Reproduce el sonido y atrapa errores (ej. bloqueo del navegador)
};

// Definición de animaciones CSS (keyframes) en forma de string para inyectar en los estilos
const OVERLAY_KEYFRAMES = `
  @keyframes gift-overlay-in {
    0%   { transform: translate(-50%, -50%) scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: translate(-50%, -50%) scale(1.2) rotate(5deg);  opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1)   rotate(0deg);  opacity: 1; }
  }
  @keyframes gift-overlay-out {
    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
  }
  @keyframes oro-overlay-in {
    0%   { opacity: 0; transform: scale(0.85); }
    60%  { opacity: 1; transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes oro-overlay-out {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.1); }
  }
  @keyframes overlay-confetti {
    0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
    100% { transform: translate(var(--cx), var(--cy)) rotate(var(--cr)) scale(0); opacity: 0; }
  }
  @keyframes gift-name-in {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

// Paleta de colores utilizada para las partículas/confeti de los regalos
const OVERLAY_COLORS = ["#c9a84c","#fff","#ff6b8a","#7c3aed","#4ade80"];

// Función para generar un array de partículas con posiciones y colores aleatorios
function makeOverlayParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: `${(Math.random() - 0.5) * 260}px`,
    cy: `${-(60 + Math.random() * 160)}px`,
    cr: `${(Math.random() - 0.5) * 720}deg`,
    size: 6 + Math.random() * 8,
    bg: OVERLAY_COLORS[Math.floor(Math.random() * OVERLAY_COLORS.length)],
  }));
}

// Helper para determinar si el recurso multimedia es un video basándose en la extensión
const isVideo = (src) => typeof src === "string" && src.endsWith(".mp4");

// Componente que decide si renderiza una etiqueta <video> o <img> según el tipo de archivo del regalo
function GiftMedia({ src, alt, style }) {
  if (isVideo(src)) {
    return <video src={src} autoPlay loop muted playsInline style={style} />;
  }
  return <img src={src} alt={alt} style={style} />;
}

// Componente que maneja la disposición (layout) de los videos en la llamada (principal y miniatura)
function CallLayout({ camOff }) {
  // Estado para controlar si las cámaras están intercambiadas
  const [swapped, setSwapped] = useState(false);
  
  // 1. Quitamos onlySubscribed para mayor velocidad y estabilidad
  const tracks = useTracks([Track.Source.Camera]); 
  const { localParticipant } = useLocalParticipant();

  // 2. Búsqueda segura de tracks para identificar cuál es el remoto
  const remoteTrack = tracks.find(
    t => t.participant.identity !== localParticipant?.identity && t.publication?.track != null
  ) ?? null;

  // Búsqueda segura de tracks para identificar cuál es el local
  const localTrack = tracks.find(
    t => t.participant.identity === localParticipant?.identity && t.publication?.track != null
  ) ?? null;

  // 3. Lógica robusta de intercambio (solo permite intercambiar si ambos tracks existen)
  const canSwap = Boolean(localTrack && remoteTrack);
  const isActuallySwapped = swapped && canSwap;

  // Asignación de qué track va en la vista principal y cuál en la miniatura
  const mainTrack  = isActuallySwapped ? localTrack  : remoteTrack;
  const thumbTrack = isActuallySwapped ? remoteTrack : localTrack;

  /* console log temporal para verificar la card que aparece al hacer video llamada */
  console.log('swapped:', swapped, 'mainTrack:', !!mainTrack, 'thumbTrack:', !!thumbTrack, 'canSwap:', canSwap);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>

      {/* Video principal — pantalla completa */}
      {mainTrack ? (
        <VideoTrack
          trackRef={mainTrack}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        // Fallback visual (pantalla de espera) cuando no hay track principal
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0830, #09080f)'
        }}>
          <span style={{ fontSize: 80, opacity: 0.2 }}>🌺</span>
        </div>
      )}

      {/* Video secundario — card chiquita, tappeable */}
      {/* Agregamos canSwap para asegurarnos de que no intente renderizar un track fantasma */}
      {canSwap && thumbTrack && (!camOff || swapped) && (
        <div
          onClick={() => setSwapped(s => !s)} // Al hacer click, intercambia las cámaras
          style={{
            position: 'absolute', bottom: 140, right: 16,
            width: 100, height: 140,
            borderRadius: 16, overflow: 'hidden',
            border: '2px solid rgba(255,255,255,.3)',
            zIndex: 20,
            cursor: 'pointer',
          }}
        >
          <VideoTrack
            trackRef={thumbTrack}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}

// Componente para renderizar la animación visual de un regalo en pantalla
function GiftOverlay({ gift, onDone }) {
  // Manejo de las fases de la animación (entrada/salida)
  const [phase, setPhase] = useState("in");
  // Inicialización de las partículas usando el helper
  const [particles] = useState(() => makeOverlayParticles(24));

  // Clasificación del tamaño/tipo de regalo basándose en su ID
  const isFullscreen = [3,8,11,17,18].includes(gift.id);
  const isLarge      = [10,12,13,14,15,16,19].includes(gift.id);

  // Efecto para temporizar cuánto tiempo se muestra la animación antes de salir y desmontarse
  useEffect(() => {
    const showMs = gift.duration ?? (isFullscreen || isLarge ? 4000 : 2000);
    const t1 = setTimeout(() => setPhase("out"), showMs); // Empieza animación de salida
    const t2 = setTimeout(() => onDone?.(), showMs + 500); // Avisa al padre que terminó
    return () => { clearTimeout(t1); clearTimeout(t2); }; // Limpieza de timeouts
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GRUPO 1: pantalla completa ──
  if (isFullscreen) {
    return (
      <>
        {/* Inyección de keyframes CSS */}
        <style>{OVERLAY_KEYFRAMES}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "#000",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: phase === "in"
            ? "oro-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
            : "oro-overlay-out 0.5s ease-in forwards",
        }}>
          <GiftMedia
            src={gift.image}
            alt={gift.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: `drop-shadow(0 0 60px ${gift.color})`,
            }}
          />
          {/* Contenedor del nombre del regalo (actualmente vacío pero preparado con estilos) */}
          <div style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: `${gift.color}22`,
            border: `1px solid ${gift.color}88`,
            borderRadius: "24px",
            padding: "6px 20px",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "2px",
            animation: "gift-name-in 0.4s ease-out 0.3s both",
          }}>
          </div>
        </div>
      </>
    );
  }

  // ── GRUPO 2: pantalla grande 85% ──
  if (isLarge) {
    return (
      <>
        {/* Inyección de keyframes CSS */}
        <style>{OVERLAY_KEYFRAMES}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "#000",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: phase === "in"
            ? "oro-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
            : "oro-overlay-out 0.5s ease-in forwards",
        }}>
          <GiftMedia
            src={gift.image}
            alt={gift.name}
            style={{
              width: "min(85vw, 80vh)",
              height: "min(85vw, 95vh)",
              objectFit: "contain",
              filter: `drop-shadow(0 0 60px ${gift.color})`,
            }}
          />
        </div>
      </>
    );
  }

  // ── GRUPO 3: tamaño normal con confetti ──
  return (
    <>
      {/* Inyección de keyframes CSS */}
      <style>{OVERLAY_KEYFRAMES}</style>

      {/* Fondo oscurecido para destacar el regalo */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        top: "50%", left: "50%",
        zIndex: 61,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "12px",
        pointerEvents: "none",
        animation: phase === "in"
          ? "gift-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "gift-overlay-out 0.5s ease-in forwards",
      }}>
        {/* Renderizado del array de partículas generadas */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%", background: p.bg,
            "--cx": p.cx, "--cy": p.cy, "--cr": p.cr,
            animation: "overlay-confetti 1s ease-out forwards",
          }} />
        ))}

        {/* Renderiza imagen o un emoji si no hay imagen definida */}
        {gift.image ? (
          <GiftMedia
            src={gift.image}
            alt={gift.name}
            style={{
              width: "75%",
              height: "75%",
              objectFit: "contain",
              filter: `drop-shadow(0 0 40px ${gift.color})`,
            }}
          />
        ) : (
          <span style={{
            fontSize: "120px", lineHeight: 1,
            filter: `drop-shadow(0 0 40px ${gift.color})`,
          }}>
            {gift.emoji}
          </span>
        )}
      </div>
    </>
  );
}

//------------------------consulta de credito-----------------------------//
// Función auxiliar para formatear segundos en formato "MM:SS"
const fmtTime = s =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Componente principal exportado para la Videollamada
export default function VideoCall({
  user    = { id: "mock_user_1",    name: "Carlos", credits: 0 },
  creator = { id: "mock_creator_1", name: "Sofía",  avatar: null },
  onEnd,
  theme = "dark",
  token = null,
  roomName = null,
}) {

  // Estados locales para el control de la llamada, créditos y la interfaz
  const [secs, setSecs]             = useState(0); // Tiempo transcurrido
  const [status, setStatus]         = useState("connecting"); // Estado de conexión
  const [credits, setCredits]       = useState(0); // Créditos del usuario
  const [muted, setMuted]           = useState(false); // Estado del micrófono
  const [camOff, setCamOff]         = useState(false); // Estado de la cámara
  const [showGifts, setShowGifts]   = useState(false); // Mostrar panel de regalos
  const [activeGift, setActiveGift] = useState(null); // Regalo siendo animado actualmente
  const [showChat, setShowChat]     = useState(false); // Mostrar chat

  // Referencias a los elementos de video (actualmente no usadas directamente en el render principal)
  const _localVideoRef  = useRef(null);
  const _remoteVideoRef = useRef(null);

  // ── Cargar créditos reales desde Supabase ──
  // Efecto que se ejecuta al montar para obtener los créditos actualizados del usuario
  useEffect(() => {
    const loadCredits = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error cargando créditos:", error);
        return;
      }
      if (data) setCredits(data.credits); // Actualiza el estado con los créditos reales
    };
    loadCredits();
  }, [user.id]); // Se ejecuta si cambia el ID del usuario

  // ── Timer visual de llamada ──
  // Efecto para manejar el cambio de estado de conexión y el contador de segundos
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("connected"), 1500); // Finge conexión después de 1.5s
    const t2 = setInterval(() => setSecs(prev => prev + 1), 1000); // Incrementa contador cada segundo
    return () => { clearTimeout(t1); clearInterval(t2); }; // Limpieza de timers
  }, []);

  // ── Enviar regalo seguro usando RPC ──
  // Función asíncrona para procesar el envío de un regalo vía base de datos
  const sendGift = async (gift) => {
    // Verificación preliminar en el cliente de los créditos
    if (credits < gift.cost) {
      console.warn("Créditos insuficientes");
      return;
    }

    // Llamada a función remota (RPC) en Supabase para procesar transacción segura
    const { data, error } = await supabase.rpc("send_gift", {
      p_creator_id: creator.id,
      p_gift_name:  gift.name,
    });

    if (error) {
      console.error("Error enviando regalo:", error);
      return;
    }

    // Manejo de respuesta negativa del backend (por ej. falta de saldo real)
    if (!data.ok) {
      if (data.error === "insufficient_credits") {
        console.warn("Créditos insuficientes (backend)");
      } else {
        console.error("Error del backend:", data.error);
      }
      return;
    }

    // Si todo salió bien: actualiza saldo, reproduce sonido, muestra animación y cierra panel
    setCredits(data.credits_remaining);
    playGiftSound(gift.soundKey);
    setActiveGift(gift);
    setShowGifts(false);
    console.log("Regalo enviado:", gift.name, "| Créditos restantes:", data.credits_remaining);
  };

  // ── Finalizar llamada ──
  // Función invocada al colgar la llamada por el usuario actual
  const handleEnd = async () => {
    setStatus("ended");
    if (roomName) {
      // Actualiza el registro de la llamada en Supabase para marcarla como terminada
      await supabase
        .from("call_requests")
        .update({ status: "ended" })
        .eq("room_name", roomName)
        .eq("status", "accepted"); // solo actualiza si estaba activa
    }
    onEnd?.(); // Callback de finalización al padre
  };

  // ── Escuchar si la creadora cuelga ──
  // Efecto para escuchar cambios en tiempo real vía Supabase channels
  useEffect(() => {
    if (!roomName) return;

    // Se suscribe a los cambios en la tabla call_requests para la sala actual
    const channel = supabase
      .channel(`call-end:${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "call_requests",
          filter: `room_name=eq.${roomName}`,
        },
        (payload) => {
          // Si el estado cambia a 'ended' remotamente, finaliza la llamada en este cliente
          if (payload.new.status === "ended") {
            setStatus("ended");
            onEnd?.();
          }
        }
      )
      .subscribe();

    // Limpieza: desuscribe el canal cuando el componente se desmonta
    return () => supabase.removeChannel(channel);
  }, [roomName, onEnd]);

//----------------------------------------------------------------------------------//

  return (
    // Contenedor principal a pantalla completa
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── VIDEO / LIVEKIT ── */}
    <div className="absolute inset-0">
      {/* Condicional para renderizar el cuarto de LiveKit o una pantalla de carga */}
      {token && roomName ? (
      <LiveKitRoom
      token={token} // Token JWT de autenticación para LiveKit
      serverUrl={import.meta.env.VITE_LIVEKIT_URL} // URL del servidor LiveKit
      connect={true} // Iniciar conexión automáticamente
      video={!camOff} // Control de cámara local
      audio={true} // Control de audio local
      style={{ height: '100%', position: 'absolute', inset: 0 }}
    >
      {/* Renderiza el audio de los participantes remotos */}
      <RoomAudioRenderer />
      {/* Renderiza el layout visual (los videos) */}
      <CallLayout camOff={camOff} />
    </LiveKitRoom>
  ) : ( // ← Fijate el ")" cerrando el bloque anterior justo antes de los dos puntos
    // Pantalla de carga mientras se obtienen token/roomName
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1a0830, #09080f)" }}
    >
      <span style={{ fontSize: 160, opacity: 0.15 }}>💫</span>
    </div>
  )}
</div>

      {/* Renderizado condicional del overlay si hay un regalo activo en animación */}
      {activeGift && (
        <GiftOverlay
          gift={activeGift}
          onDone={() => setActiveGift(null)} // Resetea estado cuando termina la animación
        />
      )}

      {/* Barra superior de información (Timer y saldo) */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.7), transparent)" }}
      >
        {/* Renderiza el tiempo transcurrido */}
        <div className="text-white font-mono text-base font-semibold">
          {fmtTime(secs)}
        </div>

        {/* Indicador de créditos/diamantes restantes */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(201,168,76,.2)",
            border: "1px solid rgba(201,168,76,.4)"
          }}
        >
          <span className="text-sm">💎</span>
          <span className="text-[#c9a84c] text-xs font-bold">{credits}</span>
          <span className="text-[#7a748f] text-xs">· −50/min</span>
        </div>
      </div>

      {/* Overlay de estado 'conectando' inicial (antes de que conecte LiveKit) */}
      {status === "connecting" && !token && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-6xl mb-4">🌺</div>
          <div
            className="text-white text-2xl font-semibold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {creator.name}
          </div>
          <div className="text-white/60 text-sm">Conectando...</div>
        </div>
      )}

      {/* UI indicador visual cuando el usuario local apaga su cámara */}
     {camOff && (
        <div
          className="absolute z-20 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            bottom: 140, right: 16,
            width: 100, height: 140,
            background: "#1a1826",
            border: "2px solid rgba(255,255,255,.2)"
          }}
        >
          <span style={{ fontSize: 40 }}>🚫</span>
        </div>
      )}

      {/* Botón Flotante: Abrir panel de regalos */}
      <div className="absolute z-20" style={{ bottom: 120, left: 20 }}>
        <button
          onClick={() => setShowGifts(true)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer active:scale-90 transition-transform"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)" }}
          >
            <span className="text-2xl">🎁</span>
          </div>
          <span className="text-white/60 text-[10px]">Regalo</span>
        </button>
      </div>

      {/* Botón Flotante: Abrir mini chat */}
      <div className="absolute z-20" style={{ bottom: 120, left: 80 }}>
        <button
          onClick={() => setShowChat(c => !c)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer active:scale-90 transition-transform"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: showChat ? "rgba(201,168,76,.35)" : "rgba(255,255,255,.15)",
              backdropFilter: "blur(10px)",
              border: showChat ? "1px solid rgba(201,168,76,.6)" : "none",
            }}
          >
            <span className="text-2xl">💬</span>
          </div>
          <span className="text-white/60 text-[10px]">Chat</span>
        </button>
      </div>

      {/* Controles inferiores universales (mutear, cámara off, colgar) */}
      <CallControls
        muted={muted}
        camOff={camOff}
        onToggleMute={() => setMuted(m => !m)}
        onToggleCam={() => setCamOff(c => !c)}
        onEnd={handleEnd}
      />

      {/* Renderizado condicional del Panel de Regalos inferior */}
      {showGifts && (
        <GiftPanel
          context="call"
          onSend={sendGift} // Envía el evento a la función sendGift
          onClose={() => setShowGifts(false)}
          credits={credits}
          theme={theme}
        />
      )}

    {/* Renderizado condicional de la ventana de Mini Chat sobrepuesta */}
    {showChat && (
  <MiniChat
    theme={theme}
    onClose={() => setShowChat(false)}
    creator={creator}
    credits={credits}
    onCreditsUpdate={setCredits} // Para que el chat también pueda actualizar los créditos si es necesario
    roomName={roomName}
    userId={user.id}
  />
)}

    </div>
  );
}