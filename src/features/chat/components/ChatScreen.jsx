import { useState, useRef, useEffect } from 'react';
import useAppStore from '../../../app/store/useAppStore';
import VideoCall from '../../calls/components/VideoCall';
import GiftPanel from './GiftPanel';
import { supabase } from '../../../services/api/supabase';

const SOUNDS = {
  basico:      new URL("../../../assets/sounds/sonidobasico2.mp3", import.meta.url).href,
  rosa:        new URL("../../../assets/sounds/rosa.mp3",         import.meta.url).href,
  copa:        new URL("../../../assets/sounds/dandy.mp3",        import.meta.url).href,
  diamante:    new URL("../../../assets/sounds/diamante.mp3",     import.meta.url).href,
  anillo:      new URL("../../../assets/sounds/anillo.mp3",       import.meta.url).href,
  asombro:     new URL("../../../assets/sounds/asombro.mp3",      import.meta.url).href,
  unicornio:   new URL("../../../assets/sounds/unicornio.mp3",    import.meta.url).href,
  sonidoFenix: new URL("../../../assets/sounds/sonidoFenix.mp3",  import.meta.url).href,
  japonTokio:  new URL("../../../assets/sounds/japonTokio.mp3",   import.meta.url).href,
  helicopter:  new URL("../../../assets/sounds/helicopter.mp3",   import.meta.url).href,
  avion:       new URL("../../../assets/sounds/avion.mp3",        import.meta.url).href,
  tragamoneda: new URL("../../../assets/sounds/tragamoneda.mp3",  import.meta.url).href,
  copaDeOro:   new URL("../../../assets/sounds/copaDeOro.mp3",    import.meta.url).href,
  pirotecnia:   new URL("../../../assets/sounds/pirotecnia.mp3",  import.meta.url).href,
};

