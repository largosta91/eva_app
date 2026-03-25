import { useEffect, useRef } from "react";

/* ─────────────────────────────
   SONIDOS (forma correcta en Vite)
───────────────────────────── */
const sonidoBasico = new URL("../../../assets/sounds/sonidobasico.mp3", import.meta.url).href;
const sonidoRosa = new URL("../../../assets/sounds/rosa.mp3", import.meta.url).href;
const sonidoCopa = new URL("../../../assets/sounds/copadevino.mp3", import.meta.url).href;
const diamante = new URL("../../../assets/sounds/diamante2.mp3", import.meta.url).href;
const sonidoAnillo = new URL("../../../assets/sounds/anillo.mp3", import.meta.url).href;
const sonidoOro = new URL("../../../assets/sounds/bolsadeoro.mp3", import.meta.url).href;

const GIFTS = [
  { id: 1, name: "Beso",     emoji: "💋", cost: 5,    color: "#ff6b8a", sound: sonidoBasico },
  { id: 2, name: "Fuego",    emoji: "🔥", cost: 12,   color: "#ff4500", sound: sonidoBasico },
  { id: 3, name: "Corazón",  emoji: "❤️", cost: 10,   color: "#ff0000", sound: sonidoBasico },
  { id: 4, name: "Rosa",     emoji: "🌹", cost: 7,    color: "#ff007f", sound: sonidoRosa },
  { id: 5, name: "Copa",     emoji: "🍷", cost: 20,   color: "#9b2335", sound: sonidoCopa },
  { id: 6, name: "Diamante", emoji: "💎", cost: 100,  color: "#7c3aed", sound: diamante },
  { id: 7, name: "Anillo",   emoji: "💍", cost: 300,  color: "#c9a84c", sound: sonidoAnillo },
  { id: 8, name: "ORO",      emoji: "💰", cost: 1000, color: "#c9a84c", sound: sonidoOro },
];

/* ─────────────────────────────
   COMPONENTE
───────────────────────────── */
const GiftPanel = ({ onSend, onClose }) => {
  const audioRef = useRef(null);
  const scrollRef = useRef(null); // ✅ Ref para el auto-scroll

  // 🪄 Visual Cue: Animación de "asomada" al montar
  useEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        // Va un poco a la derecha
        scrollRef.current.scrollTo({ left: 70, behavior: "smooth" });
        
        // Vuelve al inicio tras 600ms
        setTimeout(() => {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }, 600);
      }, 400); // Pequeña espera para que el panel termine de subir
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGiftClick = (gift) => {
    if (gift.sound) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        const audio = new Audio(gift.sound);
        audio.volume = 0.8;
        audioRef.current = audio;
        audio.play().catch((e) => console.warn("Audio bloqueado:", e));
      } catch (err) {
        console.warn("Error reproduciendo sonido:", err);
      }
    }
    onSend?.(gift);
  };

  const giftsToRender = Array.isArray(GIFTS[0]) ? GIFTS.flat() : GIFTS;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#0f0e17",
        padding: "35px 0 15px 0", // Más espacio arriba para la X
        zIndex: 100,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -10px 25px rgba(0,0,0,0.5)",
      }}
    >
      {/* Contenedor del Scroll */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          padding: "0 15px",
          scrollbarWidth: "none", // Oculta barra en Firefox
          WebkitOverflowScrolling: "touch", // Scroll suave iOS
        }}
      >
        {giftsToRender.map((gift) => (
          <button
            key={gift.id}
            onClick={() => handleGiftClick(gift)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "12px 10px",
              borderRadius: "16px",
              minWidth: "110px", // ✅ Forzamos el corte visual
              flexShrink: 0,      // ✅ Evitamos que se compriman
              cursor: "pointer",
              transition: "transform 0.1s active",
            }}
          >
            <span style={{ fontSize: "32px" }}>{gift.emoji}</span>
            <span style={{ fontSize: "11px", color: "#fff", marginTop: "4px", fontWeight: "600" }}>
              {gift.name}
            </span>
            <span style={{ fontSize: "10px", color: "#c9a84c" }}>
              💎 {gift.cost}
            </span>
          </button>
        ))}
        {/* Espaciador final para que el último regalo no quede pegado */}
        <div style={{ minWidth: "20px", height: "10px" }} />
      </div>

      {/* Botón Cerrar: separado del scroll para que no se mueva */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          right: 12,
          top: 10,
          color: "#fff",
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "50%",
          width: "26px",
          height: "26px",
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 110,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default GiftPanel;