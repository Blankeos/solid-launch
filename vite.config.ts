// Icons
import Icons from 'unplugin-icons/vite'; // Existing Icon Library (icones.js)
import solidSvg from 'vite-plugin-solid-svg'; // Custom Icons (SVG)

// Vike
import vikeSolid from 'vike-solid/vite';
import vike from 'vike/plugin';

// Hono
import devServer from '@hono/vite-dev-server';

// Vite
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '.');

export default defineConfig({
  plugins: [
    devServer({
      entry: './src/server/server.ts',
      exclude: [
        /^\/@.+$/,
        /.*\.(ts|tsx|vue)($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /^\/favicon\.ico$/,
        /.*\.(svg|png)($|\?)/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
      ],
      injectClientScript: false,
    }),
    vike(),
    vikeSolid(),
    solidSvg(),
    Icons({
      compiler: 'solid',
    }),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
});
