import { GitHub, Google } from "arctic"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"

export const github = new GitHub(privateEnv.GITHUB_CLIENT_ID, privateEnv.GITHUB_CLIENT_SECRET, null)

export const google = new Google(
  privateEnv.GOOGLE_OAUTH_CLIENT_ID,
  privateEnv.GOOGLE_OAUTH_CLIENT_SECRET,
  `${publicEnv.PUBLIC_BASE_URL}/api/auth/login/google/callback`
)
