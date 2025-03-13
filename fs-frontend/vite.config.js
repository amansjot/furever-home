import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Remove if not using React

export default defineConfig({
  plugins: [react()], // Remove if not using React
  server: {
    host: "0.0.0.0", // Allow external access
    port: 4200,
    strictPort: true,
    cors: true, // Enable CORS
    allowedHosts: "all", // Allow any host (TEMPORARY)
    hmr: {
      clientPort: 443, // Ensures WebSocket connection works
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4200,
    allowedHosts: "all", // TEMPORARY
  },
});
