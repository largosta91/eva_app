// 📁 src/features/calls/components/VideoCall.jsx
import { useState, useEffect, useRef } from "react";
import GiftPanel                       from "../../chat/components/GiftPanel";
import CallControls                    from "./CallControls";
import MiniChat                        from "./MiniChat.jsx";
import { supabase }                    from "../../../services/api/supabase";

import sonidobasico from "../../../assets/sounds/sonidobasico.mp3";
import rosa         from "../../../assets/sounds/rosa.mp3";
import copadevino   from "../../../assets/sounds/DandyCinzano.mp3";
import diamante2    from "../../../assets/sounds/diamante2.mp3";
import anillo       from "../../../assets/sounds/anillo.mp3";
import bolsadeoro   from "../../../assets/sounds/bolsadeoro.mp3";
import unicornio    from "../../../assets/sounds/unicornio.mp3";
import Fenix        from "../../../assets/sounds/sonidoFenix.mp3";
import japonTokio   from "../../../assets/sounds/japonTokio.mp3";
import helicopter   from "../../../assets/sounds/helicopter.mp3";
import avion        from "../../../assets/sounds/avion.mp3";
import winner       from "../../../assets/sounds/winner.mp3";
import copaDeOro    from "../../../assets/sounds/copaDeOro.mp3";

const SOUNDS = {
  basico:      sonidobasico,
  rosa:        rosa,
  copa:        copadevino,
  diamante:    diamante2,
  corona:      anillo,
  oro:         bolsadeoro,
  unicornio:   unicornio,
  sonidoFenix: Fenix,
  japonTokio:  japonTokio,
  helicopter:  helicopter,
  avion:       avion,
  winner:      winner,
  copaDeOro:   copaDeOro,
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
 
function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  const [particles] = useState(() => makeOverlayParticles(24));
 
  const isFullscreen = [8, 17, 18].includes(gift.id);
  const isMedium     = gift.id === 11;
 
  useEffect(() => {
    const showMs = gift.duration ?? (isFullscreen || isMedium ? 4000 : 2000);
    const t1 = setTimeout(() => setPhase("out"), showMs);
    const t2 = setTimeout(() => onDone?.(), showMs + 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  // ── AUTO: pantalla casi completa (85%) ──
  if (isMedium) {
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
              width: "85%",
              height: "85%",
              objectFit: "contain",
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
            {gift.name}
          </div>
        </div>
      </>
    );
  }
 
  // ── ORO / UNICORNIO / FÉNIX: pantalla completa ──
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
            {gift.name}
          </div>
        </div>
      </>
    );
  }
 
  // ── RESTO DE GIFTS ──
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
              width: 340,
              height: 340,
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
 
        <div style={{
          background: `${gift.color}22`,
          border: `1px solid ${gift.color}88`,
          borderRadius: "24px",
          padding: "6px 20px",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 600,
          animation: "gift-name-in 0.4s ease-out 0.3s both",
        }}>
          {gift.name}
        </div>
      </div>
    </>
  );
}
 
const fmtTime = s =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
 
export default function VideoCall({
  user    = { id: "mock_user_1",    name: "Carlos", credits: 0 },
  creator = { id: "mock_creator_1", name: "Sofía",  avatar: null },
  onEnd,
  theme = "dark",
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
    supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setCredits(data.credits); });
  }, [user.id]);
 
  // ── Timer de llamada ──
  useEffect(() => {
    const t1 = setTimeout(() => setStatus("connected"), 1500);
    const t2 = setInterval(() => {
      setSecs(prev => {
        if ((prev + 1) % 30 === 0) setCredits(c => Math.max(0, c - 1));
        return prev + 1;
      });
    }, 1000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);
 
  // ── Enviar regalo y descontar en Supabase ──
  const sendGift = async (gift) => {
  if (credits < gift.cost) return;

  const newCredits = credits - gift.cost;
  const { error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", user.id);

  if (error) { console.error("Error descontando créditos:", error); return; }

  playGiftSound(gift.soundKey); // ← acá
  setCredits(newCredits);
  setShowGifts(false);
  setActiveGift(gift);
};
 
  const handleEnd = () => {
    setStatus("ended");
    onEnd?.();
  };
 
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
 
      <div className="absolute inset-0">
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1a0830, #09080f)" }}>
          <span style={{ fontSize: 160, opacity: 0.15 }}>💫</span>
        </div>
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
        <div className="text-white font-mono text-base font-semibold">{fmtTime(secs)}</div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(201,168,76,.2)", border: "1px solid rgba(201,168,76,.4)" }}>
          <span className="text-sm">💎</span>
          <span className="text-[#c9a84c] text-xs font-bold">{credits}</span>
          <span className="text-[#7a748f] text-xs">· −2/min</span>
        </div>
      </div>
 
      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-6xl mb-4">🌺</div>
          <div className="text-white text-2xl font-semibold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {creator.name}
          </div>
          <div className="text-white/60 text-sm">Conectando...</div>
        </div>
      )}
 
      <div className="absolute z-20 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ bottom: 140, right: 16, width: 100, height: 140, background: "#1a1826", border: "2px solid rgba(255,255,255,.2)" }}>
        <span style={{ fontSize: 40, filter: camOff ? "grayscale(1) opacity(.3)" : "none" }}>
          {camOff ? "🚫" : "🤳"}
        </span>
      </div>
 
      <div className="absolute z-20" style={{ bottom: 120, left: 20 }}>
        <button
          onClick={() => setShowGifts(true)}
          className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer active:scale-90 transition-transform"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)" }}>
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
        <MiniChat theme={theme} onClose={() => setShowChat(false)} />
      )}
 
    </div>
  );
}