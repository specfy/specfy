export interface DBAccount {
  id: string;
  userId: string;

  type: 'credentials' | 'email' | 'oauth' | 'oidc';
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  tokenType: string | null;
  scope: string;
  idToken: string | null;
  sessionState: string | null;

  expiresAt: number | null;
}
