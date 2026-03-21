// LoadingScreen.jsx
//
// Pantalla de carga genérica.
// ── BACKEND ────────────────────────────────────────────────────────────────
// Este componente no cambia con el backend.
// Lo único que cambia es CUÁNDO se muestra (ej: mientras se espera respuesta).
//
// Props:
//   theme → 'dark' | 'light'

export default function LoadingScreen({ theme = "dark" }) {
  const styles = {
    dark: {
      bg: "bg-[#09080f]",
      text: "text-[#c9a84c]",
    },
    light: {
      bg: "bg-[#fdf6f0]",
      text: "text-[#c4607a]",
    },
  };

  const s = styles[theme];

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${s.bg}`}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7a748f] mb-6"></div>
      <p className={`text-lg font-semibold ${s.text}`}>Cargando...</p>
    </div>
  );
}
