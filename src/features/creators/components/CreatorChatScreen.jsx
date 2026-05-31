import { useState, useRef, useEffect } from 'react';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';
import ReportModal from '../../moderation/components/ReportModal';

const sonidoBasico = new URL("../../../assets/sounds/sonidobasico.mp3", import.meta.url).href;
const sonidoRosa   = new URL("../../../assets/sounds/rosa.mp3",         import.meta.url).href;
const sonidoCopa   = new URL("../../../assets/sounds/copadevino.mp3",   import.meta.url).href;
const diamante     = new URL("../../../assets/sounds/diamante2.mp3",    import.meta.url).href;
const sonidoAnillo = new URL("../../../assets/sounds/anillo.mp3",       import.meta.url).href;
const sonidoOro    = new URL("../../../assets/sounds/bolsadeoro.mp3",   import.meta.url).href;

const GIFTS = [
  { name: "Beso",     emoji: "💋", color: "#ff6b8a", sound: sonidoBasico },
  { name: "Fuego",    emoji: "🔥", color: "#ff4500", sound: sonidoBasico },
  { name: "Corazón",  emoji: "❤️", color: "#ff0000", sound: sonidoBasico },
  { name: "Rosa",     emoji: "🌹", color: "#ff007f", sound: sonidoRosa   },
  { name: "Copa",     emoji: "🍷", color: "#9b2335", sound: sonidoCopa   },
  { name: "Diamante", emoji: "💎", color: "#7c3aed", sound: diamante     },
  { name: "Anillo",   emoji: "💍", color: "#c9a84c", sound: sonidoAnillo },
  { name: "ORO",      emoji: "💰", color: "#c9a84c", sound: sonidoOro    },
];

