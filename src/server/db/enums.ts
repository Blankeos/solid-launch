export const OAuthProviderId = {
  GOOGLE: 'GOOGLE',
} as const
export type OAuthProviderId = (typeof OAuthProviderId)[keyof typeof OAuthProviderId]
