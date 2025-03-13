export default defineConfig({
    server: {
        host: "0.0.0.0", // Allow external access
        port: 4200, // Ensure it matches your Railway port
        strictPort: true,
        allowedHosts: ["furever-home.up.railway.app"], // Add Railway host
    }
});
