import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Bloque de React y sus dependencias principales
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          
          // 2. Bloque de Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          
          // 3. Bloque de Autenticación (Auth)
          if (id.includes('src/features/auth/components/')) {
            if (
              id.includes('LoginForm') ||
              id.includes('RegisterForm') ||
              id.includes('SplashScreen') ||
              id.includes('JoinCreator') ||
              id.includes('VerifyScreen')
            ) {
              return 'feature-auth';
            }
          }
          
          // 4. Bloque de Videollamadas (Calls)
          if (id.includes('src/features/calls/components/')) {
            if (
              id.includes('VideoCall') ||
              id.includes('CreatorVideoCall') ||
              id.includes('CallControls') ||
              id.includes('MiniChat')
            ) {
              return 'feature-calls';
            }
          }
        },
      },
    },
  },
})