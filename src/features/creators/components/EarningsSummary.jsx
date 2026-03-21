// 📁 src/features/creators/components/EarningsSummary.jsx
//
// Muestra el resumen de ganancias de la creadora.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora usa datos mockeados. Cuando tengas backend:
//   - Cargar ganancias reales desde API:
//     const [earnings, setEarnings] = useState(null)
//     useEffect(() => { api.get('/creators/earnings').then(res => setEarnings(res.data)) }, [])
//   - Actualizar en tiempo real cuando se completa un chat o videollamada:
//     socket.on('earning', (data) => setEarnings(prev => ({ ...prev, ...data })))
//   - El botón "Retirar" llama a:
//     api.post('/creators/withdraw', { amount: earnings.available })
//
// Props:
//   theme    → 'dark' | 'light'
//   earnings → objeto con los datos de ganancias — mock por defecto

export default function EarningsSummary({ theme = "dark", earnings = null }) {

  const styles = {
    dark: {
      bg:     "bg-[#1a1826]",
      border: "border border-[rgba(201,168,76,.14)]",
      text:   "text-[#ede8ff]",
      accent: "text-[#c9a84c]",
      muted:  "text-[#7a748f]",
      divider:"border-[rgba(201,168,76,.1)]",
      grad:   "linear-gradient(135deg, #c9a84c, #f0d882)",
    },
    light: {
      bg:     "bg-[#fff9f5]",
      border: "border border-[rgba(196,96,122,.15)]",
      text:   "text-[#2a1a20]",
      accent: "text-[#c4607a]",
      muted:  "text-[#9a7a84]",
      divider:"border-[rgba(196,96,122,.1)]",
      grad:   "linear-gradient(135deg, #c4607a, #e8a0b0)",
    },
  };

  const s = styles[theme];

  // ── MOCK DATA ─────────────────────────────────────────────────────────────
  // → Reemplazar con: api.get('/creators/earnings')
  const mock = {
    available:    "$218.50",   // saldo listo para retirar
    month:        "$487.20",   // total del mes en curso
    total:        "$8,500.00", // total histórico acumulado
    chats:        47,          // chats completados este mes
    callHours:    "12 hs",     // horas de videollamada este mes
    tips:         "$38.00",    // propinas recibidas este mes
    trend:        "+23%",      // comparado con el mes anterior
  };

  const data = earnings || mock;

  return (
    <div className="flex flex-col gap-4">

      {/* Tarjeta de saldo disponible para retirar */}
      <div className="rounded-3xl p-6 text-white text-center"
        style={{ background: s.grad }}>
        <div className="text-xs uppercase tracking-widest opacity-80 mb-2">
          Saldo disponible
        </div>
        <div className="text-5xl font-semibold leading-none mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {data.available}
        </div>
        <div className="text-sm opacity-75 mb-4">
          {data.trend} vs el mes pasado
        </div>
        <button
          className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-6 py-2 rounded-full border-none cursor-pointer transition-colors"
          onClick={() => {
            // TODO: conectar con backend
            // → Reemplazar con: api.post('/creators/withdraw', { amount: data.available })
            console.log("Retiro simulado:", data.available);
          }}
        >
          Retirar fondos
        </button>
      </div>

      {/* Desglose detallado del mes */}
      <div className={`rounded-2xl p-5 ${s.bg} ${s.border}`}>
        <div className={`text-xs font-semibold uppercase tracking-widest ${s.muted} mb-4`}>
          Resumen del mes
        </div>

        {[
          { label: "Chats completados", value: data.chats,     isAccent: false },
          { label: "Videollamadas",      value: data.callHours, isAccent: false },
          { label: "Propinas recibidas", value: data.tips,      isAccent: true  },
          { label: "Total del mes",      value: data.month,     isAccent: true, isBold: true },
        ].map(({ label, value, isAccent, isBold }, i, arr) => (
          <div
            key={label}
            className={`flex justify-between py-3 ${i < arr.length - 1 ? `border-b ${s.divider}` : ''} ${isBold ? 'font-semibold' : ''}`}
          >
            <span className={isBold ? s.text : s.muted}>{label}</span>
            <span className={isAccent ? s.accent : s.text}>{value}</span>
          </div>
        ))}
      </div>

      {/* Total histórico */}
      <div className={`flex justify-between items-center px-5 py-4 rounded-2xl ${s.bg} ${s.border}`}>
        <span className={`text-sm ${s.muted}`}>Total acumulado histórico</span>
        <span className={`text-lg font-bold ${s.accent}`}>{data.total}</span>
      </div>

      <p className={`text-xs text-center ${s.muted}`}>
        Los retiros se procesan en 24–48 hs hábiles
      </p>
    </div>
  );
}