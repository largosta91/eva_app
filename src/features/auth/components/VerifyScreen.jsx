import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { ROLES } from '../../../constants/roles';

export default function VerifyScreen() {
  const navigate = useNavigate();
  const setUser  = useAppStore(s => s.setUser);
  const [code, setCode] = useState('');

  const handleVerify = () => {
    // Simulamos login exitoso como usuario masculino
    setUser({ id: '1', name: 'Usuario', role: ROLES.USER });
    navigate(ROUTES.PAYWALL);
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <div className="text-5xl mb-3">📩</div>
          <h1 className="font-serif text-3xl text-[#ede8ff] font-semibold">Verificá tu cuenta</h1>
          <p className="text-[#7a748f] text-sm mt-2">Te mandamos un código al email</p>
        </div>

        <input
          type="text"
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] text-center tracking-[8px] focus:border-[#c9a84c]"
        />

        <button
          onClick={handleVerify}
          className="w-full py-4 rounded-full font-semibold text-[15px] text-[#09080f] bg-gradient-to-r from-[#c9a84c] to-[#f0d882] border-none cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)]"
        >
          Verificar →
        </button>

      </div>
    </div>
  );
}