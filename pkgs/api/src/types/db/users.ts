export interface DBUser {
  id: string;
  name: string;
  email: string;

  emailVerified: string | null;
  avatarUrl: string | null;

  createdAt: string;
  updatedAt: string;
}
