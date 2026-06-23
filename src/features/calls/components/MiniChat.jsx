import { useState, useEffect, useRef } from "react";
import MessageBubble from "../../chat/components/MessageBubble.jsx";
import GiftPanel from "../../chat/components/GiftPanel.jsx";
import Input from "../../../components/ui/Input.jsx";
import { supabase } from "../../../services/api/supabase";

import sonidobasico from "../../../assets/sounds/sonidobasico.mp3";
import rosa         from "../../../assets/sounds/rosa.mp3";
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
import chocolate    from "../../../assets/sounds/wow.mp3";
import oso          from "../../../assets/sounds/oso.mp3";
import colibri      from "../../../assets/sounds/colibri.mp3";

// ── Sonidos ──────────────────────────────────────────────────────────────────
const SOUNDS = {
  basico:      sonidobasico,
  rosa:        rosa,
  copa:        copa,
  diamante:    diamante,
  anillo:      anillo,
  asombro:     asombro,
  japonTokio:  japonTokio,
  helicopter:  helicopter,
  avion:       avion,
  pirotecnia:  pirotecnia,
  tragamoneda: tragamoneda,
  unicornio:   unicornio,
  sonidoFenix: Fenix,
  chocolate:   chocolate,
  oso:         oso,
  colibri:     colibri,
};

const playGiftSound = (soundKey) => {
  const src = SOUNDS[soundKey];
  if (!src) return;
  new Audio(src).play().catch(() => {});
};

// ── Keyframes (idénticos a VideoCall) ────────────────────────────────────────
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

