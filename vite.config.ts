import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/gerenciador-chamados/', // <- importante!
  plugins: [react()],
});
