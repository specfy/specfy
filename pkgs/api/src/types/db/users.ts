export interface DBUser {
  id: string;
  name: string;
  email: string;

  emailVerified: string | null;

  createdAt: string;
  updatedAt: string;
}
