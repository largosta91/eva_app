import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import VideoCall from '../../calls/components/VideoCall';
import GiftPanel from './GiftPanel';

const AI_REPLIES = [
  "Qué lindo que me escribas 💜 ¿cómo fue tu día?",
  "Te escucho, contame más 🌸",
  "Eso suena difícil... estoy acá 💫",
  "Me alegra que hablemos ✨",
  "¿Y vos qué necesitás ahora mismo?",
  "Tengo todo el tiempo para vos 🌺",
];

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
};

export default function ChatScreen({ girl, onBack }) {
  const navigate = useNavigate();
  const { credits, spendCredits } = useAppStore();
  const [messages, setMessages] = useState([
    { who:'them', text:`Hola 😊 Soy ${girl.name}, ¿cómo estás hoy?`, time:nowTime() }
  ]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [showVC, setShowVC]       = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const aiRef     = useRef(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const t = nowTime();
    setMessages(m => [...m, { who:'me', text:input, time:t }]);
    setInput('');
    spendCredits(2);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { who:'them', text:AI_REPLIES[aiRef.current % AI_REPLIES.length], time:t }]);
      aiRef.current++;
    }, 1800);
  };

  const handleGiftSend = (gift) => {
    const t = nowTime();
    setMessages(m => [...m, {
      who: 'me',
      text: `${gift.emoji} ${gift.name}`,
      time: t,
      isGift: true,
      giftColor: gift.color,
    }]);
    spendCredits(gift.cost);
    setShowGifts(false);
  };

  // ── Upsell en el momento de valor ──
  if (showVC) return (
    <VideoCall
      creator={{ id: girl.name, name: girl.name, avatar: girl.img }}
      user={{ id: 'user', name: 'Vos', credits }}
      onEnd={() => navigate(ROUTES.PAYWALL)}
      theme="dark"
    />
  );

  return (
    <div className="flex flex-col h-screen bg-[#09080f]" style={{ position:"relative" }}>

      {/* Header */}
      <div className="flex items-center gap-3 py-3.5 px-4 bg-[#111018] border-b border-[rgba(201,168,76,.14)] shrink-0">
        <button onClick={onBack} className="bg-transparent border-none text-[#ede8ff] text-2xl cursor-pointer leading-none">←</button>
        <img src={girl.img} alt={girl.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#c9a84c]" />
        <div className="flex-1">
          <div className="font-semibold text-base text-[#ede8ff]">{girl.name}</div>
          <div className="text-xs text-green-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ animation:'blink 1.5s infinite' }} />
            En línea
          </div>
        </div>
        <button
          onClick={() => setShowVC(true)}
          className="bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none rounded-full py-2 px-4 text-[#09080f] text-sm font-semibold cursor-pointer flex items-center gap-1.5"
        >
          📹 Llamada
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
            {m.isGift ? (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"10px 16px", borderRadius:"16px",
                background:`${m.giftColor}22`, border:`1px solid ${m.giftColor}66`,
                minWidth:"80px",
              }}>
                <span style={{ fontSize:"32px", lineHeight:1 }}>{m.text.split(" ")[0]}</span>
                <span style={{ fontSize:"11px", color:m.giftColor, fontWeight:600, marginTop:"4px" }}>
                  {m.text.split(" ").slice(1).join(" ")}
                </span>
              </div>
            ) : (
              <div className={`py-3 px-4 rounded-[20px] text-sm leading-relaxed ${m.who === 'me' ? 'bg-gradient-to-br from-[#c9a84c] to-[#f0d882] text-[#09080f] rounded-br-[4px]' : 'bg-[#1a1826] text-[#ede8ff] rounded-bl-[4px]'}`}>
                {m.text}
              </div>
            )}
            <div className={`text-[11px] text-[#7a748f] mt-1 px-1 ${m.who === 'me' ? 'text-right' : 'text-left'}`}>{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="self-start bg-[#1a1826] rounded-[20px] rounded-bl-[4px] py-3.5 px-4 flex gap-1 items-center">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#7a748f] inline-block" style={{ animation:'ty 1.2s infinite', animationDelay:`${i*.2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Créditos */}
      <div className="text-center p-1.5 text-xs text-[#7a748f] bg-[#111018] border-t border-[rgba(201,168,76,.14)]">
        💎 {credits} créditos · −2 por mensaje
      </div>

      {/* Gift Panel */}
      {showGifts && (
        <GiftPanel context="chat" onSend={handleGiftSend} onClose={() => setShowGifts(false)} />
      )}

      {/* Input */}
      <div className="py-2.5 px-3.5 pb-5 bg-[#111018] border-t border-[rgba(201,168,76,.14)] flex gap-2.5 items-center shrink-0">
        <button
          onClick={() => setShowGifts(g => !g)}
          style={{
            background: showGifts ? "rgba(201,168,76,.3)" : "rgba(255,255,255,.08)",
            border: showGifts ? "1px solid rgba(201,168,76,.6)" : "1px solid rgba(255,255,255,.1)",
            borderRadius:"50%", width:"40px", height:"40px",
            fontSize:"18px", cursor:"pointer", flexShrink:0,
          }}
        >
          🎁
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
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#f0d882] border-none text-[#09080f] text-lg cursor-pointer flex items-center justify-center"
        >
          ➤
        </button>
      </div>
    </div>
  );
}