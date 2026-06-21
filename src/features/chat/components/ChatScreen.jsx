import { useState, useRef, useEffect } from 'react';
import useAppStore from '../../../app/store/useAppStore';
import { lazy, Suspense } from 'react';

const VideoCall = lazy(() => import('../../calls/components/VideoCall'));
import GiftPanel from './GiftPanel';
import { supabase } from '../../../services/api/supabase';
import { StoryRing, StoryModal } from '../../creators/components/CreatorVideoStory';

const SOUNDS = {
  chocolate:   new URL("../../../assets/sounds/wow.mp3", import.meta.url).href,
  oso:         new URL("../../../assets/sounds/oso.mp3", import.meta.url).href,
  colibri:     new URL("../../../assets/sounds/colibri.mp3", import.meta.url).href,
  basico:      new URL("../../../assets/sounds/sonidobasico.mp3", import.meta.url).href,
  rosa:        new URL("../../../assets/sounds/rosa.mp3", import.meta.url).href,
  copa:        new URL("../../../assets/sounds/dandy.mp3", import.meta.url).href,
  diamante:    new URL("../../../assets/sounds/diamante.mp3", import.meta.url).href,
  anillo:      new URL("../../../assets/sounds/anillo.mp3", import.meta.url).href,
  asombro:     new URL("../../../assets/sounds/asombro.mp3", import.meta.url).href,
  unicornio:   new URL("../../../assets/sounds/unicornio.mp3", import.meta.url).href,
  sonidoFenix: new URL("../../../assets/sounds/sonidoFenix.mp3", import.meta.url).href,
  japonTokio:  new URL("../../../assets/sounds/japonTokio.mp3", import.meta.url).href,
  helicopter:  new URL("../../../assets/sounds/helicopter.mp3", import.meta.url).href,
  avion:       new URL("../../../assets/sounds/avion.mp3", import.meta.url).href,
  tragamoneda: new URL("../../../assets/sounds/tragamoneda.mp3", import.meta.url).href,
  pirotecnia:  new URL("../../../assets/sounds/pirotecnia.mp3", import.meta.url).href,
};

const playGiftSound = (soundKey) => {
  try {
    const src = SOUNDS[soundKey];
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = 0.8;

    audio.play().catch(e => {
      console.warn("Audio bloqueado:", e);
    });

  } catch (err) {
    console.warn("Error reproduciendo sonido:", err);
  }
};

