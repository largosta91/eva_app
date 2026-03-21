// 📁 src/components/layout/TopBar.jsx
//
// Barra superior reutilizable para ambas interfaces de Eva.
// Centraliza el logo, el título y los botones de acción opcionales.
//
// Uso básico (solo logo centrado):
//   <TopBar theme="dark" />
//
// Uso con título y botones:
//   <TopBar
//     theme="light"
//     title="Mis Ganancias"
//     left={<button onClick={goBack}>←</button>}
//     right={<button onClick={retirar}>Retirar</button>}
//   />
//
// Props:
//   title  → string opcional — reemplaza el logo "Eva" por un título de pantalla
//   left   → JSX opcional   — elemento a la izquierda (ej: botón volver)
//   right  → JSX opcional   — elemento a la derecha  (ej: créditos, botón acción)
//   theme  → 'dark' (masculino) | 'light' (femenino)

export default function TopBar({ title = '', left = null, right = null, theme = 'dark' }) {

  // Colores según el tema de la interfaz activa
  const themes = {
    dark: {
      bg:       'bg-[#111018]',
      border:   'border-[rgba(201,168,76,.14)]',
      gradient: 'linear-gradient(135deg, #c9a84c, #f0d882)',
    },
    light: {
      bg:       'bg-[#fff9f5]',
      border:   'border-[rgba(196,96,122,.15)]',
      gradient: 'linear-gradient(135deg, #c4607a, #e8a0b0)',
    },
  };

  const t = themes[theme];

  return (
    <header className={`flex items-center justify-between px-5 py-4 ${t.bg} border-b ${t.border} flex-shrink-0`}>

      {/* Lado izquierdo — botón volver, ícono de menú, o espacio vacío */}
      <div className="w-16 flex items-center">
        {left || <span />}
      </div>

      {/* Centro — logo "Eva" con gradiente, o título de la pantalla */}
      <span
        className="text-2xl font-semibold tracking-tight"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          background: t.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title || 'Eva'}
      </span>

      {/* Lado derecho — créditos, botón de acción, o espacio vacío */}
      <div className="w-16 flex items-center justify-end">
        {right || <span />}
      </div>

    </header>
  );
}