// src/constants/gifts.js
// Fuente de verdad para los regalos de Eva.
// Los sonidos se resuelven en GiftPanel.jsx porque usan import.meta.url (Vite).

import { Video } from "lucide-react";

export const GIFTS = [
  { id: 1,  name: "Beso",        emoji: "💋", image: "/kiss.gif",          cost: 5,      color: "#ff6b8a", soundKey: "basico",       duration: 2000 },
  { id: 2,  name: "Fuego",       emoji: "🔥", image: "/fuegoTenor.gif",    cost: 10,     color: "#ff4500", soundKey: "basico",       duration: 2000 },
  { id: 3,  name: "Corazón",     emoji: "❤️", image: "/corazónTenor.gif",  cost: 15,     color: "#ff0000", soundKey: "basico",       duration: 3000 },
  { id: 4,  name: "Rosa",        emoji: "🌹", image: "/rosaTenor.webp",     cost: 25,     color: "#ff007f", soundKey: "rosa",         duration: 3000 },
  { id: 5,  name: "Copa",        emoji: "🍷", image: "/copaTenor.webp",     cost: 50,     color: "#9b2335", soundKey: "copa",         duration: 3000 },
  { id: 6,  name: "Anillo",      emoji: "💍", image: "/anilloTenor.gif",    cost: 250,    color: "#fbbf24", soundKey: "anillo",       duration: 3000 },
  { id: 7,  name: "Diamante",    emoji: "💎", image: "/diamanteTenor.webp", cost: 100,    color: "#7c3aed", soundKey: "diamante",     duration: 3000 },
  { id: 8, name: "Copa de Oro",  emoji: "🏆", image: "/copadeoro.webp",     cost: 3500,     color: "#eab308",soundKey:"asombro",     duration: 4500 },
  { id: 9,  name: "Corona",      emoji: "👑", image: "/corona.webp",        cost: 600,   color: "#ffd700", soundKey:  "asombro",      duration: 4000 },
  { id: 10, name: "dolar",       emoji: "💵", image: "/dolar.gif",          cost: 750,   color: "#22c55e", soundKey:  "asombro",      duration: 4000 },
  { id: 11,  name: "ORO",        emoji: "💰", image: "/lluviadeoro.gif",    cost: 500,   color: "#c9a84c", soundKey:  "tragamoneda",  duration: 4300 },
  { id: 12, name: "Auto",        emoji: "🏎️", image: "/car1.gif",           cost: 1900,   color: "#ef4444", soundKey: "japonTokio",  duration: 5000 },
  { id: 13, name: "Yate",        emoji: "🛥️", image: "/yate.gif",           cost: 1500,   color: "#0ea5e9", soundKey: "epico",       duration: 5000 },
  { id: 14, name: "Helicóptero", emoji: "🚁", image: "/helicoptero.gif",    cost: 2000,   color: "#64748b", soundKey: "helicopter",  duration: 5000 },
  { id: 15, name: "Avión",       emoji: "✈️", image: "/avioneta.webp",      cost: 2500,  color: "#38bdf8", soundKey:  "avion",        duration: 5000 },
  { id: 16, name: "Mansión",     emoji: "🏛️", image: "/mansion.png",        cost: 3000,  color: "#f59e0b", soundKey:  "pirotecnia",   duration: 5500 },
  { id: 17, name: "Unicornio",   emoji: "🦄", image: "/unicornio.gif",      cost: 4000,  color: "#c084fc", soundKey:  "unicornio",    duration: 4600 },
  { id: 18, name: "Ave Fénix",   emoji: "🦅", image: "/fenix.mp4",          cost: 5000, color: "#f97316", soundKey:   "sonidoFenix",   duration: 7000 },
];