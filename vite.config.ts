import vikeRoutegen from "@blankeos/vike-routegen"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import vikeSolid from "vike-solid/vite"
import { defineConfig } from "vite"
import solidSvg from "vite-plugin-solid-svg" // Custom Icons (SVG)
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsConfigPaths(), vike(), vikeSolid(), vikeRoutegen(), solidSvg(), tailwindcss()],
  server: {
    port: 3000,
    allowedHosts: [
      "*", // So payment webhooks work (or just replace this with the actual domain). This is only in dev anyway.
    ],
  },
  preview: { port: 3000 },
  envPrefix: ["PUBLIC_"],
})
