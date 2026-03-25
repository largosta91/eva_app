// 📁 src/features/creators/components/CreatorProfile.jsx
//
// Muestra el perfil de una creadora (foto, nombre, bio).
//
// ── BACKEND ────────────────────────────────────────────────────────────────
// Ahora usa datos mockeados. Cuando tengas backend:
//   - Cargar perfil real desde API:
//     const [creator, setCreator] = useState(null)
//     useEffect(() => { api.get('/creators/me').then(res => setCreator(res.data)) }, [])
//   - Actualizar foto, nombre y bio:
//     api.put('/creators/profile', { name, bio, avatar })
//   - La foto se sube primero a storage (S3 o Supabase Storage):
//     const url = await uploadImage(file)
//     api.put('/creators/profile', { avatar: url })
//
// Props:
//   theme   → 'dark' | 'light'
//   creator → objeto con { name, bio, avatar } — mock por defecto

// Usamos el componente Avatar que ya creamos en components/ui/
// Si no hay foto real, muestra las iniciales del nombre en vez de imagen rota
import Avatar from "../../../components/ui/Avatar";

export default function CreatorProfile({ theme = "dark", creator = null }) {
  const styles = {
    dark: {
      bg: "bg-[#111018]", // Un toque más oscuro para que resalte el borde
      border: "border border-[rgba(201,168,76,.25)]",
      text: "text-[#ede8ff]",
      accent: "text-[#c9a84c]",
      muted: "text-[#7a748f]",
      card: "bg-[#1a1826]",
    },
    light: {
      bg: "bg-[#fff9f5]",
      border: "border border-[rgba(196,96,122,.15)]",
      text: "text-[#2a1a20]",
      accent: "text-[#c4607a]",
      muted: "text-[#9a7a84]",
      card: "bg-white",
    },
  };

  const s = styles[theme];

  const mock = {
    name: "Valentina",
    bio: "Creadora apasionada por el arte y la conexión genuina. Me encanta viajar y conocer historias nuevas.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80", 
    rating: 4.9,
    reviews: 127,
    activeSince: "enero 2024",
  };

  const data = creator || mock;

  return (
    <div className={`flex flex-col items-center p-8 rounded-[32px] ${s.bg} ${s.border} shadow-2xl relative overflow-hidden`}>
      
      {/* Decoración de fondo sutil */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c9a84c]/5 rounded-full blur-3xl" />

      {/* FOTO DE PERFIL CON ANILLO DE LUZ */}
      <div className="relative mb-4">
        <div className="p-1 rounded-full bg-gradient-to-tr from-[#8b3a9c] to-[#c9a84c]">
          <div className="bg-[#111018] rounded-full p-1">
            <Avatar
              src={data.avatar}
              name={data.name}
              size="xl"
              theme={theme}
              className="shadow-2xl"
            />
          </div>
        </div>
        {/* Badge de Verificada */}
        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#111018]">
          ✓
        </div>
      </div>

      {/* NOMBRE Y TÍTULO */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl font-semibold ${s.text} mb-1`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {data.name}
        </h2>
        <div className={`text-[11px] uppercase tracking-[3px] font-bold ${s.accent} opacity-80`}>
          Creadora Verificada
        </div>
      </div>

      {/* STATS EN PÍLDORAS */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`${s.card} border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm`}>
          <span className="text-yellow-500 text-sm">⭐</span>
          <span className={`text-sm font-bold ${s.text}`}>{data.rating}</span>
        </div>
        <div className={`${s.card} border border-white/5 px-4 py-2 rounded-2xl shadow-sm`}>
          <span className={`text-xs ${s.muted}`}>
            <strong className={s.text}>{data.reviews}</strong> reseñas
          </span>
        </div>
      </div>

      {/* BIO CON ESTILO REFINADO */}
      <div className="relative w-full">
        <span className={`absolute -top-4 left-0 text-4xl ${s.accent} opacity-20 font-serif`}>“</span>
        <p className={`text-[15px] text-center leading-relaxed px-4 italic ${s.text} opacity-90`}>
          {data.bio}
        </p>
        <span className={`absolute -bottom-8 right-0 text-4xl ${s.accent} opacity-20 font-serif`}>”</span>
      </div>

      {/* PIE DE PERFIL */}
      <div className={`mt-10 pt-4 border-t border-white/5 w-full text-center text-[10px] uppercase tracking-widest ${s.muted}`}>
        Activa desde {data.activeSince}
      </div>

    </div>
  );
}