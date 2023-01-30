export interface RouteOrg {
  orgId: string;
}

export type RouteProject = RouteOrg & {
  projectSlug: string;
};

export type RouteComponent = RouteProject & {
  componentSlug: string;
};

export type RouteDocument = RouteProject & {
  documentTypeId: string;
  documentSlug: string;
};
