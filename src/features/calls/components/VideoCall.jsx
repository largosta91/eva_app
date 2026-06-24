// 📁 src/features/calls/components/VideoCall.jsx
import { useState, useEffect } from "react";
import GiftPanel                       from "../../chat/components/GiftPanel";
import CallControls                    from "./CallControls";
import MiniChat                        from "./MiniChat.jsx";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

import sonidobasico from "../../../assets/sounds/sonidobasico.mp3";
import rosa         from "../../../assets/sounds/rosa.mp3";
import chocolate    from "../../../assets/sounds/wow.mp3";
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
import oso          from "../../../assets/sounds/oso.mp3";
import colibri      from "../../../assets/sounds/colibri.mp3";


const SOUNDS = {
  basico:      sonidobasico,
  rosa:        rosa,
  chocolate:   chocolate,
  copa:        copa,
  diamante:    diamante,
  anillo:      anillo,
  oso:         oso,
  colibri:     colibri,
  asombro:     asombro,
  japonTokio:  japonTokio,
  helicopter:  helicopter,
  avion:       avion,
  pirotecnia:  pirotecnia,
  tragamoneda: tragamoneda,
  unicornio:   unicornio,
  sonidoFenix: Fenix
};


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

// eslint-disable-next-line react-refresh/only-export-components
function GiftMedia({ src, alt, style }) {
  if (isVideo(src)) {
    return <video src={src} autoPlay loop muted playsInline style={style} />;
  }
  return <img src={src} alt={alt} style={style} />;
}

// eslint-disable-next-line react-refresh/only-export-components
function CallLayout({ camOff }) {
  const [swapped, setSwapped] = useState(false);
  
  // 1. Quitamos onlySubscribed para mayor velocidad y estabilidad
  const tracks = useTracks([Track.Source.Camera]); 
  const { localParticipant } = useLocalParticipant();

  // 2. Búsqueda segura de tracks
  const remoteTrack = tracks.find(
    t => t.participant.identity !== localParticipant?.identity && t.publication?.track != null
  ) ?? null;

  const localTrack = tracks.find(
    t => t.participant.identity === localParticipant?.identity && t.publication?.track != null
  ) ?? null;

  // 3. Lógica robusta de intercambio
  const canSwap = Boolean(localTrack && remoteTrack);
  const isActuallySwapped = swapped && canSwap;

  const mainTrack  = isActuallySwapped ? localTrack  : remoteTrack;
  const thumbTrack = isActuallySwapped ? remoteTrack : localTrack;

  /* console log temporal para verificar la card que aparece al hacer video llamada */
  console.log('swapped:', swapped, 'mainTrack:', !!mainTrack, 'thumbTrack:', !!thumbTrack, 'canSwap:', canSwap);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>

      {/* Video principal — pantalla completa */}
      {mainTrack ? (
        <VideoTrack
          trackRef={mainTrack}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0830, #09080f)'
        }}>
          <span style={{ fontSize: 80, opacity: 0.2 }}>🌺</span>
        </div>
      )}

      {/* Video secundario — card chiquita, tappeable */}
      {/* Agregamos canSwap para asegurarnos de que no intente renderizar un track fantasma */}
      {canSwap && thumbTrack && (!camOff || swapped) && (
        <div
          onClick={() => setSwapped(s => !s)}
          style={{
            position: 'absolute', bottom: 140, right: 16,
            width: 100, height: 140,
            borderRadius: 16, overflow: 'hidden',
            border: '2px solid rgba(255,255,255,.3)',
            zIndex: 20,
            cursor: 'pointer',
          }}
        >
          <VideoTrack
            trackRef={thumbTrack}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function GiftOverlay({ gift, onDone }) {
  const [phase, setPhase] = useState("in");
  const [particles] = useState(() => makeOverlayParticles(24));

  const isFullscreen = [3,8,11,17,18].includes(gift.id);
  const isLarge      = [10,12,13,14,15,16,19].includes(gift.id);

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
          position: "fixed", inset: 0, zIndex: 60,
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
          <div style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: `${gift.color}22`,
            border: `1px solid ${gift.color}88`,
            borderRadius: "24px",
            padding: "6px 20px",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "2px",
            animation: "gift-name-in 0.4s ease-out 0.3s both",
          }}>
          </div>
        </div>
      </>
    );
  }

  // ── GRUPO 2: pantalla grande 85% ──
  if (isLarge) {
    return (
      <>
        <style>{OVERLAY_KEYFRAMES}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
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

      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
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

        {gift.image ? (
          <GiftMedia
            src={gift.image}
            alt={gift.name}
            style={{
              width: "75%",
              height: "75%",
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

//------------------------consulta de credito-----------------------------//

