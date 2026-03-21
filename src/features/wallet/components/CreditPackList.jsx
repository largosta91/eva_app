// 📁 src/features/wallet/components/CreditPackList.jsx
//
// Lista de packs de créditos disponibles para comprar.
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora usa packs mockeados. Cuando tengas backend:
//   - Cargar lista de packs desde API:
//     const [packs, setPacks] = useState([])
//     useEffect(() => { api.get('/credits/packs').then(res => setPacks(res.data)) }, [])
//   - Procesar compra con Stripe o MercadoPago:
//     const handleBuy = async (pack) => {
//       const session = await api.post('/payments/checkout', { packId: pack.id })
//       window.location.href = session.url  ← redirige a Stripe Checkout
//     }
//   - Actualizar saldo en el store de Zustand después de la compra exitosa:
//     const { addCredits } = useAppStore()
//     addCredits(pack.credits)
//
// Props:
//   theme → 'dark' | 'light'

export default function CreditPackList({ theme = "dark" }) {

  const styles = {
    dark: {
      bg:        "bg-[#1a1826]",
      border:    "border border-[rgba(201,168,76,.14)]",
      text:      "text-[#ede8ff]",
      accent:    "text-[#c9a84c]",
      popular:   "border-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,.2)]",
      badge:     "bg-[rgba(201,168,76,.15)] text-[#c9a84c]",
    },
    light: {
      bg:        "bg-[#fff9f5]",
      border:    "border border-[rgba(196,96,122,.15)]",
      text:      "text-[#2a1a20]",
      accent:    "text-[#c4607a]",
      popular:   "border-[#c4607a] shadow-[0_0_20px_rgba(196,96,122,.2)]",
      badge:     "bg-[rgba(196,96,122,.15)] text-[#c4607a]",
    },
  };

  const s = styles[theme];

  // ── MOCK DATA ─────────────────────────────────────────────────────────────
  // → Reemplazar con: api.get('/credits/packs')
  // La estructura de cada pack debe mantenerse igual para que el componente funcione.
  const packs = [
    { id: 1, credits: 50,   price: "$4.99",  label: "Esencial",  popular: false },
    { id: 2, credits: 200,  price: "$14.99", label: "Conexión",  popular: true  },
    { id: 3, credits: 1000, price: "$59.99", label: "Elite 🔥",  popular: false },
  ];

  const handleBuy = (pack) => {
    // TODO: conectar con Stripe o MercadoPago
    // → Reemplazar con: api.post('/payments/checkout', { packId: pack.id })
    console.log("Compra simulada:", pack);
    alert(`Compraste ${pack.credits} créditos por ${pack.price} ✅`);
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      {packs.map(pack => (
        <button
          key={pack.id}
          onClick={() => handleBuy(pack)}
          className={`
            relative flex justify-between items-center p-4 rounded-2xl
            w-full text-left cursor-pointer transition-all duration-200
            active:scale-[.98] hover:opacity-90
            ${s.bg} ${pack.popular ? s.popular : s.border}
          `}
        >
          {/* Badge "Popular" encima del botón — solo para el pack del medio */}
          {pack.popular && (
            <span className={`absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${s.badge}`}>
              ⭐ Popular
            </span>
          )}

          {/* Lado izquierdo — nombre y cantidad de créditos */}
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${s.accent}`}>
              {pack.label}
            </span>
            <span className={`text-sm font-medium ${s.text}`}>
              💎 {pack.credits} créditos
            </span>
          </div>

          {/* Lado derecho — precio */}
          <span className={`text-lg font-bold ${s.accent}`}>
            {pack.price}
          </span>
        </button>
      ))}
    </div>
  );
}