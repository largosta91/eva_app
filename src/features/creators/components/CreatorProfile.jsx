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
      bg:     "bg-[#1a1826]",
      border: "border border-[rgba(201,168,76,.14)]",
      text:   "text-[#ede8ff]",
      accent: "text-[#c9a84c]",
      muted:  "text-[#7a748f]",
    },
    light: {
      bg:     "bg-[#fff9f5]",
      border: "border border-[rgba(196,96,122,.15)]",
      text:   "text-[#2a1a20]",
      accent: "text-[#c4607a]",
      muted:  "text-[#9a7a84]",
    },
  };

  const s = styles[theme];

  // ── MOCK DATA ─────────────────────────────────────────────────────────────
  // → Reemplazar con: api.get('/creators/me')
  const mock = {
    name:   "Valentina",
    bio:    "Creadora apasionada por el arte y la conexión genuina.",
    avatar: null,      // null → Avatar muestra las iniciales automáticamente
    rating: 4.9,
    reviews: 127,
    activeSince: "enero 2024",
  };

  const data = creator || mock;

  return (
    <div className={`flex flex-col items-center gap-4 p-6 rounded-2xl ${s.bg} ${s.border}`}>

      {/* Foto de perfil — usa el componente Avatar para manejar el caso sin imagen */}
      <Avatar
        src={data.avatar}
        name={data.name}
        size="xl"
        theme={theme}
      />

      {/* Nombre */}
      <h2 className={`text-xl font-semibold ${s.accent}`}
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {data.name}
      </h2>

      {/* Rating y reseñas */}
      <div className={`flex items-center gap-1.5 text-sm ${s.muted}`}>
        <span>⭐ {data.rating}</span>
        <span>·</span>
        <span>{data.reviews} reseñas</span>
        <span>·</span>
        <span>Activa desde {data.activeSince}</span>
      </div>

      {/* Bio */}
      <p className={`text-sm text-center leading-relaxed ${s.text}`}>
        {data.bio}
      </p>

    </div>
  );
}