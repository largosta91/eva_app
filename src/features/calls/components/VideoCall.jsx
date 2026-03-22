// 📁 src/features/calls/components/VideoCall.jsx
import { useState, useEffect, useRef } from "react";
import GiftPanel                       from "../../chat/components/GiftPanel";
import CallControls                    from "./CallControls";
import SubtitlesOverlay                from "./SubtitlesOverlay";
import MiniChat                        from "./MiniChat.jsx";
import { createTranscriptionService }  from "../services/transcriptionService"

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

function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  const [particles] = useState(() => makeOverlayParticles(24));

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 2000);
    const t2 = setTimeout(() => onDone?.(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{OVERLAY_KEYFRAMES}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "fixed",
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

        <span style={{
          fontSize: "120px", lineHeight: 1,
          filter: `drop-shadow(0 0 40px ${gift.color})`,
        }}>
          {gift.emoji}
        </span>

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
  user    = { id: "mock_user_1",    name: "Carlos", credits: 120 },
  creator = { id: "mock_creator_1", name: "Sofía",  avatar: null },
  onEnd,
  theme = "dark",
}) {
  const [secs, setSecs]             = useState(0);
  const [status, setStatus]         = useState("connecting");
  const [credits, setCredits]       = useState(user.credits);
  const [muted, setMuted]           = useState(false);
  const [camOff, setCamOff]         = useState(false);
  const [showGifts, setShowGifts]   = useState(false);
  const [activeGift, setActiveGift] = useState(null);
  const [showChat, setShowChat]     = useState(false); // ⭐ toggle mini chat

  // ── Subtítulos ─────────────────────────────────────────────
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText,   setFinalText]   = useState("");
  const recognitionRef = useRef(null);

  const toggleSubtitles = () => {
    if (subtitlesOn) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setInterimText("");
      setFinalText("");
      setSubtitlesOn(false);
    } else {
      recognitionRef.current = createTranscriptionService((text, isFinal) => {
        if (isFinal) { setFinalText(text); setInterimText(""); }
        else          { setInterimText(text); }
      }, "es-ES");
      setSubtitlesOn(true);
    }
  };

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const _localVideoRef  = useRef(null);
  const _remoteVideoRef = useRef(null);

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

  const sendGift = (gift) => {
    setCredits(c => Math.max(0, c - gift.cost));
    setShowGifts(false);
    setActiveGift(gift);
    console.log("Regalo enviado durante llamada (mock):", gift);
  };

  const handleEnd = () => {
    recognitionRef.current?.stop();
    setStatus("ended");
    onEnd?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* ── VIDEO REMOTO ── */}
      <div className="absolute inset-0">
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1a0830, #09080f)" }}>
          <span style={{ fontSize: 160, opacity: 0.15 }}>🌺</span>
        </div>
      </div>

      {/* ── OVERLAY DEL REGALO EN EL CENTRO ── */}
      {activeGift && (
        <GiftOverlay
          gift={activeGift}
          onDone={() => setActiveGift(null)}
        />
      )}

      {/* ── SUBTÍTULOS ── */}
      <SubtitlesOverlay
        interimText={interimText}
        finalText={finalText}
        isListening={subtitlesOn}
        theme={theme}
      />

      {/* ── BARRA SUPERIOR ── */}
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

      {/* ── ESTADO CONECTANDO ── */}
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

      {/* ── VIDEO LOCAL ── */}
      <div className="absolute z-20 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ bottom: 140, right: 16, width: 100, height: 140, background: "#1a1826", border: "2px solid rgba(255,255,255,.2)" }}>
        <span style={{ fontSize: 40, filter: camOff ? "grayscale(1) opacity(.3)" : "none" }}>
          {camOff ? "🚫" : "🤳"}
        </span>
      </div>

      {/* ── BOTÓN DE REGALOS ── */}
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

      {/* ⭐ BOTÓN MINI CHAT */}
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

      {/* ── CONTROLES ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <CallControls
          muted={muted}
          camOff={camOff}
          subtitlesOn={subtitlesOn}
          onToggleMute={() => setMuted(m => !m)}
          onToggleCam={() => setCamOff(c => !c)}
          onEnd={handleEnd}
          onToggleSubtitles={toggleSubtitles}
        />
      </div>

      {/* ── PANEL DE REGALOS ── */}
      {showGifts && (
        <GiftPanel
          context="call"
          onSend={sendGift}
          onClose={() => setShowGifts(false)}
          credits={credits}
          theme={theme}
        />
      )}

      {/* ⭐ MINI CHAT OVERLAY — se maneja solo con position fixed */}
      {showChat && (
        <MiniChat theme={theme} onClose={() => setShowChat(false)} />
      )}

    </div>
  );
}