import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // If using React, otherwise remove

export default defineConfig({
  plugins: [react()], // Keep only if using React
  server: {
    host: "0.0.0.0", // Allow external access
    port: 4200, // Ensure this matches your Railway port
    strictPort: true,
    hmr: {
      clientPort: 443, // Ensures WebSocket connection works
    },
    allowedHosts: ["furever-home.up.railway.app"], // Allow Railway host
    cors: true, // Allow Cross-Origin Requests
  },
  preview: {
    host: "0.0.0.0",
    port: 4200,
    allowedHosts: ["furever-home.up.railway.app"],
  },
});
