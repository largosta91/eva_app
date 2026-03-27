import { useState, useEffect, useRef } from "react";
import MessageBubble from "../../chat/components/MessageBubble.jsx";
import GiftPanel from "../../chat/components/GiftPanel.jsx";
import Input from "../../../components/ui/Input.jsx";

// --- Función de Traducción ---
const fetchTranslation = async (text) => {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: "es",
        format: "text"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
};

export default function MiniChat({ theme = "dark", onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);

  const bottomRef = useRef(null);

  // ✅ REF que siempre tiene el valor actual del traductor
  const translateRef = useRef(translateEnabled);

  useEffect(() => {
    translateRef.current = translateEnabled;
  }, [translateEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const currentInput = text.trim();
    if (!currentInput) return;

    // 1️⃣ Mensaje del usuario
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: currentInput, sender: "me" }
    ]);

    setText("");

    // 2️⃣ Respuesta simulada
    setTimeout(async () => {
      const aiResponse = "I am so glad you are here!";
      
      console.log("Estado traductor ACTUAL:", translateRef.current);

      let finalMsg = aiResponse;

      // ✅ usa el REF (estado siempre actualizado)
      if (translateRef.current) {
        console.log("Traducción activa, llamando API...");
        finalMsg = await fetchTranslation(aiResponse);
      } else {
        console.log("Traducción OFF, enviando original.");
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: finalMsg,
          sender: "them"
        }
      ]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleGiftSend = (gift) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: `${gift.emoji} ${gift.name}`,
        sender: "me"
      }
    ]);
    setShowGiftPanel(false);
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
    cursor: "pointer",
    minWidth: 0,
  };

  return (
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
        background:
          theme === "dark"
            ? "rgba(18,15,30,0.92)"
            : "rgba(253,246,240,0.93)",
        border: "1px solid rgba(255,255,255,.12)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: "rgba(255,255,255,.6)",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
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
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.5)",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribir..."
          style={{ flex: 4, fontSize: "12px", minWidth: 0 }}
        />

        <button onClick={handleSend} style={btnStyle}>
          ➤
        </button>

        <button
          onClick={() => setShowGiftPanel(!showGiftPanel)}
          style={btnStyle}
        >
          🎁
        </button>
      </div>

      {showGiftPanel && (
        <GiftPanel
          context="chat"
          onSend={handleGiftSend}
          onClose={() => setShowGiftPanel(false)}
        />
      )}
    </div>
  );
}