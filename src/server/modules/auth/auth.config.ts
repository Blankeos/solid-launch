type AuthConfig = {
  session: {
    /** Session expires after how many days after it's created. */
    expiresInDays: number
    /** Extend session if it expires within <renewWithinDays> days. (Should always be less than expiresInDays) */
    renewWithinDays: 3.5
  }
}

export const AUTH_CONFIG: AuthConfig = {
  session: {
    expiresInDays: 7,
    renewWithinDays: 3.5,
  },
}

// ------------------------------------------------------------------------

// Validate session configuration
const { expiresInDays, renewWithinDays } = AUTH_CONFIG.session
if (expiresInDays <= renewWithinDays) {
  throw new Error("AUTH_CONFIG.session.expiresInDays must be greater than renewWithinDays")
}
