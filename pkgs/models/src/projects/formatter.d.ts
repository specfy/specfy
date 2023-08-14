import type { Projects } from '@specfy/db';
import type { ApiProject, ListProjects } from '../projects';
export declare function toApiProject(proj: Projects): ApiProject;
export declare function toApiProjectList(proj: Projects & {
    _count: {
        Perms: number;
    };
}): ListProjects['Success']['data'][0];
