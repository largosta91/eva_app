import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import GiftPanel from "./GiftPanel.jsx";

// ── Keyframes animación regalo ──────────────────────────────
const GIFT_KEYFRAMES = `
  @keyframes gift-pop-in {
    0%   { transform: translate(-50%, -50%) scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: translate(-50%, -50%) scale(1.2) rotate(5deg);  opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1)   rotate(0deg);  opacity: 1; }
  }
  @keyframes gift-pop-out {
    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
  }
  @keyframes gift-name-in {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

// ── Overlay animación regalo ────────────────────────────────
function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 2000);
    const t2 = setTimeout(() => onDone?.(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{GIFT_KEYFRAMES}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.45)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", zIndex: 61,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "12px", pointerEvents: "none",
        animation: phase === "in"
          ? "gift-pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "gift-pop-out 0.5s ease-in forwards",
      }}>
        <span style={{
          fontSize: "120px", lineHeight: 1,
          filter: `drop-shadow(0 0 40px ${gift.color})`,
        }}>
          {gift.emoji}
        </span>
        <div style={{
          background: `${gift.color}22`,
          border: `1px solid ${gift.color}88`,
          borderRadius: "24px", padding: "6px 20px",
          color: "#fff", fontSize: "16px", fontWeight: 600,
          animation: "gift-name-in 0.4s ease-out 0.3s both",
        }}>
          {gift.name}
        </div>
      </div>
    </>
  );
}

// ── ChatScreen ──────────────────────────────────────────────
export default function ChatScreen({ context = "chat", theme = "dark" }) {
  const [messages, setMessages] = useState([
    { id: 1, who: "them", sender: "them", text: "Hola 👋", time: "10:23" },
    { id: 2, who: "me",   sender: "me",   text: "Hola! 😄", time: "10:24" },
  ]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [activeGift, setActiveGift] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), who: "me", sender: "me", text: input, time: "10:25" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, who: "them", sender: "them", text: "¡Qué interesante! 🔥", time: "10:26" },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleGiftSend = (gift) => {
    // Agregar mensaje de regalo al chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      who: "me",
      sender: "me",
      type: "gift",
      text: `${gift.emoji} ${gift.name}`,
      giftColor: gift.color,
      time: "now",
    }]);
    setActiveGift(gift);   // dispara el overlay
    setShowGifts(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09080f] text-[#ede8ff]" style={{ position: "relative" }}>

      {/* Overlay animación regalo */}
      {activeGift && (
        <GiftOverlay gift={activeGift} onDone={() => setActiveGift(null)} />
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} theme={theme} />
        ))}
        {isTyping && <TypingIndicator theme={theme} />}
        <div ref={bottomRef} />
      </div>

      {/* Gift Panel */}
      {showGifts && (
        <GiftPanel
          context={context}
          onSend={handleGiftSend}
          onClose={() => setShowGifts(false)}
        />
      )}

      {/* Input */}
      <div className="p-4 flex gap-2 border-t border-[#1f1d2b]">
        {/* Botón regalos */}
        <button
          onClick={() => setShowGifts(g => !g)}
          style={{
            background: showGifts ? "rgba(201,168,76,.3)" : "rgba(255,255,255,.08)",
            border: showGifts ? "1px solid rgba(201,168,76,.6)" : "1px solid transparent",
            borderRadius: "50%", width: "40px", height: "40px",
            fontSize: "18px", cursor: "pointer", flexShrink: 0,
          }}
        >
          🎁
        </button>

        <input
          type="text"
          className="flex-1 rounded-lg bg-[#1f1d2b] px-3 py-2 text-[#ede8ff] focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-[#7c3aed] px-4 py-2 rounded-lg text-white hover:bg-[#6d28d9]"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
