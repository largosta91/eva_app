// 📁 src/features/creators/components/CreatorVideoCall.jsx
import { useState, useEffect, useRef } from "react";
import CallControls from "../../calls/components/CallControls";
import MiniChat from "../../calls/components/MiniChat";
import { supabase } from "../../../services/api/supabase";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

const fmtTime = s =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Toast de regalo entrante ─────────────────────────────
function IncomingGiftToast({ gift, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 999,
        background: "rgba(244,114,182,.2)",
        border: "1px solid rgba(244,114,182,.5)",
        backdropFilter: "blur(12px)",
        animation: "toast-in .4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <span style={{ fontSize: 28 }}>{gift.emoji}</span>
      <div>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{gift.name}</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11 }}>
          💜 +${gift.cost} ganados
        </div>
      </div>
    </div>
  );
}

function CreatorCallLayout({ camOff }) {
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

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
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
          <span style={{ fontSize: 80, opacity: 0.2 }}>🌸</span>
        </div>
      )}

      {thumbTrack && (!camOff || swapped) && (
        <div
          onClick={() => setSwapped(s => !s)}
          style={{
            position: 'absolute', bottom: 140, right: 16,
            width: 100, height: 140,
            borderRadius: 16, overflow: 'hidden',
            border: '2px solid rgba(244,114,182,.3)',
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


export default function CreatorVideoCall({
  user    = { id: "mock_user_1", name: "Carlos" },
  onEnd,
  token   = null,
  roomName = null,
}) {
  const [secs, setSecs]             = useState(0);
  const [status, setStatus]         = useState("connecting");
  const [muted, setMuted]           = useState(false);
  const [camOff, setCamOff]         = useState(false);
  const [showChat, setShowChat]     = useState(false);
  const [earnings, setEarnings]     = useState(0);
  const [activeGift, setActiveGift] = useState(null);

  const _localVideoRef  = useRef(null);
  const _remoteVideoRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setStatus("connected"), 1500);
    const t2 = setInterval(() => setSecs(s => s + 1), 1000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  // Mock: simula un regalo entrante a los 5 segundos
  // BACKEND: borrar este useEffect, reemplazar con socket
  useEffect(() => {
    const t = setTimeout(() => {
      setActiveGift({ emoji: "💎", name: "Diamante", cost: 40, color: "#7c3aed" });
      setEarnings(e => e + 18); // 45% de $40
    }, 5000);
    return () => clearTimeout(t);
  }, []);


// ── Finalizar llamada ──
const handleEnd = async () => {
  setStatus("ended");
  if (roomName) {
    await supabase
      .from("call_requests")
      .update({ status: "ended" })
      .eq("room_name", roomName)
      .eq("status", "accepted");
  }
  onEnd?.();
};

// ── Escuchar si el user cuelga ──
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

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── VIDEO REMOTO / LIVEKIT ── */}
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
      <CreatorCallLayout camOff={camOff} />
    </LiveKitRoom>
  ) : (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1a0830, #09080f)" }}
    >
      <span style={{ fontSize: 160, opacity: 0.15 }}>👤</span>
    </div>
  )}
</div>

      {/* ── TOAST REGALO ENTRANTE ── */}
      {activeGift && (
        <IncomingGiftToast
          gift={activeGift}
          onDone={() => setActiveGift(null)}
        />
      )}

      {/* ── BARRA SUPERIOR ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.7), transparent)" }}
      >
        {/* Timer */}
        <div className="text-white font-mono text-base font-semibold">
          {fmtTime(secs)}
        </div>

        {/* Badge ganancias */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(124,58,237,.2)",
            border: "1px solid rgba(124,58,237,.4)",
          }}
        >
          <span className="text-sm">💜</span>
          <span className="text-xs font-bold" style={{ color: "#c084fc" }}>
            ${earnings}
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,.4)" }}>
            ganados
          </span>
        </div>
      </div>

      {/* ── ESTADO CONECTANDO ── */}
      {status === "connecting" && !token && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-6xl mb-4">🌸</div>
          <div
            className="text-white text-2xl font-semibold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {user.name}
          </div>
          <div className="text-white/60 text-sm">Conectando...</div>
        </div>
      )}

      {/* ── BOTÓN MINI CHAT ── */}
      <div className="absolute z-20" style={{ bottom: 120, left: 20 }}>
        <button
          onClick={() => setShowChat(c => !c)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer active:scale-90 transition-transform"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: showChat ? "rgba(244,114,182,.35)" : "rgba(255,255,255,.15)",
              backdropFilter: "blur(10px)",
              border: showChat ? "1px solid rgba(244,114,182,.6)" : "none",
            }}
          >
            <span className="text-2xl">💬</span>
          </div>
          <span className="text-white/60 text-[10px]">Chat</span>
        </button>
      </div>

      {/* ── CONTROLES ── */}
      <CallControls
        muted={muted}
        camOff={camOff}
        onToggleMute={() => setMuted(m => !m)}
        onToggleCam={() => setCamOff(c => !c)}
        onEnd={handleEnd}
        miniChatAbierto={showChat}
      />

      {/* ── MINI CHAT ── */}
      {showChat && (
        <MiniChat theme="dark" onClose={() => setShowChat(false)} role="creator" roomName={roomName} userId={user.id} />
      )}

      <style>{`
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}