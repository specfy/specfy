export interface DBComponent {
  id: string;
  orgId: string;
  projectId: string;

  type: 'component' | 'hosting' | 'project' | 'thirdparty';
  typeId: string | null;

  name: string;
  slug: string;
  description: string | null;
  tech: string[] | null;

  display: Record<string, any>;
  inComponent: string | null;
  toComponents: string[];
  fromComponents: string[];

  createdAt: string;
  updatedAt: string;
}
