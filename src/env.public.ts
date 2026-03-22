import { createEnv } from "@t3-oss/env-core"
import z from "zod"

export const publicEnv = createEnv({
  clientPrefix: "PUBLIC_",
  client: {
    // Add client envs here.
    PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
  },
  runtimeEnvStrict: {
    PUBLIC_BASE_URL: import.meta.env.PUBLIC_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
  },
  server: {
    /** Development|Prod. */
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
})
