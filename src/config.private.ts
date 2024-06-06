/** Only place private configurations here. */
export const privateConfig = {
  /** Port of the app (in dev). */
  PORT: (process.env.PORT || 3000) as number,
  /** Development or Production. */
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production',
  /** DB-specific settings. */
  database: {
    /** The url of the database. */
    URL: process.env.DATABASE_URL! as string,
    /** Not needed in development. https://docs.turso.tech/local-development#sqlite */
    AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN! as string
  },
  /** S3Bucket-specific settings. */
  s3: {
    /** Application Key ID in B2 (accessKeyId in S3) */
    ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID! as string,
    /** Application Key in B2 (secretAccessKey in S3) */
    SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY! as string,
    /** Name of the bucket. */
    BUCKET_NAME: (process.env.S3_BUCKET_NAME! ?? 'solid-launch') as string,
    /** Region of the bucket. */
    REGION: process.env.S3_REGION! ?? ('us-east-1' as string),
    /** URL of the bucket. Important that this starts with http:// or https:// */
    ENDPOINT: (process.env.S3_ENDPOINT! ?? 'http://127.0.0.1:9000') as string
  }
};
