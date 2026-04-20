import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';

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

export default function CreatorChatScreen({ user, onBack }) {
  const navigate = useNavigate();
  const { user: creator } = useAppStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const bottomRef = useRef(null);

  const conversationId = [creator?.id, user?.id].sort().join('_');

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

        setMessages(prev => {
          if (prev.some(msg => msg.id === m.id)) return prev;
          return [...prev, { id: m.id, who: 'them', text, time: nowTime() }];
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
    setMessages(m => [...m, { id: tempId, who: 'me', text, time: nowTime() }]);

    await supabase.from('messages').insert({
      sender_id: creator.id,
      receiver_id: user.id,
      content: text,
      is_read: false,
    });
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#fdf8fb', position: 'relative' }}>

      <div className="flex items-center gap-3 py-3.5 px-4 shrink-0"
        style={{ background: '#fff', borderBottom: '1px solid rgba(244,114,182,.15)' }}>

        <button onClick={onBack} className="bg-transparent border-none text-2xl cursor-pointer leading-none" style={{ color: '#2d1f2e' }}>←</button>

        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: 'linear-gradient(135deg, #f9a8d4, #e879f9)', border: '2px solid #f472b6' }}>
          👤
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate" style={{ color: '#2d1f2e' }}>
            {user?.name ?? 'Usuario'}
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

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)' }}>
          <span className="text-sm">💜</span>
          <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>
            ${earnings}
          </span>
        </div>

        <button
          onClick={() => navigate(ROUTES.CREATOR_CALL?.replace(':id', user?.id ?? 'mock') ?? '/creator/call/mock')}
          className="border-none rounded-full py-2 px-4 text-sm font-semibold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #f472b6, #7c3aed)', color: '#fff' }}>
          📹
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
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

      <div className="text-center p-1.5 text-xs"
        style={{ background: '#fff', borderTop: '1px solid rgba(244,114,182,.14)', color: '#a78b9a' }}>
        💜 Ganaste <span style={{ color: '#7c3aed', fontWeight: 600 }}>${earnings}</span> en este chat
      </div>

      <div className="py-2.5 px-3.5 pb-5 flex gap-2.5 items-center shrink-0"
        style={{ background: '#fff', borderTop: '1px solid rgba(244,114,182,.14)' }}>

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
    </div>
  );
}