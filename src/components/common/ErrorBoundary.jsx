// ErrorBoundary.jsx
//
// Captura errores de renderizado y muestra un fallback.
// ── BACKEND ────────────────────────────────────────────────────────────────
// Este componente no cambia con el backend.
// Lo único que cambia es el mensaje que quieras mostrar.
//
// Props:
//   theme → 'dark' | 'light'

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: enviar error al backend/logging service
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    const { theme = "dark" } = this.props;

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

    if (this.state.hasError) {
      return (
        <div className={`flex flex-col items-center justify-center h-screen ${s.bg}`}>
          <h1 className={`text-xl font-bold mb-4 ${s.text}`}>Algo salió mal 😔</h1>
          <p className="text-[#7a748f] text-sm">Por favor, recarga la página o intenta más tarde.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
