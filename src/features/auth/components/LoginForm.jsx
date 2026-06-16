import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import useAppStore from '../../../app/store/useAppStore';
import { supabase } from '../../../services/api/supabase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm() {
  const navigate = useNavigate();
  const setUser  = useAppStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 nuevo estado

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Completá todos los campos');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      setError('No se encontró el perfil. Registrate de nuevo.');
      setLoading(false);
      return;
    }

    setUser({
      id:           profile.id,
      name:         profile.display_name,
      display_name: profile.display_name,
      role:         profile.role,
      avatar_url:   profile.avatar_url || null,
      cover_url:    profile.cover_url || null,
    });

    if (profile.role === 'creator') {
      navigate(ROUTES.CREATOR_HOME);
    } else {
      navigate(ROUTES.USER_HOME);
    }
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
            style={{ background: 'linear-gradient(135deg, #8b3a9c, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 5px rgba(139, 58, 156, 0.3))' }}
          >
            Eva
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

          <div className="relative w-full">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-[#1a1826] border border-[rgba(201,168,76,.2)] rounded-full py-3.5 px-5 text-[#ede8ff] text-sm outline-none placeholder:text-[#7a748f] focus:border-[#8b3a9c]"
            />
           <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a84c]"
>
  {showPassword ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.07.168-2.1.475-3.075M9.88 9.88a3 3 0 104.24 4.24M15 15l3.5 3.5M9 9L5.5 5.5" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12C3.5 7 7.5 4 12 4s8.5 3 10.5 8c-2 5-6 8-10.5 8s-8.5-3-10.5-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )}
</button>


          {error && <p className="text-red-400 text-xs px-2">{error}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-full font-semibold text-[15px] bg-gradient-to-r from-[#8b3a9c] to-[#c9a84c] border-none cursor-pointer shadow-[0_8px_30px_rgba(139,58,156,.3)] text-white disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
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
