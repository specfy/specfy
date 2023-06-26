import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import sassDts from 'vite-plugin-sass-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sassDts()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  server: {
    headers: {
      // To sync with vercel.json
      'Content-Security-Policy': [
        "default-src 'self' *.specfy.io specfy.io vercel.com *.vercel.com *.github.com localhost:*",
        "script-src 'unsafe-eval' 'unsafe-inline' *.specfy.io specfy.io *.vercel.com www.google.com www.googletagmanager.com www.google-analytics.com www.gstatic.com *.googleapis.com *.github.com localhost:*",
        "style-src 'self' 'unsafe-inline' *.googleapis.com *.github.com localhost:*",
        "connect-src data: 'self' *",
        "font-src 'self' *.specfy.io *.gstatic.com",
        "img-src 'self' blob: data: *.specfy.io *.githubusercontent.com *.github.com github.com codecov.io",
        'child-src  *.github.com github.com localhost:* specfy.io *.specfy.io',
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
        find: /^colors\/safe$/,
        replacement: 'src/color.safe.ts',
      },
    ],
  },
});
