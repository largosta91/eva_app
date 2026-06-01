import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

const PACKS = [
  { id: 1, credits: 1000,  price: '$9.99',  label: 'Starter', bonus: null,           best: false },
  { id: 2, credits: 3000,  price: '$24.99', label: 'Popular', bonus: '+500 gratis',  best: true  },
  { id: 3, credits: 7000,  price: '$49.99', label: 'Premium', bonus: '+1500 gratis', best: false },
  { id: 4, credits: 15000, price: '$99.99', label: 'Elite',   bonus: '+4000 gratis', best: false },
];

export default function PaywallGate() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const setCredits = useAppStore(s => s.setCredits);
  const [sel, setSel] = useState(null);

  // ─── BACK: cuando navegues acá desde VideoCall, pasá el estado así: ──────────
  // navigate(ROUTES.PAYWALL, { state: { fromCall: true, girlId: girl.id } })
  // ─────────────────────────────────────────────────────────────────────────────
  const _fromCall = location.state?.fromCall ?? false;
  const _girlId   = location.state?.girlId   ?? null;

  const handleBuy = () => {
    if (!sel) return;
    const pack  = PACKS.find(p => p.id === sel);
    const bonus = pack.bonus ? parseInt(pack.bonus.replace(/\D/g, '')) : 0;

    // TODO BACK: reemplazar por llamada real al backend:
    // await paymentService.purchase(pack.id)
    // await walletService.getBalance() → actualizar créditos desde el server
    setCredits(pack.credits + bonus);

    // TODO BACK: si vino de una llamada → volver a esa llamada después de pagar:
    // if (fromCall && girlId) {
    //   navigate(ROUTES.VIDEO_CALL, { state: { girlId } });
    //   return;
    // }
    navigate(ROUTES.USER_HOME);
  };

  const handleBack = () => {
    // Siempre va a UserHome al cancelar — nunca vuelve a la llamada sin pagar
    navigate(ROUTES.USER_HOME);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: '#07060a' }}>

      {/* Botón volver — siempre a UserHome, nunca a la llamada sin pagar */}
      <button
        onClick={handleBack}
        className="absolute top-8 left-2 z-20 text-[#7a748f] hover:text-[#c9a84c] transition-colors text-4xl bg-transparent border-none cursor-pointer p-3"
      >
        ‹
      </button>

      {/* Ambient gold glow top */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 35% at 50% 0%, rgba(212,170,60,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 50% 25% at 90% 100%, rgba(180,130,30,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 30% 20% at 10% 60%, rgba(212,170,60,0.06) 0%, transparent 60%)
          `
        }}
      />

      {/* Gold top line */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #c9a84c 30%, #f5e27a 50%, #c9a84c 70%, transparent 100%)'
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center pt-11 pb-5 px-6">
        <div
          className="text-4xl mb-3 inline-block"
          style={{ filter: 'drop-shadow(0 0 20px rgba(212,170,60,0.7)) drop-shadow(0 0 40px rgba(212,170,60,0.3))' }}
        >
          💎
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(160deg, #f5e27a 0%, #d4aa3c 40%, #c9a84c 65%, #a07820 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Elegí tu pack
        </h1>

        {/* Ornament */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#c9a84c', opacity: 0.8 }} />
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
        </div>
      </div>

      {/* Pack list */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 flex flex-col gap-2.5" style={{ scrollbarWidth: 'none' }}>
        {PACKS.map(p => {
          const isSelected = sel === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSel(p.id)}
              className="relative flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-px"
              style={{
                border: isSelected ? '1px solid rgba(201,168,76,0.55)' : '1px solid rgba(201,168,76,0.13)',
                background: isSelected
                  ? 'linear-gradient(145deg, #1c1708, #14120a)'
                  : 'linear-gradient(145deg, #141210, #0f0e0b)',
                boxShadow: isSelected
                  ? '0 0 0 1px rgba(245,226,122,0.15), inset 0 1px 0 rgba(245,226,122,0.12), 0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(201,168,76,0.08)'
                  : 'none',
              }}
            >
              {/* Gold overlay on selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 55%)' }}
                />
              )}

              <div className="flex-1 pr-3 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold" style={{ color: '#f0e8cc' }}>
                    {p.label}
                  </span>
                  {p.best && (
                    <span
                      className="text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #f5e27a 0%, #c9a84c 100%)',
                        color: '#07060a',
                      }}
                    >
                      Más popular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>💎 {p.credits} créditos</span>
                  {p.bonus && <span className="text-green-400 font-medium">{p.bonus}</span>}
                </div>
              </div>

              <div
                className="text-base font-semibold flex-shrink-0 relative z-10"
                style={isSelected ? {
                  background: 'linear-gradient(160deg, #f5e27a 0%, #d4aa3c 60%, #a87f20 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : { color: 'rgba(255,255,255,0.35)' }}
              >
                {p.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer button */}
      <div className="relative z-10 px-4 pt-3 pb-8">
        <button
          onClick={handleBuy}
          disabled={!sel}
          className="w-full py-4 rounded-full text-sm font-semibold tracking-widest uppercase border-none transition-all duration-200 relative overflow-hidden"
          style={sel ? {
            background: 'linear-gradient(135deg, #f5e27a 0%, #d4aa3c 45%, #c9a84c 75%, #a07820 100%)',
            color: '#07060a',
            boxShadow: '0 6px 28px rgba(201,168,76,0.4), 0 0 0 1px rgba(245,226,122,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          } : {
            background: '#12100c',
            color: 'rgba(201,168,76,0.3)',
            border: '1px solid rgba(201,168,76,0.1)',
            cursor: 'default',
          }}
        >
          {sel ? 'Comprar ahora' : 'Seleccioná un pack'}
        </button>
      </div>
    </div>
  );
}