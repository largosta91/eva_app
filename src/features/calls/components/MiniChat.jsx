import { useState, useEffect, useRef } from "react";
import MessageBubble from "../../chat/components/MessageBubble.jsx";
import GiftPanel from "../../chat/components/GiftPanel.jsx";
import Input from "../../../components/ui/Input.jsx";

export default function MiniChat({ theme = "dark", onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    setMessages([...messages, { id: Date.now(), text, sender: "me" }]);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleGiftSend = (gift) => {
    setMessages([...messages, { id: Date.now(), text: gift.emoji + " " + gift.name, sender: "me" }]);
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
        background: theme === "dark"
          ? "rgba(18,15,30,0.92)"
          : "rgba(253,246,240,0.93)",
        border: "1px solid rgba(255,255,255,.12)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      }}
    >
      {/* Header con botón cerrar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        flexShrink: 0,
      }}>
        <span style={{ color: "rgba(255,255,255,.6)", fontSize: "11px", fontWeight: 600 }}>
          💬 Chat
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.5)",
              fontSize: "14px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div style={{ flex: 2, overflowY: "auto", padding: "8px" }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} theme={theme} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input + botones nativos */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
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
        <button onClick={() => setShowGiftPanel(!showGiftPanel)} style={btnStyle}>🎁</button>
      </div>

      {/* Gift Panel */}
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