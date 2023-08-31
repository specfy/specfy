import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react-swc';
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import sassDts from 'vite-plugin-sass-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sassDts(),
    checker({
      typescript: true,
    }),
    pluginRewriteAll(),
    // visualizer(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  server: {
    headers: {
      // To sync with vercel.json
      'Content-Security-Policy': [
        "default-src 'self' *.specfy.io specfy.io vercel.com *.vercel.com *.github.com localhost:* *.jsdelivr.net",
        "script-src 'unsafe-eval' 'unsafe-inline' *.specfy.io specfy.io *.vercel.com *.vercel-scripts.com www.google.com www.googletagmanager.com www.google-analytics.com www.gstatic.com *.googleapis.com *.github.com localhost:* *.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' *.googleapis.com *.github.com localhost:* *.jsdelivr.net",
        "connect-src data: 'self' *",
        "font-src 'self' *.specfy.io *.gstatic.com *.jsdelivr.net",
        "img-src 'self' blob: data: *.specfy.io *",
        'child-src  *.github.com github.com localhost:* specfy.io *.specfy.io *.jsdelivr.net',
        "media-src 'self' *.github.com",
      ].join(';'),
    },
  },
  // ...
  define: {
    // process: { env: {}, argv: '' },
    'process.env': {},
    'process.argv': '""',
    'process.stderr': {},
    'process.stdout': {},
    // 'process.platform': '',
  },
  resolve: {
    alias: [
      {
        // Needed for json-diff
        find: /^colors\/safe$/,
        replacement: 'src/color.safe.ts',
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
});
