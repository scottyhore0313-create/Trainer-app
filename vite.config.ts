import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // pose-detection statically imports `Pose` from the optional MediaPipe
      // runtime even though we only use the TFJS/MoveNet backend. Swap in a
      // stub so the bundler's export analysis succeeds without shipping it.
      '@mediapipe/pose': fileURLToPath(
        new URL('./shims/mediapipe-pose-stub.js', import.meta.url),
      ),
    },
  },
})
