// 📁 src/features/creators/components/CreatorChatScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const nowTime = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const USER_MESSAGES = [
  "Hola, ¿cómo estás? 😊",
  "Qué bien que estés acá 💫",
  "Me alegra hablar con vos ✨",
  "¿Qué estás haciendo hoy?",
  "Tengo ganas de conocerte más 🌸",
];

export default function CreatorChatScreen({ user, onBack }) {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { who: 'them', text: `Hola 😊 Soy ${user?.name ?? 'Usuario'}, ¿cómo estás?`, time: nowTime() }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [earnings, setEarnings] = useState(0); // BACKEND: ganancias reales del socket

  const aiRef     = useRef(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // BACKEND: reemplazar con socket.on('message', ...)
  const simulateIncoming = () => {
    setTyping(true);
    setTimeout(() => {
      const text = USER_MESSAGES[aiRef.current % USER_MESSAGES.length];
      setTyping(false);
      setMessages(m => [...m, { who: 'them', text, time: nowTime() }]);
      setEarnings(e => e + 1); // BACKEND: el backend calcula las ganancias reales
      aiRef.current++;
    }, 1800);
  };

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { who: 'me', text: input, time: nowTime() }]);
    setInput('');
    simulateIncoming();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#fdf8fb', position: 'relative' }}>

      {/* ── HEADER ── */}
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

        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: 'linear-gradient(135deg, #f9a8d4, #e879f9)', border: '2px solid #f472b6' }}
        >
          👤
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate" style={{ color: '#2d1f2e' }}>
            {user?.name ?? 'Usuario'}
          </div>
          <div className="text-xs" style={{ color: '#7c3aed' }}>● En línea</div>
        </div>

        {/* Badge ganancias */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)' }}
        >
          <span className="text-sm">💜</span>
          <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>${earnings}</span>
        </div>

        {/* Botón videollamada */}
        <button
          onClick={() => navigate(ROUTES.CREATOR_CALL?.replace(':id', user?.id ?? 'mock') ?? '/creator/call/mock')}
          className="border-none rounded-full py-2 px-4 text-sm font-semibold cursor-pointer flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #f472b6, #7c3aed)', color: '#fff' }}
        >
          📹
        </button>
      </div>

      {/* ── MENSAJES ── */}
      <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[76%] ${m.who === 'me' ? 'self-end' : 'self-start'}`}>
            <div
              className="py-3 px-4 rounded-[20px] text-sm leading-relaxed"
              style={m.who === 'me'
                ? {
                    background: 'linear-gradient(135deg, #f472b6, #7c3aed)',
                    color: '#fff',
                    borderBottomRightRadius: 4,
                  }
                : {
                    background: '#fff',
                    color: '#2d1f2e',
                    borderBottomLeftRadius: 4,
                    border: '1px solid rgba(244,114,182,.2)',
                    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                  }
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

        {typing && (
          <div
            className="self-start rounded-[20px] py-3.5 px-4 flex gap-1 items-center"
            style={{
              background: '#fff',
              border: '1px solid rgba(244,114,182,.2)',
              borderBottomLeftRadius: 4,
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  background: '#f472b6',
                  animation: 'ty 1.2s infinite',
                  animationDelay: `${i * .2}s`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── FOOTER GANANCIAS ── */}
      <div
        className="text-center p-1.5 text-xs"
        style={{ background: '#fff', borderTop: '1px solid rgba(244,114,182,.14)', color: '#a78b9a' }}
      >
        💜 Ganaste <span style={{ color: '#7c3aed', fontWeight: 600 }}>${earnings}</span> en este chat
      </div>

      {/* ── INPUT ── */}
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
          style={{
            background: '#fdf0f5',
            border: '1px solid rgba(244,114,182,.2)',
            color: '#2d1f2e',
          }}
        />
        <button
          onClick={send}
          className="w-11 h-11 rounded-full border-none text-lg cursor-pointer flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f472b6, #7c3aed)', color: '#fff' }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes ty {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}