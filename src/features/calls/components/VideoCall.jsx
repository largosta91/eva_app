// 📁 src/features/calls/components/VideoCall.jsx
import { useState, useEffect, useRef } from "react";
import GiftPanel                       from "../../chat/components/GiftPanel";
import CallControls                    from "./CallControls";
import MiniChat                        from "./MiniChat.jsx";
import { supabase }                    from "../../../services/api/supabase";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

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

const playGiftSound = (soundKey) => {
  const src = SOUNDS[soundKey];
  if (!src) return;
  new Audio(src).play().catch(() => {});
};

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

const OVERLAY_COLORS = ["#c9a84c","#fff","#ff6b8a","#7c3aed","#4ade80"];

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

const isVideo = (src) => typeof src === "string" && src.endsWith(".mp4");

function GiftMedia({ src, alt, style }) {
  if (isVideo(src)) {
    return <video src={src} autoPlay loop muted playsInline style={style} />;
  }
  return <img src={src} alt={alt} style={style} />;
}


function CallLayout({ camOff }) {
  const [swapped, setSwapped] = useState(false);
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const { localParticipant } = useLocalParticipant();

const remoteTracks = tracks.filter(
  t => t.participant.identity !== localParticipant?.identity
    && t.publication?.track != null
);
const localTrack = tracks.find(
  t => t.participant.identity === localParticipant?.identity
    && t.publication?.track != null
);

  const mainTrack  = swapped ? localTrack      : remoteTracks[0];
  const thumbTrack = swapped ? remoteTracks[0] : localTrack;
  /*console log temporal para verificar la card que aparece al hacer video llamada */
  console.log('swapped:', swapped, 'mainTrack:', !!mainTrack, 'thumbTrack:', !!thumbTrack, 'remoteTracks:', remoteTracks.length, 'localTrack:', !!localTrack);

return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>

      {/* Video principal — pantalla completa */}
      {mainTrack ? (
        <VideoTrack
          trackRef={mainTrack}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0830, #09080f)'
        }}>
          <span style={{ fontSize: 80, opacity: 0.2 }}>🌺</span>
        </div>
      )}

      {/* Video secundario — card chiquita, tappeable */}
      {thumbTrack && (!camOff || swapped) && (
        <div
          onClick={() => setSwapped(s => !s)}
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

function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  const [particles] = useState(() => makeOverlayParticles(24));

  const isFullscreen = [3,8,11,17,18].includes(gift.id);
  const isLarge      = [10,12,13,14,15,16,19].includes(gift.id);

  useEffect(() => {
    const showMs = gift.duration ?? (isFullscreen || isLarge ? 4000 : 2000);
    const t1 = setTimeout(() => setPhase("out"), showMs);
    const t2 = setTimeout(() => onDone?.(), showMs + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GRUPO 1: pantalla completa ──
  if (isFullscreen) {
    return (
      <>
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
      <style>{OVERLAY_KEYFRAMES}</style>

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
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%", background: p.bg,
            "--cx": p.cx, "--cy": p.cy, "--cr": p.cr,
            animation: "overlay-confetti 1s ease-out forwards",
          }} />
        ))}

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
const fmtTime = s =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function VideoCall({
  user    = { id: "mock_user_1",    name: "Carlos", credits: 0 },
  creator = { id: "mock_creator_1", name: "Sofía",  avatar: null },
  onEnd,
  theme = "dark",
  token = null,
  roomName = null,
}) {

  const [secs, setSecs]             = useState(0);
  const [status, setStatus]         = useState("connecting");
  const [credits, setCredits]       = useState(0);
  const [muted, setMuted]           = useState(false);
  const [camOff, setCamOff]         = useState(false);
  const [showGifts, setShowGifts]   = useState(false);
  const [activeGift, setActiveGift] = useState(null);
  const [showChat, setShowChat]     = useState(false);

  const _localVideoRef  = useRef(null);
  const _remoteVideoRef = useRef(null);

  // ── Cargar créditos reales desde Supabase ──
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
      if (data) setCredits(data.credits);
    };
    loadCredits();
  }, [user.id]);

  // ── Timer visual de llamada ──
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("connected"), 1500);
    const t2 = setInterval(() => setSecs(prev => prev + 1), 1000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // ── Enviar regalo seguro usando RPC ──
  const sendGift = async (gift) => {
    if (credits < gift.cost) {
      console.warn("Créditos insuficientes");
      return;
    }

    const { data, error } = await supabase.rpc("send_gift", {
      p_creator_id: creator.id,
      p_gift_name:  gift.name,
    });

    if (error) {
      console.error("Error enviando regalo:", error);
      return;
    }

    if (!data.ok) {
      if (data.error === "insufficient_credits") {
        console.warn("Créditos insuficientes (backend)");
      } else {
        console.error("Error del backend:", data.error);
      }
      return;
    }

    setCredits(data.credits_remaining);
    playGiftSound(gift.soundKey);
    setActiveGift(gift);
    setShowGifts(false);
    console.log("Regalo enviado:", gift.name, "| Créditos restantes:", data.credits_remaining);
  };

  // ── Finalizar llamada ──
const handleEnd = async () => {
  setStatus("ended");
  if (roomName) {
    await supabase
      .from("call_requests")
      .update({ status: "ended" })
      .eq("room_name", roomName)
      .eq("status", "accepted"); // solo actualiza si estaba activa
  }
  onEnd?.();
};

// ── Escuchar si la creadora cuelga ──
useEffect(() => {
  if (!roomName) return;

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
        if (payload.new.status === "ended") {
          setStatus("ended");
          onEnd?.();
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [roomName, onEnd]);

//----------------------------------------------------------------------------------//

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── VIDEO / LIVEKIT ── */}
      <div className="absolute inset-0">
        {token && roomName ? (
          <LiveKitRoom
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            connect={true}
            video={!camOff}
            audio={!muted}
            style={{ height: '100%', position: 'absolute', inset: 0 }}
              >
            <CallLayout camOff={camOff} />
            </LiveKitRoom>
            ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a0830, #09080f)" }}
          >
            <span style={{ fontSize: 160, opacity: 0.15 }}>💫</span>
          </div>
        )}
      </div>

      {activeGift && (
        <GiftOverlay
          gift={activeGift}
          onDone={() => setActiveGift(null)}
        />
      )}

      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.7), transparent)" }}
      >
        <div className="text-white font-mono text-base font-semibold">
          {fmtTime(secs)}
        </div>

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

      <CallControls
        muted={muted}
        camOff={camOff}
        onToggleMute={() => setMuted(m => !m)}
        onToggleCam={() => setCamOff(c => !c)}
        onEnd={handleEnd}
      />

      {showGifts && (
        <GiftPanel
          context="call"
          onSend={sendGift}
          onClose={() => setShowGifts(false)}
          credits={credits}
          theme={theme}
        />
      )}

    {showChat && (
  <MiniChat
    theme={theme}
    onClose={() => setShowChat(false)}
    creator={creator}
    credits={credits}
    onCreditsUpdate={setCredits}
    roomName={roomName}
    userId={user.id}
  />
)}

    </div>
  );
}
