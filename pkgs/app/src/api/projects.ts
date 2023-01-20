import { db } from '../common/db';
import { getRandomID, slugify } from '../common/string';
import type { ApiMe } from '../types/api/me';
import type { ApiProject } from '../types/api/projects';
import type { DBProject } from '../types/db/projects';

export async function createProject(
  data: Pick<ApiProject, 'description' | 'name'>,
  { author }: { author: ApiMe }
) {
  const id = getRandomID();
  const slug = slugify(data.name);
  await db.projects.add(
    {
      id,
      orgId: 'algolia',
      name: data.name,
      slug,
      description: data.description,
      author: author.id,
      links: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    id
  );

  return { id, slug };
}

export async function listProjects(): Promise<DBProject[]> {
  return await db.projects.limit(5).toArray();
}

export async function getProject(id: string): Promise<DBProject | undefined> {
  return await db.projects.get(id);
}
