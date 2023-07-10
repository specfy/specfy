import Head from 'next/head';

import type { Post } from '@/lib/blog';
import { getAllPosts } from '@/lib/blog';

type Props = {
  posts: Post[];
};

export default function Blog({ posts }: Props) {
  return (
    <main className="relative isolate px-6 pt-14 lg:px-8">
      <Head>
        <title key="title">Blog - Specfy</title>
        <meta name="description" content="Specfy.io blog" />
        <link rel="canonical" href={`/blog`} />
      </Head>
      <div className="relative">
        <div className="mx-auto max-w-5xl py-16 min-h-screen">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-xl">
              Blog
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => {
              return (
                <div key={post.slug} className="">
                  <h2 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <a href={`/blog/${post.id}-${post.slug}`}>{post.title}</a>
                  </h2>
                  <time
                    dateTime={post.publishedAt}
                    className="text-gray-500 text-xs"
                  >
                    {post.publishedAt}
                  </time>
                  <div className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {post.description}
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <img
                      src="https://avatars.githubusercontent.com/u/1637651?v=4"
                      alt=""
                      className="h-8 w-8 rounded-full bg-gray-50"
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <a href="#">
                          <span className="absolute inset-0"></span>
                          Samuel Bodin
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps() {
  return {
    props: {
      posts: await getAllPosts(),
    },
  };
}
