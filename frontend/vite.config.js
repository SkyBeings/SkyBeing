import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (err.code === 'ECONNREFUSED') {
              err.message = '';
              err.stack = '';
            }
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Backend is starting up or offline.' }));
            }
          });
        },
      }
    }
  },

  build: {
    // Target modern evergreen browsers — enables smaller/faster output
    // (no need to polyfill generators, async/await, etc.)
    target: 'es2018',

    // Split CSS per chunk so only the CSS for the current route loads
    cssCodeSplit: true,

    // Increase chunk size warning limit — jspdf/xlsx are expected to be large
    chunkSizeWarningLimit: 600,

    // Minification: esbuild is extremely fast and produces small output
    minify: 'esbuild',

    rollupOptions: {
      // Treeshake aggressively — remove all dead code paths from vendor libs
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },

      output: {
        // Content-hash in filename = immutable long-term caching at CDN/browser level.
        // Files ONLY change their hash when their content changes, so unchanged
        // vendor chunks stay cached across deploys.
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        // ── Vendor chunk splitting strategy ──────────────────────────────────
        // Each vendor group is split into its own cacheable chunk.
        // 99% of deploys only change YOUR code — vendors stay cached.
        manualChunks: (id) => {
          // React core — tiny, rarely changes
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Redux toolkit
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/redux') || id.includes('node_modules/react-redux') || id.includes('node_modules/immer')) {
            return 'vendor-redux';
          }
          // React Router + Remix run
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          // Google OAuth
          if (id.includes('node_modules/@react-oauth') || id.includes('node_modules/oauth')) {
            return 'vendor-oauth';
          }
          // Heavy PDF/image export libs — only fetched when user triggers export
          if (
            id.includes('node_modules/jspdf') ||
            id.includes('node_modules/html2canvas') ||
            id.includes('node_modules/html-to-image') ||
            id.includes('node_modules/html2pdf') ||
            id.includes('node_modules/canvg')
          ) {
            return 'vendor-pdf';
          }
          // Spreadsheet lib — only needed for data export pages
          if (id.includes('node_modules/xlsx')) {
            return 'vendor-xlsx';
          }
          // Barcode lib
          if (id.includes('node_modules/jsbarcode')) {
            return 'vendor-barcode';
          }
          // Lucide icons — large but tree-shakeable; keep separate for caching
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // HTTP clients
          if (id.includes('node_modules/axios') || id.includes('node_modules/qs')) {
            return 'vendor-http';
          }
          // DOM utilities
          if (id.includes('node_modules/dompurify')) {
            return 'vendor-dom';
          }
        },
      },
    },
  },
})
