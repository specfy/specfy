export interface ApiProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  links: Array<{ title: string; link: string }>;
  author: string;
  owners: string[];
  reviewers: string[];
  contributors: string[];
  createdAt: string;
  updatedAt: string;
}
