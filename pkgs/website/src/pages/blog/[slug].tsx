import fs from 'node:fs/promises';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import type { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { PrismLight } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import dockerfile from 'react-syntax-highlighter/dist/cjs/languages/prism/docker';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';

import { mdxComponents } from '@/components/Blog';
import type { Post } from '@/lib/blog';
import { getAllPosts } from '@/lib/blog';

PrismLight.registerLanguage('js', js);
PrismLight.registerLanguage('ts', ts);
PrismLight.registerLanguage('dockerfile', dockerfile);
PrismLight.registerLanguage('bash', bash);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  source: {
    frontmatter: Post;
    compiledSource: any;
    scope: any;
  };
};

export default function PostPage({ source }: Props) {
  const post = source.frontmatter;
  const title = `${post.title} - Specfy`;
  const date = dayjs(post.publishedAt);
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: [`https://specfy.io/${post.slug}.png`],
    datePublished: date.toISOString(),
    author: [
      {
        '@type': 'Person',
        name: 'Samuel Bodin',
        url: 'https://www.linkedin.com/in/bodinsamuel/',
      },
    ],
  };

  return (
    <div>
      <Head>
        <title key="title">{title}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`/blog/${post.id}-${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Specfy" />
        <meta property="og:image" content={ldJson.image[0]} />
        <meta name="twitter:image:src" content={ldJson.image[0]} />
      </Head>
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="relative">
          <div className="mx-auto max-w-5xl py-16 min-h-screen">
            <div className="">
              <time
                dateTime={source.frontmatter.publishedAt}
                className="text-gray-500 text-xs px-1"
              >
                {date.format('MMM DD, YYYY')}
              </time>
            </div>

            <h1 className="text-[56px]">{source.frontmatter.title}</h1>

            <div className="relative mt-2 mb-8 flex items-center gap-x-4 px-1">
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

            <div className="border-t border-gray-200 pt-10 max-w-4xl">
              <MDXRemote {...source} components={mdxComponents} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => {
      return `/blog/${post.id}-${post.slug}`;
    }),
    fallback: false,
  };
}

export async function getStaticProps(
  ctx: GetStaticPropsContext<{
    slug: string;
  }>
) {
  const { slug } = ctx.params!;
  const id = parseInt(slug.split('-', 1)[0], 10);

  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return {
      notFound: true,
    };
  }

  // retrieve the MDX blog post file associated
  // with the specified slug parameter
  const postFile = await fs.readFile(post.filePath);

  // read the MDX serialized content along with the frontmatter
  // from the .mdx blog post file
  const mdxSource = await serialize(postFile, {
    parseFrontmatter: true,
    mdxOptions: {},
  });
  return {
    props: {
      source: mdxSource,
    },
  };
}
