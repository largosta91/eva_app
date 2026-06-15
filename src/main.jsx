import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.jsx'

// 🔐 CANDADO DE SEGURIDAD GRATUITO
// Al entrar al link, saltará un cartel pidiendo la clave.
const password = prompt("Ingresá la clave secreta para acceder a Eva App:");

if (password !== "sheilamividateamo") { // <-- CAMBIA ACÁ tu contraseña secreta
  // Si la clave está mal, borramos la pantalla y mostramos este diseño oscuro
  document.body.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      width: 100vw;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif; 
      background-color: #0b0f19; 
      color: #f3f4f6;
    ">
      <div style="text-align: center; padding: 20px;">
        <span style="font-size: 4rem;">🔒</span>
        <h1 style="font-size: 2rem; margin-top: 15px; font-weight: 700; color: #ef4444;">Acceso Privado</h1>
        <p style="color: #9ca3af; margin-top: 10px; font-size: 1.1rem;">No tenés permisos para ver esta aplicación o la clave es incorrecta.</p>
        <button onclick="window.location.reload()" style="
          margin-top: 25px;
          padding: 10px 20px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">Reintentar</button>
      </div>
    </div>
  `;
  // Clavamos el freno de mano definitivo para que React no procese nada por detrás
  throw new Error("Acceso denegado: Contraseña incorrecta.");
}

// Si la clave es correcta, saltea el bloqueo y arranca la app normal:
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);