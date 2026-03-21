import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

const PACKS = [
  { id:1, credits:100,  price:'$4.99',  label:'Starter', bonus:null,         best:false },
  { id:2, credits:300,  price:'$9.99',  label:'Popular', bonus:'+50 gratis',  best:true  },
  { id:3, credits:700,  price:'$19.99', label:'Premium', bonus:'+200 gratis', best:false },
  { id:4, credits:1500, price:'$39.99', label:'Elite',   bonus:'+600 gratis', best:false },
];

export default function PaywallGate() {
  const navigate   = useNavigate();
  const setCredits = useAppStore(s => s.setCredits);
  const [sel, setSel] = useState(null);

  const handleBuy = () => {
    if (!sel) return;
    const pack  = PACKS.find(p => p.id === sel);
    const bonus = pack.bonus ? parseInt(pack.bonus) : 0;
    setCredits(pack.credits + bonus);
    navigate(ROUTES.USER_HOME);
  };

  return (
    <div className="h-screen bg-[#09080f] flex flex-col overflow-hidden">
      <div className="text-center pt-12 pb-6 px-6">
        <div className="text-4xl mb-3">💎</div>
        <h1 className="font-serif text-3xl text-[#ede8ff] font-semibold">Elegí tu pack</h1>
        <p className="text-[#7a748f] text-sm mt-2">Para chatear necesitás créditos</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3">
        {PACKS.map(p => (
          <div
            key={p.id}
            onClick={() => setSel(p.id)}
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${sel === p.id ? 'border-[#c9a84c] bg-[rgba(201,168,76,.08)]' : 'border-[rgba(201,168,76,.14)] bg-[#1a1826]'}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#ede8ff] text-[15px]">{p.label}</span>
                {p.best && <span className="bg-[#c9a84c] text-[#09080f] text-[10px] font-bold px-2 py-0.5 rounded-full">MÁS POPULAR</span>}
              </div>
              <div className="text-sm text-[#7a748f] mt-0.5">
                💎 {p.credits} créditos {p.bonus && <span className="text-green-400">{p.bonus}</span>}
              </div>
            </div>
            <div className="text-[#c9a84c] font-semibold text-[16px]">{p.price}</div>
          </div>
        ))}
      </div>

      <div className="p-5 pb-8">
        <button
          onClick={handleBuy}
          disabled={!sel}
          className={`w-full py-4 rounded-full font-semibold text-[15px] border-none transition-all duration-200 ${sel ? 'bg-gradient-to-r from-[#c9a84c] to-[#f0d882] text-[#09080f] cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)]' : 'bg-[#1a1826] text-[#7a748f] cursor-default'}`}
        >
          {sel ? 'Comprar ahora' : 'Seleccioná un pack'}
        </button>
      </div>
    </div>
  );
}