const playGiftSound = (soundKey) => {
  try {
    const src = SOUNDS[soundKey];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.8;
    audio.play().catch(e => console.warn("Audio bloqueado:", e));
  } catch (err) {
    console.warn("Error reproduciendo sonido:", err);
  }
};

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const fetchTranslation = async (text) => {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|es`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch { return text; }
};

// --- Toast helper ---
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
    setTimeout(() => toast.remove(), 500);
  }, 2500);
};
// ---------------------

export default function ChatScreen({ girl, onBack }) {
  const { credits, spendCredits, user } = useAppStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showVC, setShowVC] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);
  const bottomRef = useRef(null);

  const conversationId = [user?.id, girl?.id].sort().join('_');

  useEffect(() => {
    if (!user?.id || !girl?.id) return;
    supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${girl.id}),and(sender_id.eq.${girl.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            who: m.sender_id === user.id ? 'me' : 'them',
            text: m.content,
            time: nowTime(),
          })));
        }
      });
  }, [user?.id, girl?.id]);

  useEffect(() => {
    if (!user?.id || !girl?.id) return;
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          const m = payload.new;
          if (m.sender_id === girl.id) {
            let text = m.content;
            if (translateEnabled) text = await fetchTranslation(m.content);
            setMessages(prev => {
              if (prev.some(msg => msg.id === m.id)) return prev;
              return [...prev, { id: m.id, who: 'them', text, time: nowTime() }];
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, girl?.id, conversationId, translateEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    const tempId = Date.now();
    setMessages(m => [...m, { id: tempId, who: 'me', text, time: nowTime() }]);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: girl.id, content: text, is_read: false,
    });
    if (error) console.error('Error al enviar:', error);
  };

  const handleGiftSend = async (gift) => {
    if (credits < gift.cost) {
      showToast("Excuse me, you have no credits");
      return;
    }

    setSendingGift(true);
    setShowGifts(false);

    const newCredits = credits - gift.cost;
    const { error: creditError } = await supabase
      .from('users').update({ credits: newCredits }).eq('id', user.id);

    if (creditError) {
      console.error('Error descontando créditos:', creditError);
      setSendingGift(false);
      alert('Error al procesar el regalo. Intentá de nuevo.');
      return;
    }

    // Supabase confirmó → actualizar Zustand y reproducir sonido
    spendCredits(gift.cost);
    playGiftSound(gift.soundKey);

    setMessages(m => [...m, {
      who: 'me', text: `${gift.emoji} ${gift.name}`,
      time: nowTime(), isGift: true, giftColor: gift.color
    }]);

    await supabase.from('transactions').insert({
      user_id: user.id, creator_id: girl.id, type: 'gift',
      amount: gift.cost, gift_name: gift.name, gift_emoji: gift.emoji,
      gift_cost: gift.cost, status: 'completed',
    });

    await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: girl.id,
      content: `🎁 Envió un regalo: ${gift.name}`,
    });

    setSendingGift(false);
  };

  if (showVC) return (
    <VideoCall
      creator={{ id: girl.id, name: girl.name, avatar: girl.img }}
      user={{ id: user.id, name: user.display_name || 'Vos', credits }}
      onEnd={() => setShowVC(false)}
      theme="dark"
    />
  );

  return (
  <div className="flex flex-col h-screen bg-[#09080f]" style={{ position: 'relative' }}>
    
    {/* HEADER */}
    <div className="flex items-center gap-3 py-3.5 px-4 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
      
      <button onClick={onBack} className="text-[#ede8ff] text-2xl">←</button>

      <img
        src={girl.img}
        alt={girl.name}
        className="w-11 h-11 rounded-full object-cover border-2 border-[#c9a84c]"
      />

      <div className="flex-1">
        <div className="font-semibold text-base text-[#ede8ff]">
          {girl.name}
        </div>

        <button
          onClick={() => setTranslateEnabled(v => !v)}
          className={`text-[10px] px-2 py-0.5 rounded-full border ${
            translateEnabled
              ? 'bg-[#c9a84c] text-black border-[#c9a84c]'
              : 'text-[#7a748f] border-[#7a748f]'
          }`}
        >
          {translateEnabled ? 'Traducción ON' : 'Traducción OFF'}
        </button>
      </div>

      <button
        onClick={() => setShowVC(true)}
        className="bg-gradient-to-br from-[#c9a84c] to-[#f0d882] rounded-full py-2 px-4 text-[#09080f] text-sm font-semibold"
      >
        📹
      </button>
    </div>

    {/* MENSAJES */}
    <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
      {messages.map((m, i) => (
        <div
          key={m.id || i}
          className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}
        >
        <div
  className={`py-3 px-4 rounded-[20px] text-sm ${
    m.who === 'me'
      ? 'bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f]'
      : 'bg-[#1a1826] text-[#ede8ff]'
  }`}
>
  {m.isGift ? (
    <img
      src={m.text.split(' ')[0]}
      alt="gift"
      className="w-16 h-16 object-contain"
    />
  ) : (
    m.text
  )}
</div>

          <div className="text-[11px] text-[#7a748f] mt-1 px-1">
            {m.time}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>

    {/* CREDITOS */}
    <div className="text-center p-1.5 text-xs text-[#7a748f] bg-[#111018] border-t border-[rgba(201,168,76,.14)]">
      💎 {credits} créditos
    </div>

    {/* PANEL REGALOS */}
    {showGifts && (
      <GiftPanel
        onSend={handleGiftSend}
        onClose={() => setShowGifts(false)}
      />
    )}

    {/* INPUT */}
    <div className="py-2.5 px-3.5 pb-5 bg-[#111018] border-t border-[rgba(201,168,76,.14)] flex gap-2.5 items-center">
      
      <button
        onClick={() => setShowGifts(g => !g)}
        disabled={sendingGift}
        className="w-10 h-10 rounded-full text-lg"
      >
        {sendingGift ? '⏳' : '🎁'}
      </button>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
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