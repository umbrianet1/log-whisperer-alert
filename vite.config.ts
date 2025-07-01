
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Legge l'URL di Graylog dalle variabili d'ambiente, con fallback a localhost
  const graylogUrl = process.env.VITE_GRAYLOG_URL || 'http://localhost:9000';
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api/graylog': {
          target: graylogUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/graylog/, '/api'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request to Graylog:', graylogUrl + req.url);
            });
          }
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
