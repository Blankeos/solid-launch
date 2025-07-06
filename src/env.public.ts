import { createEnv } from '@t3-oss/env-core';
import z from 'zod';

export const publicEnv = createEnv({
  runtimeEnv: import.meta.env,
  clientPrefix: 'PUBLIC_',
  client: {
    // Add client envs here.
  },
  server: {
    /** Development|Prod. */
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },
});
