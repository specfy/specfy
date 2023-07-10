import fs from 'node:fs/promises';

import type { MDXProvider } from '@mdx-js/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { Bar } from 'react-chartjs-2';
import { PrismLight } from 'react-syntax-highlighter';
import dockerfile from 'react-syntax-highlighter/dist/cjs/languages/prism/docker';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { Banner } from '@/components/Banner';
import type { Post } from '@/lib/blog';
import { getAllPosts } from '@/lib/blog';

PrismLight.registerLanguage('js', js);
PrismLight.registerLanguage('ts', ts);
PrismLight.registerLanguage('dockerfile', dockerfile);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const H2: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <h2 className="text-2xl pt-16 mb-4 font-600">{children}</h2>;
};
const H3: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <h3 className="text-xl pt-8 mb-4 font-600">{children}</h3>;
};
const H4: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <h4 className="text-m pt-8 mb-4 font-600">{children}</h4>;
};
const P: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <p className="mb-4 leading-7 ">{children}</p>;
};
const Li: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <li className="ml-4">{children}</li>;
};
const Ol: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <ol className="list-decimal ml-4 mb-4">{children}</ol>;
};
const Ul: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <ol className="list-disc ml-4 mb-4">{children}</ol>;
};
const codeLanguage = /language-(\w+)/;
const Code: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const hasLanguage = codeLanguage.exec(className || '');

  if (hasLanguage) {
    return (
      <div className="codeHighlight mb-8 h-full">
        <PrismLight
          style={oneLight}
          wrapLines={true}
          showLineNumbers={true}
          language={hasLanguage[1]}
        >
          {children as string}
        </PrismLight>
      </div>
    );
  }
  return (
    <code className="px-3 py-0.5 text-xs font-mono bg-gray-100 border rounded-md">
      {children}
    </code>
  );
};
const Link: React.FC<{ children?: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => {
  return (
    <a href={href} className="text-indigo-600">
      {children}
    </a>
  );
};

const Blockquote: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <blockquote className="px-4 pt-1 pb-1 text-gray-600 border text-sm rounded-md border-[#f9f8f9] italic">
      {children}
    </blockquote>
  );
};

const Chart: React.FC<
  React.ComponentProps<typeof Bar> & { children?: React.ReactNode }
> = ({ children, ...rest }) => {
  return (
    <div className="">
      <Bar
        options={{ responsive: true, plugins: { legend: { display: false } } }}
        {...rest}
      ></Bar>
    </div>
  );
};

const components: React.ComponentProps<typeof MDXProvider>['components'] = {
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  li: Li,
  ol: Ol,
  ul: Ul,
  code: Code,
  a: Link,
  blockquote: Blockquote,
  Banner,
  ChartBar: Chart,
};

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
  return (
    <div>
      <Head>
        <title key="title">{title}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`/blog/${post.id}-${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="relative">
          <div className="mx-auto max-w-5xl py-16 min-h-screen">
            <div className="">
              <time
                dateTime={source.frontmatter.publishedAt}
                className="text-gray-500 text-xs px-1"
              >
                {source.frontmatter.publishedAt}
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

            <div className="border-t border-gray-200 pt-10 max-w-3xl">
              <MDXRemote {...source} components={components} />
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
  const mdxSource = await serialize(postFile, { parseFrontmatter: true });
  return {
    props: {
      source: mdxSource,
    },
  };
}
