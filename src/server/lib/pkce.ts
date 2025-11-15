// PKCE Utilities
// Works in NativeScript, React Native, Browser, Node.
// But actually considering the Buffer and btoa here, just polyfill it in NativeScript (v8)

/** Used in client only. */
export function generateCodeVerifier(length = 64): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  return Array.from(array, (v) => chars[v % chars.length]).join("")
}

/** Used in client and server. */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(new Uint8Array(hashBuffer))
}

/** Used in server only. */
export async function verifyCodeVerifier(
  codeVerifier: string,
  expectedChallenge: string
): Promise<boolean> {
  const actual = await generateCodeChallenge(codeVerifier)
  return actual === expectedChallenge
}

// ---------------------------------------------------------------------
// Base64URL encoder (NO Buffer, NO btoa) → works everywhere including NativeScript
// ---------------------------------------------------------------------

const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function base64Encode(bytes: Uint8Array): string {
  let result = ""
  let i: number

  for (i = 0; i + 2 < bytes.length; i += 3) {
    const combined = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    result += base64Alphabet[(combined >> 18) & 63]
    result += base64Alphabet[(combined >> 12) & 63]
    result += base64Alphabet[(combined >> 6) & 63]
    result += base64Alphabet[combined & 63]
  }

  if (i < bytes.length) {
    let combined = bytes[i] << 16
    let padding = ""

    if (i + 1 < bytes.length) {
      combined |= bytes[i + 1] << 8
      padding = "="
    } else {
      padding = "=="
    }

    result += base64Alphabet[(combined >> 18) & 63]
    result += base64Alphabet[(combined >> 12) & 63]
    result += padding === "==" ? "==" : base64Alphabet[(combined >> 6) & 63]
    result += padding === "=" ? "=" : ""
  }

  return result
}

function base64UrlEncode(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
