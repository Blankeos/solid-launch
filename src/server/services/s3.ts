import { privateEnv } from '@/env.private';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ===========================================================================
// Client
// ===========================================================================

/** The new AWS-SDK V3 JavaScript SDK */
export const s3Client = new S3Client({
  endpoint: privateEnv.S3_ENDPOINT,
  region: privateEnv.S3_REGION,
  credentials: {
    accessKeyId: privateEnv.S3_ACCESS_KEY_ID,
    secretAccessKey: privateEnv.S3_SECRET_ACCESS_KEY,
  },
});

// ===========================================================================
// Methods
// ===========================================================================

/**
 * Source:
 * - https://chatwithcloud.ai/aws-practical-examples/create-presigned-s3-url-for-uploading-using-aws-sdk-v3-for-js-and-ts
 * - https://stackoverflow.com/questions/54064149/adding-content-encoding-header-to-signed-url-uploaded-files
 */
export async function generateUploadUrl(uniqueId: string) {
  //  Been having issues with Put:
  const command = new PutObjectCommand({
    Bucket: privateEnv.S3_BUCKET_NAME,
    Key: `temp/${uniqueId}`,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    signedUrl: signedUrl,
    /**
     * Fields won't be used because it's for POST. Now we found that
     * BackBlaze can't do POST for some reason.
     */
    fields: [],
  };
}

export async function transferFileFromTempToPermanent(uniqueId: string) {
  const oldKey = `temp/${uniqueId}`;
  const newKey = `permanent/${uniqueId}`;

  console.log('[transferFileFromtempToPermanent] Transferring', oldKey, 'to', newKey);

  // Copy the object to the new location.
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: privateEnv.S3_BUCKET_NAME,
      CopySource: `${privateEnv.S3_BUCKET_NAME}/${oldKey}`,
      Key: newKey,
    })
  );

  console.log('[transferFileFromTempToPermanent] Deleting', oldKey);
  // Delete from old location.
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: privateEnv.S3_BUCKET_NAME,
      Key: oldKey,
    })
  );
}

export async function getImageUrlFromImageObjKey(imageObjKey: string) {
  try {
    // Create the command.
    const command = new GetObjectCommand({
      Bucket: privateEnv.S3_BUCKET_NAME,
      /** Assumes that this image is already permanent. */
      Key: `permanent/${imageObjKey}`,
    });

    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return signedUrl;
  } catch (err) {
    console.log('Error creating presigned URL', err);
  }
  return null;
}
