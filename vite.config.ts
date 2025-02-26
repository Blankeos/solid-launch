// Icons
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

// Tailwind
import tailwindcss from '@tailwindcss/vite';

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
    tailwindcss(),
    vike(),
    vikeSolid(),
    solidSvg(),
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
  envPrefix: ['PUBLIC_'],
});
