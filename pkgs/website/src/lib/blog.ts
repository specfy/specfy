import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

export type Post = {
  id: number;
  slug: string;
  title: string;
  description: string;
  socialImage: string;
  publishedAt: string;
  filePath: string;
};

const posts: Post[] = [];

export async function initPosts() {
  const dir = path.join(process.cwd(), 'src', '_posts');
  const files = await fs.readdir(dir, 'utf8');

  const tmp: Post[] = await Promise.all(
    files.map(async (file) => {
      const fp = path.join(dir, file);
      const markdownWithMeta = await fs.readFile(fp, 'utf-8');
      const { data } = matter(markdownWithMeta);

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        socialImage: data.socialImage,
        publishedAt: data.publishedAt,
        filePath: fp,
      };
    })
  );

  posts.push(...tmp);
}

export async function getAllPosts() {
  if (posts.length <= 0) {
    await initPosts();
  }

  return posts;
}
