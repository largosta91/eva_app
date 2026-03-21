// 📁 src/components/layout/TabBar.jsx
//
// Barra de navegación inferior reutilizable para ambas interfaces de Eva.
// Reemplaza las versiones duplicadas que había en MaleApp y FemaleApp.
//
// Uso:
//   <TabBar
//     tabs={[
//       { key: 'home',  icon: '🏠', label: 'Inicio' },
//       { key: 'chats', icon: '💬', label: 'Chats'  },
//     ]}
//     active="home"
//     onTab={(key) => setScreen(key)}
//     theme="dark"
//   />
//
// Props:
//   tabs   → array de objetos { key, icon, label } — define qué pestañas mostrar
//   active → string con el key de la pestaña activa — la que se resalta
//   onTab  → función que recibe el key cuando el usuario toca una pestaña
//   theme  → 'dark' (masculino, dorado) | 'light' (femenino, rosa)

export default function TabBar({ tabs = [], active = '', onTab, theme = 'dark' }) {

  // Colores según el tema de la interfaz activa
  const themes = {
    dark: {
      bg:          'bg-[#111018]',
      border:      'border-[rgba(201,168,76,.14)]',
      activeColor: 'text-[#c9a84c]',
      inactiveColor:'text-[#7a748f]',
    },
    light: {
      bg:          'bg-[#fff9f5]',
      border:      'border-[rgba(196,96,122,.15)]',
      activeColor: 'text-[#c4607a]',
      inactiveColor:'text-[#9a7a84]',
    },
  };

  const t = themes[theme];

  return (
    <nav className={`flex ${t.bg} border-t ${t.border} pb-5 pt-2 flex-shrink-0`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTab(tab.key)}
          className={`
            flex-1 flex flex-col items-center gap-1
            text-[10px] font-medium uppercase tracking-wide
            bg-transparent border-none cursor-pointer
            transition-colors duration-200
            ${active === tab.key ? t.activeColor : t.inactiveColor}
          `}
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}