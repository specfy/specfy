import { db } from '../common/db';
import type { DBContent } from '../types/db/contents';

export async function listContents(where: {
  orgId: string;
  projectSlug?: string;
}): Promise<DBContent[]> {
  return await db.contents.where(where).limit(5).toArray();
}

export async function getContent(
  contentId: string
): Promise<DBContent | undefined> {
  return await db.contents.get(contentId);
}