const nowTime = () => {
  const d = new Date();

  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fetchTranslation = async (text) => {
  try {

    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|es`
    );

    const data = await res.json();

    return data.responseData.translatedText || text;

  } catch {
    return text;
  }
};

const showToast = (msg) => {

  const toast = document.createElement("div");

  toast.innerText = msg;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#c0392b";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.style.transition = "opacity 0.5s";
    toast.style.opacity = "0";

    setTimeout(() => {
      toast.remove();
    }, 500);

  }, 2500);
};

const isVideo = (src) => {
  return typeof src === "string" && src.endsWith(".mp4");
};

const OVERLAY_KEYFRAMES = `
  @keyframes gift-overlay-in {
    0%   { transform: translate(-50%, -50%) scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes gift-overlay-out {
    0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
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
    0% {
      transform: translate(0,0) rotate(0deg) scale(1);
      opacity: 1;
    }

    100% {
      transform: translate(var(--cx), var(--cy)) rotate(var(--cr)) scale(0);
      opacity: 0;
    }
  }
`;

const OVERLAY_COLORS = [
  "#c9a84c",
  "#fff",
  "#ff6b8a",
  "#7c3aed",
  "#4ade80"
];

function makeOverlayParticles(count) {

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: `${(Math.random() - 0.5) * 260}px`,
    cy: `${-(60 + Math.random() * 160)}px`,
    cr: `${(Math.random() - 0.5) * 720}deg`,
    size: 6 + Math.random() * 8,
    bg: OVERLAY_COLORS[
      Math.floor(Math.random() * OVERLAY_COLORS.length)
    ],
  }));
}

function GiftOverlay({ gift, onDone }) {

  const [phase, setPhase] = useState("in");

  const [particles] = useState(() => {
    return makeOverlayParticles(24);
  });

  const isFullscreen = [3, 8, 11, 17, 18].includes(gift.id);

  const isLarge = [10, 12, 13, 14, 15, 16].includes(gift.id);

  useEffect(() => {

    const showMs =
      gift.duration ??
      (isFullscreen || isLarge ? 4000 : 2000);

    const t1 = setTimeout(() => {
      setPhase("out");
    }, showMs);

    const t2 = setTimeout(() => {
      onDone?.();
    }, showMs + 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };

}, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isFullscreen) {

    return (
      <>
        <style>{OVERLAY_KEYFRAMES}</style>

        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            animation:
              phase === "in"
                ? "oro-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
                : "oro-overlay-out 0.5s ease-in forwards",
          }}
        >
          {
            isVideo(gift.image)
              ? (
                <video
                  src={gift.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: `drop-shadow(0 0 60px ${gift.color})`
                  }}
                />
              )
              : (
                <img
                  src={gift.image}
                  alt={gift.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: `drop-shadow(0 0 60px ${gift.color})`
                  }}
                />
              )
          }
        </div>
      </>
    );
  }

  if (isLarge) {

    return (
      <>
        <style>{OVERLAY_KEYFRAMES}</style>

        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            animation:
              phase === "in"
                ? "oro-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
                : "oro-overlay-out 0.5s ease-in forwards",
          }}
        >
          {
            isVideo(gift.image)
              ? (
                <video
                  src={gift.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "min(85vw, 80vh)",
                    height: "min(85vw, 95vh)",
                    objectFit: "contain",
                    filter: `drop-shadow(0 0 60px ${gift.color})`
                  }}
                />
              )
              : (
                <img
                  src={gift.image}
                  alt={gift.name}
                  style={{
                    width: "min(85vw, 80vh)",
                    height: "min(85vw, 95vh)",
                    objectFit: "contain",
                    filter: `drop-shadow(0 0 60px ${gift.color})`
                  }}
                />
              )
          }
        </div>
      </>
    );
  }

  return (
    <>
      <style>{OVERLAY_KEYFRAMES}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.45)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 9999,

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",

          pointerEvents: "none",

          animation:
            phase === "in"
              ? "gift-overlay-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards"
              : "gift-overlay-out 0.5s ease-in forwards",
        }}
      >

        {
          particles.map(p => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",

                width: p.size,
                height: p.size,

                borderRadius: "50%",
                background: p.bg,

                "--cx": p.cx,
                "--cy": p.cy,
                "--cr": p.cr,

                animation: "overlay-confetti 1s ease-out forwards",
              }}
            />
          ))
        }

        {
          gift.image
            ? (
              isVideo(gift.image)
                ? (
                  <video
                    src={gift.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: "75vw",
                      height: "75vw",
                      maxWidth: "340px",
                      maxHeight: "340px",
                      objectFit: "contain",
                      filter: `drop-shadow(0 0 40px ${gift.color})`
                    }}
                  />
                )
                : (
                  <img
                    src={gift.image}
                    alt={gift.name}
                    style={{
                      width: "75vw",
                      height: "75vw",
                      maxWidth: "340px",
                      maxHeight: "340px",
                      objectFit: "contain",
                      filter: `drop-shadow(0 0 40px ${gift.color})`
                    }}
                  />
                )
            )
            : (
              <span
                style={{
                  fontSize: "120px",
                  lineHeight: 1,
                  filter: `drop-shadow(0 0 40px ${gift.color})`
                }}
              >
                {gift.emoji}
              </span>
            )
        }

      </div>
    </>
  );
}

export default function ChatScreen({ girl, onBack }) {

  const { credits, user } = useAppStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [callToken, setCallToken] = useState(null);
  const [callRoom, setCallRoom] = useState(null);
  const [callLoading, setCallLoading] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [showGifts, setShowGifts] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);
  const [activeGift, setActiveGift] = useState(null);
  const [showStory, setShowStory] = useState(false);

  const bottomRef = useRef(null);

  const conversationId =
    [user?.id, girl?.id]
      .sort()
      .join('_');

  useEffect(() => {

    if (!user?.id || !girl?.id) return;

    supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${girl.id}),and(sender_id.eq.${girl.id},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
      .then(({ data }) => {

        if (!data) return;

        setMessages(
          data.map(m => ({
            id: m.id,
            who: m.sender_id === user.id ? 'me' : 'them',
            text: m.content,
            time: nowTime(),
          }))
        );
      });

  }, [user?.id, girl?.id]);

  useEffect(() => {

    if (!user?.id || !girl?.id) return;

    const channel = supabase
      .channel(`chat_${conversationId}`)

      .on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  },
  async (payload) => {
    const m = payload.new;
    if (m.sender_id !== girl.id || m.receiver_id !== user.id) return;

          let text = m.content;

          if (translateEnabled) {
            text = await fetchTranslation(m.content);
          }

          setMessages(prev => {

            if (prev.some(msg => msg.id === m.id)) {
              return prev;
            }

            return [
              ...prev,
              {
                id: m.id,
                who: 'them',
                text,
                time: nowTime(),
              }
            ];
          });
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [
    user?.id,
    girl?.id,
    conversationId,
    translateEnabled
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // =========================
  // MENSAJES SEGUROS VIA RPC
  // =========================

const startCall = async () => {
  if (credits < 150) {
    showToast("Necesitás al menos 150 créditos para llamar");
    return;
  }
  if (callLoading) return;
  setCallLoading(true);
  const roomName = `call_${[user.id, girl.id].sort().join('_')}`;
  try {
    const { error: reqError } = await supabase
      .from('call_requests')
      .insert({ caller_id: user.id, creator_id: girl.id, room_name: roomName, status: 'pending' });
    if (reqError) {
      showToast("Error al contactar a la creadora");
      setCallLoading(false);
      return;
    }
    setCallRoom(roomName);
    setCallStatus('waiting');
  } catch (err) {
    console.error(err);
    showToast("Error de conexión");
    setCallLoading(false);
  }
};

useEffect(() => {
  if (callStatus !== 'waiting' || !user?.id) return;
  const channel = supabase
    .channel(`call_response_${user.id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'call_requests',
      filter: `caller_id=eq.${user.id}`,
    }, async (payload) => {
      const req = payload.new;
      if (req.status === 'accepted') {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/livekit-token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({
              roomName: callRoom,
              participantName: user.display_name || 'Usuario',
              participantIdentity: user.id,
            }),
          }
        );
        const { token } = await res.json();
        setCallToken(token);
        setCallStatus('active');
        setCallLoading(false);
      } else if (req.status === 'rejected') {
        showToast("La creadora no está disponible");
        setCallStatus(null);
        setCallRoom(null);
        setCallLoading(false);
      }
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [callStatus, user?.id, callRoom]);// eslint-disable-line react-hooks/exhaustive-deps
// ========function send=================

  const send = async () => {

    if (!input.trim()) return;

    if (sendingGift) return;

    const text = input.trim();

    setInput('');

    const tempId = Date.now();

    // optimistic UI
    setMessages(m => [
      ...m,
      {
        id: tempId,
        who: 'me',
        text,
        time: nowTime(),
        pending: true,
      }
    ]);

    const { data, error } = await supabase.rpc(
      "send_message",
      {
        p_receiver_id: girl.id,
        p_content: text,
      }
    );

    // backend rechazó
    if (error || !data?.ok) {

      setMessages(m =>
        m.filter(msg => msg.id !== tempId)
      );

      if (data?.error === "insufficient_credits") {
        showToast("No tenés créditos");
      } else {
        showToast("Error enviando mensaje");
      }

      console.error(error || data);

      return;
    }

    // sincroniza créditos reales
    if (
      typeof data.credits_remaining === "number"
    ) {

      useAppStore.setState({
        credits: data.credits_remaining
      });
    }

    // actualiza optimistic
    setMessages(m =>
      m.map(msg =>

        msg.id === tempId
          ? {
              ...msg,
              id: data.message_id || tempId,
              pending: false,
            }
          : msg
      )
    );
  };

  // =========================
  // REGALOS SEGUROS VIA RPC
  // =========================

  const handleGiftSend = async (gift) => {

    // UX solamente
    if (credits < gift.cost) {
      showToast("Excuse me, you have no credits");
      return;
    }

    if (sendingGift) return;

    setSendingGift(true);

    setShowGifts(false);

    // overlay instantáneo
    setActiveGift(gift);

    const tempId = Date.now();

    // optimistic UI
    setMessages(m => [
      ...m,
      {
        id: tempId,
        who: 'me',
        text: `${gift.emoji} ${gift.name}`,
        time: nowTime(),
        pending: true,
      }
    ]);

    const { data, error } = await supabase.rpc(
      "send_gift",
      {
        p_creator_id: girl.id,
        p_gift_name: gift.name,
      }
    );
console.log("RPC send_gift →", { data, error }); // 👈
    setSendingGift(false);

    // backend rechazó
    if (error || !data?.ok) {

      setMessages(m =>
        m.filter(msg => msg.id !== tempId)
      );

      if (data?.error === "insufficient_credits") {
        showToast("Excuse me, you have no credits");
      } else {
        showToast("Error al procesar el regalo");
      }

      console.error(error || data);

      return;
    }

    // créditos reales backend
    if (
      typeof data.credits_remaining === "number"
    ) {

      useAppStore.setState({
        credits: data.credits_remaining
      });
    }

    playGiftSound(gift.soundKey);

    // backend ya insertó mensaje real
    setMessages(m =>
      m.map(msg =>

        msg.id === tempId
          ? {
              ...msg,
              id: data.message_id || tempId,
              pending: false,
            }
          : msg
      )
    );
    
  };

  if (callStatus === 'waiting') {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#09080f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{ fontSize: 60 }}>📞</div>
      <p style={{ color: '#fff', marginTop: 16, fontSize: 18 }}>
        Llamando a {girl?.display_name || girl?.name}...
      </p>
      <button onClick={async () => {
        await supabase.from('call_requests')
          .update({ status: 'cancelled' })
          .eq('caller_id', user.id)
          .eq('status', 'pending');
        setCallStatus(null);
        setCallRoom(null);
        setCallLoading(false);
      }} style={{
        marginTop: 24, padding: '10px 24px', borderRadius: 20,
        background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16,
      }}>
        Cancelar
      </button>
    </div>
  );
}

if (callStatus === 'active' && callToken) {
  return (
    <Suspense fallback={<div>Cargando videollamada...</div>}>
      <VideoCall
        creator={{ id: girl.id, name: girl.name, avatar: girl.img }}
        user={{ id: user.id, name: user.display_name || 'Vos', credits }}
        onEnd={() => {
          setCallStatus(null);
          setCallToken(null);
          setCallRoom(null);
        }}
        theme="dark"
        token={callToken}
        roomName={callRoom}
      />
    </Suspense>
  );
}

  return (
    <div
      className="flex flex-col h-screen bg-[#09080f]"
      style={{ position: 'relative' }}
    >

      {
        activeGift && (
          <GiftOverlay
            gift={activeGift}
            onDone={() => {
              setActiveGift(null);
            }}
          />
        )
      }



      {/* HEADER */}


<div className="flex items-center gap-3 py-3.5 px-4 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">

  <button onClick={onBack} className="text-[#ede8ff] text-2xl">←</button>

  <StoryRing hasVideo={!!girl?.video_url} size={44} onClick={() => girl?.video_url && setShowStory(true)}>
    <div className="w-full h-full rounded-full overflow-hidden" style={{ border: '2px solid #c9a84c' }}>
      <img src={girl.img} alt={girl.name} className="w-full h-full object-cover" />
    </div>
  </StoryRing>

  <div className="flex-1">
    <div className="font-semibold text-base text-[#ede8ff]">{girl.name}</div>
    <button
      onClick={() => setTranslateEnabled(v => !v)}
      className={`text-[10px] px-2 py-0.5 rounded-full border ${
        translateEnabled ? 'bg-[#c9a84c] text-black border-[#c9a84c]' : 'text-[#7a748f] border-[#7a748f]'
      }`}
    >
      {translateEnabled ? 'Traducción ON' : 'Traducción OFF'}
    </button>
  </div>

  <button
    onClick={startCall}
    disabled={callLoading}
    className="bg-gradient-to-br from-[#c9a84c] to-[#f0d882] rounded-full py-2 px-4 text-[#09080f] text-sm font-semibold"
  >
    📹
  </button>

</div>

<StoryModal videoUrl={girl?.video_url} isOpen={showStory} onClose={() => setShowStory(false)} />

      {/* MENSAJES */}

      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">

        {
          messages.map((m, i) => (

            <div
              key={m.id || i}
              className={`max-w-[76%] ${
                m.who === 'me'
                  ? 'self-end'
                  : 'self-start'
              }`}
            >

              <div
                className={`py-3 px-4 rounded-[20px] text-sm ${
                  m.who === 'me'
                    ? 'bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f]'
                    : 'bg-[#1a1826] text-[#ede8ff]'
                }`}
              >
                {m.text}
              </div>

              <div className="text-[11px] text-[#7a748f] mt-1 px-1">
                {m.time}
              </div>

            </div>
          ))
        }

        <div ref={bottomRef} />

      </div>

      {/* CREDITOS */}

      <div className="text-center p-1.5 text-xs text-[#7a748f] bg-[#111018] border-t border-[rgba(201,168,76,.14)]">
        💎 {credits} créditos
      </div>

      {/* REGALOS */}

      {
        showGifts && (
          <GiftPanel
            context="chat"
            onSend={handleGiftSend}
            onClose={() => {
              setShowGifts(false);
            }}
          />
        )
      }

      {/* INPUT */}

      <div className="py-2.5 px-3.5 pb-5 bg-[#111018] border-t border-[rgba(201,168,76,.14)] flex gap-2.5 items-center">

        <button
          onClick={() => {
            setShowGifts(g => !g);
          }}

          disabled={sendingGift}

          className="w-10 h-10 rounded-full text-lg"
        >
          {
            sendingGift
              ? '⏳'
              : '🎁'
          }
        </button>

        <input
          value={input}

          onChange={e => {
            setInput(e.target.value);
          }}

          onKeyDown={e => {
            if (e.key === 'Enter') {
              send();
            }
          }}

          placeholder="Escribí algo..."

          className="flex-1 bg-[#1a1826] border border-[rgba(201,168,76,.14)] rounded-full py-3 px-4 text-[#ede8ff] text-sm outline-none"
        />

        <button
          onClick={send}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f]"
        >
          ➤
        </button>

      </div>

    </div>
  );
}