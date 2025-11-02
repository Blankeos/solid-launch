// Icons

// Vite
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import vike from "vike/plugin"
// Vike
import vikeSolid from "vike-solid/vite"
import { defineConfig } from "vite"
import solidSvg from "vite-plugin-solid-svg" // Custom Icons (SVG)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, ".")

// Routegen
import vikeRoutegen from "@blankeos/vike-routegen"

// Tailwind
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [vike(), vikeSolid(), vikeRoutegen(), solidSvg(), tailwindcss()],
  server: {
    port: 3000,
    allowedHosts: [
      "*", // So payment webhooks work (or just replace this with the actual domain). This is only in dev anyway.
    ],
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  envPrefix: ["PUBLIC_"],
})
