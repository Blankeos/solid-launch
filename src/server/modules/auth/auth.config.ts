export const AUTH_CONFIG = {
  session: {
    // Session expires after how many days after it's created.
    expiresInDays: 7,
    // Extend session if it expires within <renewWithinDays> days. (Should always be less than expiresInDays)
    renewWithinDays: 3.5,
  },
}

// ------------------------------------------------------------------------

// Validate session configuration
const { expiresInDays, renewWithinDays } = AUTH_CONFIG.session
if (expiresInDays <= renewWithinDays) {
  throw new Error('AUTH_CONFIG.session.expiresInDays must be greater than renewWithinDays')
}
