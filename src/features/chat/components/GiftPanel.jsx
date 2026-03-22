import { useRef } from "react";


/* ─────────────────────────────
   SONIDOS (forma correcta en Vite)
───────────────────────────── */

const sonidoCopa = new URL(
  "../../../assets/sounds/copa_de_vino.wav.mp3",
  import.meta.url
).href;

const sonidoDiamante = new URL(
  "../../../assets/sounds/diamante.wav.mp3",
  import.meta.url
).href;

const sonidoAnillo = new URL(
  "../../../assets/sounds/anillo.wav.mp3",
  import.meta.url
).href;

const sonidoOro = new URL(
  "../../../assets/sounds/bolsa_de_oro.wav.mp3",
  import.meta.url
).href;

/* ─────────────────────────────
   REGALOS
───────────────────────────── */

const GIFTS = [
  { id: 1, name: "Beso",     emoji: "💋", cost: 5,   color: "#ff6b8a", sound: null },
  { id: 3, name: "Copa",     emoji: "🍷", cost: 20,  color: "#9b2335", sound: sonidoCopa },
  { id: 4, name: "Diamante", emoji: "💎", cost: 100, color: "#7c3aed", sound: sonidoDiamante },
  { id: 5, name: "Anillo",   emoji: "💍", cost: 300, color: "#c9a84c", sound: sonidoAnillo },
  { id: 6, name: "Oro",      emoji: "💰", cost: 500, color: "#c9a84c", sound: sonidoOro },
];

/* ─────────────────────────────
   COMPONENTE
───────────────────────────── */

const GiftPanel = ({ onSend, onClose }) => {
  // ✅ mantiene el audio vivo (clave para que funcione)
  const audioRef = useRef(null);

  const handleGiftClick = (gift) => {
    if (gift.sound) {
      try {
        // detener sonido anterior
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(gift.sound);
        audio.volume = 0.8;

        audioRef.current = audio;

        audio.play().catch((e) =>
          console.warn("Audio bloqueado por navegador:", e)
        );
      } catch (err) {
        console.warn("Error reproduciendo sonido:", err);
      }
    }

    onSend?.(gift);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0f0e17",
        padding: "15px",
        zIndex: 100,
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -10px 25px rgba(0,0,0,0.5)",
      }}
    >
      {GIFTS.map((gift) => (
        <button
          key={gift.id}
          onClick={() => handleGiftClick(gift)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "12px",
            minWidth: "70px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "30px" }}>{gift.emoji}</span>

          <span
            style={{
              fontSize: "10px",
              color: "#fff",
              marginTop: "4px",
            }}
          >
            {gift.name}
          </span>

          <span
            style={{
              fontSize: "10px",
              color: "#c9a84c",
            }}
          >
            💎 {gift.cost}
          </span>
        </button>
      ))}

      {/* cerrar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          right: 10,
          top: 5,
          color: "#fff",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default GiftPanel;