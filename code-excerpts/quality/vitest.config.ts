// vite.config.ts에 test 블록을 합쳐서 단일 설정으로 굴림
// Vitest 3+ / Vite 5 조합에서만 안전 Vite 6에서는 vitest.config.ts를 별도로 분리해야 함

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
})
