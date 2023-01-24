export interface DBProject {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  description: string;
  links: DBProjectLink[];
  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  link: string;
}
