import { createEnv } from '@t3-oss/env-core';
import z from 'zod';

export const privateEnv = createEnv({
  runtimeEnv: process.env,
  server: {
    /** Development|Prod. Port of the app. */
    PORT: z.number().default(3000),
    /** Development|Prod. */
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    // Database
    /** Development|Prod. Url of the database. */
    DATABASE_URL: z.string(),
    /** Development(Optional)|Prod. https://docs.turso.tech/local-development#sqlite. */
    DATABASE_AUTH_TOKEN: z
      .string()
      .optional()
      .refine((val) => (process.env.NODE_ENV !== 'development' ? !!val : true)),

    // Auth
    /** Development|Prod. GitHub OAuth client ID. */
    GITHUB_CLIENT_ID: z.string(),
    /** Development|Prod. GitHub OAuth client secret. */
    GITHUB_CLIENT_SECRET: z.string(),
    /** Development|Prod. Google OAuth client ID. */
    GOOGLE_OAUTH_CLIENT_ID: z.string(),
    /** Development|Prod. Google OAuth client secret. */
    GOOGLE_OAUTH_CLIENT_SECRET: z.string(),

    // S3
    /** Development|Prod. S3 access key ID. */
    S3_ACCESS_KEY_ID: z.string(),
    /** Development|Prod. S3 secret access key. */
    S3_SECRET_ACCESS_KEY: z.string(),
    /** Development|Prod. S3 bucket name. */
    S3_BUCKET_NAME: z.string().default('solid-launch'),
    /** Development|Prod. S3 region. */
    S3_REGION: z.string().default('us-east-1'),
    /** Development|Prod. S3 endpoint. Important that this starts with http:// or https:// */
    S3_ENDPOINT: z.string().default('http://127.0.0.1:9000'),

    // Payments
    /** Development|Prod. For payments. */
    LEMONSQUEEZY_API_KEY: z.string(),
  },
});
