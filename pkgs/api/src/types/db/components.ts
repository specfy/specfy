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

  display: {
    zIndex?: number;
    color?: string;
    backgroundColor?: string;
    vertices?: Array<{ x: number; y: number }>;
    pos: { x: number; y: number; width: number; height: number };
  };
  inComponent: string | null;
  toComponents: string[];
  fromComponents: string[];

  createdAt: string;
  updatedAt: string;
}
