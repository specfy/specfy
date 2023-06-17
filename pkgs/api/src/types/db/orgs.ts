export interface DBOrg {
  id: string;
  name: string;
  isPersonal: boolean;
  avatarUrl: string | null;
  acronym: string;
  color: string;

  createdAt: string;
  updatedAt: string;
}
