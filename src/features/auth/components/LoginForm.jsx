import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

export default function LoginForm() {
  const navigate = useNavigate();
  const setUser  = useAppStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = () => {
    setUser({ id: '1', name: 'Usuario', role: 'user' });
    navigate(ROUTES.PAYWALL);
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center">
          <div
            className="font-serif text-4xl font-semibold mb-1"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#f0d882)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Eva
          </div>
          <p className="text-[#7a748f] text-sm">Iniciá sesión para continuar</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c9a84c]"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#c9a84c]"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-full font-semibold text-[15px] text-[#09080f] bg-gradient-to-r from-[#c9a84c] to-[#f0d882] border-none cursor-pointer shadow-[0_8px_30px_rgba(201,168,76,.3)]"
        >
          Entrar
        </button>

        <div className="text-center text-sm text-[#5a5470]">
          ¿No tenés cuenta?{' '}
          <span
            className="text-[#c9a84c] cursor-pointer"
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Registrate
          </span>
        </div>

      </div>
    </div>
  );
}