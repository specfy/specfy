export interface Org {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Me {
  id: string;
  name: string;
  email: string;
  orgs: Org[];
  createdAt: string;
  updatedAt: string;
}
