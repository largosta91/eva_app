import { useState, useRef, useEffect } from 'react';
import useAppStore from '../../../app/store/useAppStore';
import VideoCall from '../../calls/components/VideoCall';
import GiftPanel from './GiftPanel';
import { supabase } from '../../../services/api/supabase';

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

  // 1. CARGA INICIAL DE MENSAJES
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

  // 2. REALTIME
  useEffect(() => {
    if (!user?.id || !girl?.id) return;

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
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
      sender_id: user.id,
      receiver_id: girl.id,
      content: text,
      is_read: false,
    });

    if (error) console.error('Error al enviar:', error);
  };

  const handleGiftSend = async (gift) => {
    // Verificar créditos suficientes antes de hacer nada
    if (credits < gift.cost) {
      alert('No tenés suficientes créditos para este regalo.');
      return;
    }

    setSendingGift(true);
    setShowGifts(false);

    // 1. Descontar en Supabase PRIMERO — fuente de verdad
    const newCredits = credits - gift.cost;
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (creditError) {
      console.error('Error descontando créditos:', creditError);
      setSendingGift(false);
      alert('Error al procesar el regalo. Intentá de nuevo.');
      return; // Cortar todo si Supabase falló — no se gasta nada
    }

    // 2. Supabase confirmó → actualizar Zustand
    spendCredits(gift.cost);

    // 3. Mostrar regalo en el chat (optimistic tras confirmación)
    setMessages(m => [...m, {
      who: 'me',
      text: `${gift.emoji} ${gift.name}`,
      time: nowTime(),
      isGift: true,
      giftColor: gift.color
    }]);

    // 4. Registrar transacción
    await supabase.from('transactions').insert({
      user_id: user.id,
      creator_id: girl.id,
      type: 'gift',
      amount: gift.cost,
      gift_name: gift.name,
      gift_emoji: gift.emoji,
      gift_cost: gift.cost,
      status: 'completed',
    });

    // 5. Mensaje en historial de chat
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: girl.id,
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
        <button onClick={onBack} className="bg-transparent border-none text-[#ede8ff] text-2xl cursor-pointer leading-none">←</button>
        <img src={girl.img} alt={girl.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#c9a84c]" />
        <div className="flex-1">
          <div className="font-semibold text-base text-[#ede8ff]">{girl.name}</div>
          <button
            onClick={() => setTranslateEnabled(!translateEnabled)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${translateEnabled ? 'bg-[#c9a84c] text-black border-[#c9a84c]' : 'text-[#7a748f] border-[#7a748f]'}`}>
            {translateEnabled ? 'Traducción ON' : 'Traducción OFF'}
          </button>
        </div>
        <button
          onClick={() => setShowVC(true)}
          className="bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none rounded-full py-2 px-4 text-[#09080f] text-sm font-semibold cursor-pointer">
          📹
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
            {m.isGift ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 16px', borderRadius: '16px',
                background: `${m.giftColor}22`, border: `1px solid ${m.giftColor}66`, minWidth: '80px'
              }}>
                <span style={{ fontSize: '32px', lineHeight: 1 }}>{m.text.split(' ')[0]}</span>
                <span style={{ fontSize: '11px', color: m.giftColor, fontWeight: 600, marginTop: '4px' }}>
                  {m.text.split(' ').slice(1).join(' ')}
                </span>
              </div>
            ) : (
              <div className={`py-3 px-4 rounded-[20px] text-sm leading-relaxed ${m.who === 'me'
                ? 'bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f] rounded-br-[4px]'
                : 'bg-[#1a1826] text-[#ede8ff] rounded-bl-[4px]'}`}>
                {m.text}
              </div>
            )}
            <div className={`text-[11px] text-[#7a748f] mt-1 px-1 ${m.who === 'me' ? 'text-right' : 'text-left'}`}>
              {m.time}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* CRÉDITOS */}
      <div className="text-center p-1.5 text-xs text-[#7a748f] bg-[#111018] border-t border-[rgba(201,168,76,.14)]">
        💎 {credits} créditos
      </div>

      {/* GIFT PANEL */}
      {showGifts && (
        <GiftPanel
          context="chat"
          onSend={handleGiftSend}
          onClose={() => setShowGifts(false)}
        />
      )}

      {/* INPUT */}
      <div className="py-2.5 px-3.5 pb-5 bg-[#111018] border-t border-[rgba(201,168,76,.14)] flex gap-2.5 items-center shrink-0">
        <button
          onClick={() => setShowGifts(g => !g)}
          disabled={sendingGift}
          style={{
            background: showGifts ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.08)',
            border: showGifts ? '1px solid rgba(201,168,76,.6)' : '1px solid rgba(255,255,255,.1)',
            borderRadius: '50%', width: '40px', height: '40px',
            fontSize: '18px', cursor: sendingGift ? 'not-allowed' : 'pointer',
            flexShrink: 0, opacity: sendingGift ? 0.5 : 1
          }}>
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
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none text-[#09080f] text-lg cursor-pointer flex items-center justify-center">
          ➤
        </button>
      </div>
    </div>
  );
}