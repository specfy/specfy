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
    pos: { x: number; y: number; width: number; height: number };
  };
  edges: Array<{
    to: string;
    read: boolean;
    write: boolean;
    vertices: Array<{ x: number; y: number }>;
    portSource: 'bottom' | 'left' | 'right' | 'top';
    portTarget: 'bottom' | 'left' | 'right' | 'top';
  }>;

  inComponent: string | null;

  createdAt: string;
  updatedAt: string;
}
