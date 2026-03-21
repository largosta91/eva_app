// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora los regalos son mockeados. Cuando tengas backend:
//   - Cargar lista de regalos desde API.
//   - Enviar evento de regalo al servidor.
//   - Actualizar créditos/diamantes en tiempo real.

export default function GiftPanel({ context = "chat" }) {
  // Definimos regalos por nivel
  const gifts = [
    { id: 1, name: "🔥 Beso virtual", emoji: "💋", cost: 5, level: 1 },
    { id: 2, name: "🍷 Copa de vino", emoji: "🍷", cost: 20, level: 2 },
    { id: 3, name: "🏰 Mansion VIP", emoji: "🏰", cost: 100, level: 3 },
  ];

  // En chat mostramos los 3 niveles, en llamada solo 1 y 3
  const visibleGifts =
    context === "chat"
      ? gifts
      : gifts.filter((g) => g.level === 1 || g.level === 3);

  const handleGift = (gift) => {
    // TODO: enviar al backend el regalo
    console.log("Regalo enviado:", gift);
  };

  return (
    <div className="flex gap-3 p-3 border-t border-[#1f1d2b] bg-[#0f0e17] overflow-x-auto">
      {visibleGifts.map((gift) => (
        <button
          key={gift.id}
          onClick={() => handleGift(gift)}
          className="flex flex-col items-center gap-1 bg-[#1f1d2b] px-3 py-2 rounded-lg text-[#ede8ff] hover:bg-[#2a273f] text-sm"
        >
          <span className="text-xl">{gift.emoji}</span>
          <span>{gift.name}</span>
          <span className="text-xs text-[#7a748f]">💎 {gift.cost}</span>
        </button>
      ))}
    </div>
  );
}
