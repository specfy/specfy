import { defineConfig } from 'tsup';
export default defineConfig((options) => {
  const isProd = options.minify;
  return {
    entry: ['./src/index.tsx'],
    format: ['esm'],
    external: ['react', 'react-dom'],
    dts: isProd ? false : true,
    sourcemap: false,
    splitting: false,
    metafile: true,
    inject: ['./react-shim.js'],
    onSuccess: isProd ? null : 'tsc --emitDeclarationOnly --declaration',
    minify: false,
    clean: true,
  };
});
