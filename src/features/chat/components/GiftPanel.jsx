import { useEffect, useRef } from "react";
import { GIFTS } from "../../../constants/gifts";

/* ─────────────────────────────
   SONIDOS (forma correcta en Vite)
───────────────────────────── */
const SOUNDS = {
  basico:   new URL("../../../assets/sounds/sonidobasico.mp3", import.meta.url).href,
  rosa:     new URL("../../../assets/sounds/rosa.mp3",         import.meta.url).href,
  copa:     new URL("../../../assets/sounds/copadevino.mp3",   import.meta.url).href,
  diamante: new URL("../../../assets/sounds/diamante2.mp3",    import.meta.url).href,
  anillo:   new URL("../../../assets/sounds/anillo.mp3",       import.meta.url).href,
  oro:      new URL("../../../assets/sounds/bolsadeoro.mp3",   import.meta.url).href,
};

const GiftPanel = ({ onSend, onClose }) => {
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current.scrollTo({ left: 70, behavior: "smooth" });
        setTimeout(() => {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }, 600);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGiftClick = (gift) => {
    const sound = SOUNDS[gift.soundKey];
    if (sound) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        const audio = new Audio(sound);
        audio.volume = 0.8;
        audioRef.current = audio;
        audio.play().catch((e) => console.warn("Audio bloqueado:", e));
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
        padding: "35px 0 15px 0",
        zIndex: 100,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -10px 25px rgba(0,0,0,0.5)",
      }}
    >
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          padding: "0 15px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
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
              padding: "12px 10px",
              borderRadius: "16px",
              minWidth: "110px",
              flexShrink: 0,
              cursor: "pointer",
              transition: "transform 0.1s",
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
        <div style={{ minWidth: "20px", height: "10px" }} />
      </div>

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