// src/features/auth/components/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';

export default function LoginForm() {
  const navigate = useNavigate();
  const setUser  = useAppStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Ingresá un email válido');
      return;
    }
    if (!form.password) {
      setError('Ingresá tu contraseña');
      return;
    }
    setError('');
    // BACKEND: reemplazar con llamada a API de login
    setUser({ id: '1', name: 'Usuario', role: 'user' });
    navigate(ROUTES.USER_HOME);
  };

  return (
  <div
    className="h-screen flex flex-col items-center justify-center px-6"
    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,#1a1030,#09080f)' }}
  >
    <div className="w-full max-w-sm flex flex-col gap-6">

      <div className="text-center">
        <div className="animate-shine">
          <div
            className="font-serif text-4xl font-semibold mb-1"
            style={{ 
              background: 'linear-gradient(135deg, #8b3a9c, #c9a84c)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 5px rgba(139, 58, 156, 0.3))'
            }}
          >
            Eva
          </div>
        </div>
        <p className="text-[#c9a84c] text-sm mt-2">Iniciá sesión para continuar</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#8b3a9c]"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#8b3a9c]"
        />
        {error && (
          <p className="text-red-400 text-xs px-2">{error}</p>
        )}
      </div>

      <button
        onClick={handleLogin}
        className="w-full py-4 rounded-full font-semibold text-[15px] bg-gradient-to-r from-[#8b3a9c] to-[#c9a84c] border-none cursor-pointer shadow-[0_8px_30px_rgba(139,58,156,.3)] text-white"
      >
        Entrar
      </button>

      <div className="text-center text-sm text-[#5a5470]">
        ¿No tenés cuenta?{' '}
        <button
          onClick={() => navigate(ROUTES.REGISTER)}
          className="text-[#c9a84c] bg-transparent border-none cursor-pointer text-sm p-0"
        >
          Registrate
        </button>
      </div>

    </div>
  </div>
  );
}