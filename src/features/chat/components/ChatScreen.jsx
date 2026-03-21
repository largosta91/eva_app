import { useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import GiftPanel from "./GiftPanel.jsx";

// ── BACKEND ────────────────────────────────────────────────────────────────
// Este componente está listo para conectarse a sockets o API.
// Ahora usa mensajes mockeados y simula typing.
// TODO: reemplazar setTimeout por socket.on('message') y socket.on('typing')

export default function ChatScreen({ context = "chat", theme = "dark" }) {
  const [messages, setMessages] = useState([
    { id: 1, who: "them", text: "Hola 👋", time: "10:23" },
    { id: 2, who: "me", text: "Hola! 😄", time: "10:24" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), who: "me", text: input, time: "10:25" };
    setMessages([...messages, newMsg]);
    setInput("");
    setIsTyping(true);

    // Simulación de respuesta
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, who: "them", text: "¡Qué interesante! 🔥", time: "10:26" },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09080f] text-[#ede8ff]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} theme={theme} />
        ))}
        {isTyping && <TypingIndicator theme={theme} />}
      </div>

      {/* Panel de regalos — cambia según contexto */}
      <GiftPanel context={context} />

      <div className="p-4 flex gap-2 border-t border-[#1f1d2b]">
        <input
          type="text"
          className="flex-1 rounded-lg bg-[#1f1d2b] px-3 py-2 text-[#ede8ff] focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
