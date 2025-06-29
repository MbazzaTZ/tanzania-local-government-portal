import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add this configuration
    host: true, // This is the recommended setting for cloud IDEs
    hmr: {
      // This is necessary for HMR (Hot Module Replacement) to work in CodeSandbox
      clientPort: 443,
    },
    // You can also specify the host directly if the above doesn't work
    // allowedHosts: ['lszpvv-5173.csb.app']
  },
});
