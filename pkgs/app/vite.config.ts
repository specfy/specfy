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
  // ...
  define: {
    // process: { env: {}, argv: '' },
    'process.env': {},
    'process.argv': '""',
  },
});
