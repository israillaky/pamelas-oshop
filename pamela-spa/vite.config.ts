import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devTarget = env.VITE_DEV_PROXY_TARGET || 'http://pamela-spa.local';

  return {
    base: command === "build" ? "./" : "/",

    plugins: [
      react(),
      tailwindcss(),
    ],

    // Proxy API calls during `npm run dev` so `/server` resolves to your backend
    server: {
      proxy: {
        '/server': {
          target: devTarget,
          changeOrigin: true,
        },
      },
    },
  };
});