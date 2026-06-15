import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'feature-auth': [
            './src/features/auth/components/LoginForm.jsx',
            './src/features/auth/components/RegisterForm.jsx',
            './src/features/auth/components/SplashScreen.jsx',
            './src/features/auth/components/JoinCreator.jsx',
            './src/features/auth/components/VerifyScreen.jsx',
          ],
          'feature-calls': [
            './src/features/calls/components/VideoCall.jsx',
            './src/features/calls/components/CreatorVideoCall.jsx',
            './src/features/calls/components/CallControls.jsx',
            './src/features/calls/components/MiniChat.jsx',
          ],
        },
      },
    },
  },
})
