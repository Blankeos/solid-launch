import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createId } from "@paralleldrive/cuid2"
import { privateEnv } from "@/env.private"

const _s3Client = new S3Client({
  endpoint: privateEnv.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: privateEnv.S3_ACCESS_KEY_ID,
    secretAccessKey: privateEnv.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

/** Wrapped a bunch of QoLs in this extensible class. */
class S3CustomClient {
  generateUniqueId() {
    return createId()
  }

  async generateUploadUrl(destinationObjectKey: string) {
    const command = new PutObjectCommand({
      Bucket: privateEnv.S3_BUCKET_NAME,
      Key: destinationObjectKey,
    })

    const signedUrl = await getSignedUrl(_s3Client, command, {
      expiresIn: 900,
    }) // 15 minutes

    return {
      signedUrl: signedUrl,
      fields: [], // I personally don't know what this is for lol.
    }
  }

  async getSignedUrlFromKey(
    objectKey: string,
    opts: {
      /** @defaultValue 86400s = 24 hrs */
      expiresIn?: number
    } = {}
  ) {
    const { expiresIn = 86400 } = opts

    try {
      const command = new GetObjectCommand({
        Bucket: privateEnv.S3_BUCKET_NAME,
        Key: objectKey,
      })

      const signedUrl = await getSignedUrl(_s3Client, command, {
        expiresIn,
      })

      return signedUrl
    } catch (err) {
      console.error("Error creating presigned URL", err)
    }

    return null
  }

  async deleteObject(objectKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: privateEnv.S3_BUCKET_NAME,
        Key: objectKey,
      })
      await _s3Client.send(command)
    } catch (err) {
      console.error("Error deleting object", err)
      throw err
    }
  }

  /**
   * Check if a signed URL is expired
   * @param signedUrl - The signed URL to check
   * @param bufferMinutes - Safety buffer in minutes (default: 5)
   * @returns true if expired or invalid, false if still valid
   */
  isSignedUrlExpired(signedUrl: string, bufferMinutes: number = 5): boolean {
    try {
      const url = new URL(signedUrl)

      // For AWS S3/R2 signed URLs, expiration is in 'X-Amz-Expires' and 'X-Amz-Date' params
      const expires = url.searchParams.get("X-Amz-Expires") // Duration in seconds
      const date = url.searchParams.get("X-Amz-Date") // Start time (ISO format)

      if (!expires || !date) {
        console.warn("URL missing expiration parameters")
        return true // Assume expired if we can't determine
      }

      // Parse the date (format: 20240821T120000Z)
      const startTime = new Date(
        date.slice(0, 4) +
          "-" +
          date.slice(4, 6) +
          "-" +
          date.slice(6, 8) +
          "T" +
          date.slice(9, 11) +
          ":" +
          date.slice(11, 13) +
          ":" +
          date.slice(13, 15) +
          "Z"
      )

      // Calculate expiration time
      const expirationTime = new Date(startTime.getTime() + parseInt(expires, 10) * 1000)

      // Check if expired (with buffer for safety)
      const now = new Date()
      const bufferTime = bufferMinutes * 60 * 1000 // Convert minutes to milliseconds

      return now.getTime() > expirationTime.getTime() - bufferTime
    } catch (error) {
      console.error("Error parsing signed URL:", error)
      return true // Assume expired if parsing fails
    }
  }

  /**
   * Get remaining time until URL expires
   * @param signedUrl - The signed URL to check
   * @returns remaining time in milliseconds, or 0 if expired/invalid
   */
  getUrlRemainingTime(signedUrl: string): number {
    try {
      const url = new URL(signedUrl)
      const expires = url.searchParams.get("X-Amz-Expires")
      const date = url.searchParams.get("X-Amz-Date")

      if (!expires || !date) {
        return 0
      }

      const startTime = new Date(
        date.slice(0, 4) +
          "-" +
          date.slice(4, 6) +
          "-" +
          date.slice(6, 8) +
          "T" +
          date.slice(9, 11) +
          ":" +
          date.slice(11, 13) +
          ":" +
          date.slice(13, 15) +
          "Z"
      )

      const expirationTime = new Date(startTime.getTime() + parseInt(expires, 10) * 1000)
      const remainingTime = expirationTime.getTime() - Date.now()

      return Math.max(0, remainingTime)
    } catch (error) {
      console.error("Error calculating remaining time:", error)
      return 0
    }
  }
}

export const s3Client = new S3CustomClient()
