import { defineConfig } from 'tsup';
export default defineConfig(() => {
  return {
    entry: ['./src/index.tsx'],
    format: ['esm'],
    external: ['react', 'react-dom'],
    dts: true,
    sourcemap: false,
    splitting: false,
    metafile: true,
    inject: ['./react-shim.js'],
    onSuccess: 'tsc --emitDeclarationOnly --declaration',
    minify: false,
  };
});
