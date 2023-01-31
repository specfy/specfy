export interface RouteOrg {
  org_id: string;
}

export type RouteProject = RouteOrg & {
  project_slug: string;
};

export type RouteTech = RouteProject & {
  tech_slug: string;
};

export type RouteComponent = RouteProject & {
  component_slug: string;
};

export type RouteDocument = RouteProject & {
  document_type_id: string;
  document_slug: string;
};
