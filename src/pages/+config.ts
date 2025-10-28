import type { Config } from "vike/types"
import vikePhoton from "vike-photon/config"
import config from "vike-solid/config"

// Default config (can be overridden by pages)
export default {
  extends: [config, vikePhoton as Config],
  photon: {
    server: "src/server/server.ts",
  },
} satisfies Config