const GIFT_MAP = Object.fromEntries(GIFTS.map(g => [g.name, g]));

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fetchTranslation = async (text) => {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|es`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
};

const parseGift = (content) => {
  if (!content?.startsWith('🎁 Envió un regalo:')) return null;
  const name = content.replace('🎁 Envió un regalo:', '').trim();
  return GIFT_MAP[name] || null;
};

export default function CreatorChatScreen({ user, onBack }) {
  const { user: creator } = useAppStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [storyUrl, setStoryUrl] = useState(null);
  const bottomRef = useRef(null);
  const audioRef = useRef(null);

  const conversationId = [creator?.id, user?.id].sort().join('_');

  const userAvatar = user?.avatar_url || user?.avatar || null;
  const userName = user?.display_name || user?.name || 'Usuario';

  const isExpired =
    user?.video_created_at &&
    Date.now() - new Date(user.video_created_at).getTime() > 24 * 60 * 60 * 1000;

  const hasStory = !!user?.video_url && !isExpired;

  const playGiftSound = (gift) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(gift.sound);
      audio.volume = 0.8;
      audioRef.current = audio;
      audio.play().catch(e => console.warn('Audio bloqueado:', e));
    } catch (err) {
      console.warn('Error reproduciendo sonido:', err);
    }
  };

  useEffect(() => {
    if (!creator?.id || !user?.id) return;

    supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${creator.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${creator.id})`)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data.map(m => ({
          id: m.id,
          who: m.sender_id === creator.id ? 'me' : 'them',
          text: m.content,
          time: nowTime(),
          gift: parseGift(m.content),
        })));
      });

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${creator.id}`
      }, async (payload) => {
        const m = payload.new;

        let text = m.content;
        if (translateEnabled) text = await fetchTranslation(m.content);

        const gift = parseGift(m.content);
        if (gift) playGiftSound(gift);

        setMessages(prev => {
          if (prev.some(msg => msg.id === m.id)) return prev;
          return [...prev, { id: m.id, who: 'them', text, time: nowTime(), gift }];
        });

        setEarnings(e => e + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [creator?.id, user?.id, conversationId, translateEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');

    const tempId = Date.now();
    setMessages(m => [...m, { id: tempId, who: 'me', text, time: nowTime(), gift: null }]);

    await supabase.from('messages').insert({
      sender_id: creator.id,
      receiver_id: user.id,
      content: text,
      is_read: false,
    });
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#fdf8fb', position: 'relative' }}>

      {/* STORY MODAL */}
      {storyUrl && (
        <div
          onClick={() => setStoryUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            src={storyUrl}
            autoPlay
            playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 16 }}
            onEnded={() => setStoryUrl(null)}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setStoryUrl(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 18,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER */}
      <div
        className="flex items-center gap-3 py-3.5 px-4 shrink-0"
        style={{ background: '#fff', borderBottom: '1px solid rgba(244,114,182,.15)' }}
      >
        <button
          onClick={onBack}
          className="bg-transparent border-none text-2xl cursor-pointer leading-none"
          style={{ color: '#2d1f2e' }}
        >
          ←
        </button>

        {/* Avatar con anillo de story */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            padding: hasStory ? 2 : 0,
            background: hasStory
              ? 'linear-gradient(135deg, #c4607a, #833AB4, #FCAF45)'
              : 'linear-gradient(135deg, #f9a8d4, #e879f9)',
            animation: hasStory ? 'storyRingSpin 3s linear infinite' : 'none',
            backgroundSize: '200% 200%',
            cursor: hasStory ? 'pointer' : 'default',
          }}
          onClick={() => hasStory && setStoryUrl(user.video_url)}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-xl"
            style={{
              border: hasStory ? '2px solid #fdf8fb' : '2px solid #f472b6',
              background: 'linear-gradient(135deg, #f9a8d4, #e879f9)'
            }}
          >
            {userAvatar
              ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              : <span>👤</span>
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate" style={{ color: '#2d1f2e' }}>
            {userName}
          </div>
          <button
            onClick={() => setTranslateEnabled(!translateEnabled)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              translateEnabled ? 'bg-[#f472b6] text-white border-[#f472b6]' : 'text-[#a78b9a] border-[#a78b9a]'
            }`}
          >
            {translateEnabled ? 'Traducción ON' : 'Traducción OFF'}
          </button>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)' }}
        >
          <span className="text-sm">💜</span>
          <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>${earnings}</span>
        </div>

        {/* Botón reportar */}
        <button
          onClick={() => setShowReport(true)}
          title="Reportar usuario"
          className="bg-transparent border-none cursor-pointer text-lg shrink-0"
          style={{ color: '#a78b9a' }}
        >
          🚩
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
            {m.gift ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 16px',
                borderRadius: '16px',
                background: `${m.gift.color}22`,
                border: `1px solid ${m.gift.color}66`,
                minWidth: '80px'
              }}>
                <span style={{ fontSize: '32px', lineHeight: 1 }}>{m.gift.emoji}</span>
                <span style={{ fontSize: '11px', color: m.gift.color, fontWeight: 600, marginTop: '4px' }}>
                  {m.gift.name}
                </span>
              </div>
            ) : (
              <div
                className="py-3 px-4 rounded-[20px] text-sm leading-relaxed"
                style={
                  m.who === 'me'
                    ? { background: 'linear-gradient(135deg, #f472b6, #7c3aed)', color: '#fff', borderBottomRightRadius: 4 }
                    : { background: '#fff', color: '#2d1f2e', borderBottomLeftRadius: 4, border: '1px solid rgba(244,114,182,.2)' }
                }
              >
                {m.text}
              </div>
            )}
            <div
              className="text-[11px] mt-1 px-1"
              style={{ color: '#a78b9a', textAlign: m.who === 'me' ? 'right' : 'left' }}
            >
              {m.time}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* BARRA GANANCIAS */}
      <div
        className="text-center p-1.5 text-xs"
        style={{ background: '#fff', borderTop: '1px solid rgba(244,114,182,.14)', color: '#a78b9a' }}
      >
        💜 Ganaste <span style={{ color: '#7c3aed', fontWeight: 600 }}>${earnings}</span> en este chat
      </div>

      {/* INPUT */}
      <div
        className="py-2.5 px-3.5 pb-5 flex gap-2.5 items-center shrink-0"
        style={{ background: '#fff', borderTop: '1px solid rgba(244,114,182,.14)' }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Respondé..."
          className="flex-1 rounded-full py-3 px-4 text-sm outline-none"
          style={{ background: '#fdf0f5', border: '1px solid rgba(244,114,182,.2)', color: '#2d1f2e' }}
        />
        <button
          onClick={send}
          className="w-11 h-11 rounded-full border-none text-lg cursor-pointer flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f472b6, #7c3aed)', color: '#fff' }}
        >
          ➤
        </button>
      </div>

      {/* REPORT MODAL */}
      {showReport && (
        <ReportModal
          theme="light"
          reportedId={user?.id}
          onClose={() => setShowReport(false)}
        />
      )}

      <style>{`
        @keyframes storyRingSpin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}