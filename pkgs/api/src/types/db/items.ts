export interface DBItem {
  id: string;
  type: 'component' | 'group';
  name: string;
  slug: string;
  in: string | null;
  linkedTo: string[];
  display: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}
