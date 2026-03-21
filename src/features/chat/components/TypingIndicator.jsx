// 📁 src/features/chat/components/TypingIndicator.jsx
//
// Muestra los tres puntitos animados cuando la otra persona está escribiendo.
// Es un componente puramente visual — no maneja ninguna lógica.
//
// Uso:
//   {isTyping && <TypingIndicator theme="dark" />}
//
// Props:
//   theme → 'dark' (masculino) | 'light' (femenino)

export default function TypingIndicator({ theme = 'dark' }) {

  // El fondo del indicador cambia según quién lo ve.
  // El hombre ve el fondo oscuro, la mujer ve el fondo crema.
  const bg = theme === 'dark' ? 'bg-[#1a1826]' : 'bg-[#f5ece6]';

  return (
    <div className={`self-start ${bg} rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center`}>
      {/* Tres puntos — cada uno tiene un delay distinto para crear
          el efecto de ola. El CSS animation está en styles/index.css */}
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#7a748f] inline-block"
          style={{ animation: `ty 1.2s infinite ${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}