import { useEffect, useRef } from "react";
import { GIFTS } from "../../../constants/gifts";

import sonidobasico from "../../../assets/sounds/sonidobasico.mp3";
import rosa         from "../../../assets/sounds/rosa.mp3";
import copadevino   from "../../../assets/sounds/copadevino.mp3";
import diamante2    from "../../../assets/sounds/diamante2.mp3";
import anillo       from "../../../assets/sounds/anillo.mp3";
import bolsadeoro   from "../../../assets/sounds/bolsadeoro.mp3";

const SOUNDS = {
  basico:   sonidobasico,
  rosa:     rosa,
  copa:     copadevino,
  diamante: diamante2,
  corona:   anillo,
  oro:      bolsadeoro,
};

const GiftPanel = ({ onSend, onClose }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (!mounted || !scrollRef.current) return;
      scrollRef.current.scrollTo({ left: 70, behavior: "smooth" });
      setTimeout(() => {
        if (!mounted || !scrollRef.current) return;
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }, 600);
    }, 400);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSend = (gift) => {
    const soundSrc = SOUNDS[gift.soundKey];
    if (soundSrc) {
      const audio = new Audio(soundSrc);
      audio.play().catch(() => {});
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
            onClick={() => handleSend(gift)}
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