export interface DBProject {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  links: Array<{ title: string; link: string }>;
  createdAt: string;
  updatedAt: string;
}