// ── GiftOverlay — idéntico a VideoCall ───────────────────────────────────────
// zIndex usa 9998/9999 para quedar encima del MiniChat (z:30) y de todo lo demás
function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  const [particles] = useState(() => makeOverlayParticles(24));

  // Mismos IDs que VideoCall
  const isFullscreen = [3, 8, 11, 17, 18].includes(gift.id);
  const isLarge      = [10, 12, 13, 14, 15, 16, 19].includes(gift.id);

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
          position: "fixed", inset: 0, zIndex: 9999,
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
          {/* Sin nombre en fullscreen — igual que VideoCall */}
        </div>
      </>
    );
  }

  // ── GRUPO 2: pantalla grande ──
  if (isLarge) {
    return (
      <>
        <style>{OVERLAY_KEYFRAMES}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
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

      {/* Fondo oscuro */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }} />

      {/* Contenedor centrado — igual que VideoCall pero con position:fixed */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        pointerEvents: "none",
        animation: phase === "in"
          ? "gift-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "gift-overlay-out 0.5s ease-in forwards",
      }}>
        {/* Confetti */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%", background: p.bg,
            "--cx": p.cx, "--cy": p.cy, "--cr": p.cr,
            animation: "overlay-confetti 1s ease-out forwards",
          }} />
        ))}

        {/* Imagen o emoji */}
        {gift.image ? (
          <GiftMedia
            src={gift.image}
            alt={gift.name}
            style={{
              width: "75vw",
              height: "75vw",
              maxWidth: "340px",
              maxHeight: "340px",
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

// ── Traducción ────────────────────────────────────────────────────────────────
const fetchTranslation = async (text) => {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({ q: text, source: "auto", target: "es", format: "text" }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
};

// ── MiniChat ──────────────────────────────────────────────────────────────────
export default function MiniChat({ theme = "dark", onClose, role = "user", creator, credits, onCreditsUpdate, roomName, userId }) {
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState("");
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [activeGift, setActiveGift]       = useState(null);
  const [sending, setSending]             = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);

  const bottomRef    = useRef(null);


  const channelRef = useRef(null);
  useEffect(() => {
    console.log("[MiniChat] suscribiendo canal, roomName:", roomName, "userId:", userId);
    if (!roomName) return;
    const ch = supabase.channel(`call:${roomName}`)
      .on("broadcast", { event: "chat_message" }, async ({ payload }) => {
        if (payload.sender_id === userId) return;
        let msgText = payload.text;
        if (translateRef.current) msgText = await fetchTranslation(payload.text);
        setMessages(prev => [...prev, { id: payload.id, text: msgText, sender: "them" }]);
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [roomName]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    const currentInput = text.trim();
    if (!currentInput || !roomName) return;
    const msg = { id: Date.now(), text: currentInput, sender_id: userId };
    setMessages(prev => [...prev, { id: msg.id, text: msg.text, sender: "me" }]);
    setText("");
    await channelRef.current?.send({
      type: "broadcast", event: "chat_message", payload: msg,
    });
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSend(); };

  // ── Enviar regalo seguro via RPC — el costo lo decide Postgres, nunca el frontend ──
  const handleGiftSend = async (gift) => {
    if (!creator?.id) {
      console.error("No hay creator definido");
      return;
    }

    // Verificación optimista local (el backend igual valida con FOR UPDATE)
    if (credits < gift.cost) {
      console.warn("Créditos insuficientes");
      return;
    }

    if (sending) return; // evitar doble tap
    setSending(true);

    const { data, error } = await supabase.rpc("send_gift", {
      p_creator_id: creator.id,
      p_gift_name:  gift.name,
      // sin p_gift_cost ni p_gift_emoji — el costo lo decide Postgres
    });

    setSending(false);

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

    // UI solo se actualiza si el backend confirmó
    onCreditsUpdate?.(data.credits_remaining);
    playGiftSound(gift.soundKey);
    setActiveGift(gift);
    setShowGiftPanel(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: `${gift.emoji} ${gift.name}`, sender: "me" }
    ]);
  };

  const btnStyle = {
    flex: 2,
    fontSize: "14px",
    padding: "8px 0",
    background: "linear-gradient(135deg, #c9a84c, #f0d882)",
    border: "none",
    borderRadius: "999px",
    color: "#09080f",
    fontWeight: 700,
    cursor: sending ? "not-allowed" : "pointer",
    opacity: sending ? 0.6 : 1,
    minWidth: 0,
  };

  return (
    <>
      {/* Overlay fuera del div del chat para ser fullscreen real */}
      {activeGift && (
        <GiftOverlay
          gift={activeGift}
          onDone={() => setActiveGift(null)}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100vw",
          maxWidth: "520px",
          height: "35vh",
          maxHeight: "300px",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          background: theme === "dark" ? "rgba(18,15,30,0.92)" : "rgba(253,246,240,0.93)",
          border: "1px solid rgba(255,255,255,.12)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        }}
      >
        {/* HEADER */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "rgba(255,255,255,.6)", fontSize: "11px", fontWeight: 600 }}>
              💬 Chat
            </span>
            <button
              onClick={() => setTranslateEnabled(prev => !prev)}
              style={{
                background: translateEnabled ? "#c9a84c" : "transparent",
                border: "1px solid #c9a84c",
                borderRadius: "4px",
                color: translateEnabled ? "#000" : "#c9a84c",
                fontSize: "9px",
                padding: "1px 4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {translateEnabled ? "TRAD ON" : "TRAD OFF"}
            </button>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: "14px", cursor: "pointer" }}>
              ✕
            </button>
          )}
        </div>

        {/* MENSAJES */}
        <div style={{ flex: 2, overflowY: "auto", padding: "8px" }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} theme={theme} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}>
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribir..."
            style={{ flex: 4, fontSize: "12px", minWidth: 0 }}
          />
          <button onClick={handleSend} style={btnStyle}>➤</button>
          {role === "user" && (
            <button
              onClick={() => !sending && setShowGiftPanel(!showGiftPanel)}
              style={btnStyle}
            >
              🎁
            </button>
          )}
        </div>

        {/* GIFT PANEL */}
        {showGiftPanel && role === "user" && (
          <GiftPanel
            context="chat"
            onSend={handleGiftSend}
            onClose={() => setShowGiftPanel(false)}
          />
        )}
      </div>
    </>
  );
}






