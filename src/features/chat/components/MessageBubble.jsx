// 📁 src/features/chat/components/MessageBubble.jsx
//
// Representa una sola burbuja de mensaje dentro del chat.
// Soporta dos tipos de contenido: texto normal y regalos.
//
// ── BACKEND ──────────────────────────────────────────────────────────────────
// Este componente no cambia cuando llegue el backend.
// Los mensajes van a llegar del servidor con la misma estructura:
//   { id, who: 'me'|'them', text, time, gift: null | { id, name, emoji, cost, level } }
// El componente los renderiza igual sin importar de dónde vengan.
//
// Uso:
//   <MessageBubble who="me"   text="Hola!" time="10:23" theme="dark" />
//   <MessageBubble who="them" text="Hola 😊" time="10:24" theme="dark" />
//   <MessageBubble who="me"   gift={giftObject} time="10:25" theme="dark" />
//
// Props:
//   who   → 'me' (propio, derecha) | 'them' (ajeno, izquierda)
//   text  → string con el contenido del mensaje
//   time  → string con la hora formateada (ej: "10:23")
//   gift  → objeto del regalo si es un mensaje de regalo, null si es texto
//   theme → 'dark' | 'light'


// --- UNIFICADO Y FINAL ---
export default function MessageBubble({ message, text, who, sender, time, theme = 'dark' }) {
  // Soporte para ambos formatos de props (objeto message o props sueltas)
  const finalWho = who || sender || message?.who || message?.sender;
  const finalText = text || message?.text;
  const finalTime = time || message?.time;
  const finalGift = message?.gift || (message?.type === 'gift' ? message : null);

  const isMine = finalWho === 'me';

  // Colores de la burbuja del otro
  const theirBubble = {
    dark: 'bg-[#1a1826] text-[#ede8ff]',
    light: 'bg-[#f5ece6] text-[#2a1a20]',
  };

  // Gradiente del mensaje propio
  const myGradient = {
    dark: 'linear-gradient(135deg, #c9a84c, #f0d882)',
    light: 'linear-gradient(135deg, #c4607a, #e8a0b0)',
  };

  return (
    <div className={`flex flex-col mb-3 ${isMine ? 'items-end' : 'items-start'} w-full`}>
      {finalGift ? (
        <GiftBubble gift={finalGift} isMine={isMine} />
      ) : (
        <div
          className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm
            ${isMine 
              ? `text-[#09080f] rounded-br-sm font-medium` 
              : `${theirBubble[theme]} rounded-bl-sm`
            }
          `}
          style={isMine ? { background: myGradient[theme] } : {}}
        >
          {finalText}
        </div>
      )}

      {finalTime && (
        <div className="text-[10px] text-[#7a748f] mt-1 px-1 opacity-70">
          {finalTime}
        </div>
      )}
    </div>
  );
}

// ── BURBUJA DE REGALO (Lógica Pro de niveles) ──
function GiftBubble({ gift, isMine }) {
  const styles = {
    1: { wrapper: 'bg-[#181622] border border-[rgba(201,168,76,.2)]', label: 'text-[#7a748f] text-[10px]', size: 32 },
    2: { wrapper: 'bg-[#181622] border border-[rgba(201,168,76,.5)] shadow-[0_0_15px_rgba(201,168,76,.2)]', label: 'text-[#c9a84c] text-[10px] font-semibold', size: 40 },
    3: { wrapper: 'bg-[#181622] border-2 border-[#c9a84c] shadow-[0_0_30px_rgba(201,168,76,.4)]', label: 'text-[#c9a84c] text-xs font-bold uppercase', size: 50 },
  };

  const s = styles[gift.level] || styles[1];
  const label = isMine ? `Enviaste ${gift.name || ''}` : `Te enviaron ${gift.name || ''}`;
  // Si el texto viene como "🎁 Regalo", sacamos solo el emoji
  const emoji = gift.emoji || (gift.text ? gift.text.split(" ")[0] : "🎁");

  return (
    <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl ${s.wrapper}`}>
      <span style={{ fontSize: s.size }}>{emoji}</span>
      <span className={s.label}>{label}</span>
      {gift.cost && <span className="text-[9px] text-[#7a748f]">💎 {gift.cost}</span>}
    </div>
  );
}