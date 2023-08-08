import type { MDXProvider } from '@mdx-js/react';
import { IconArrowDown } from '@tabler/icons-react';
import classNames from 'classnames';
import type { MDXContent } from 'mdx/types';
import { Bar } from 'react-chartjs-2';
import { PrismLight } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import slugifyOrigin from 'slugify';

import { Banner } from '@/components/Banner';

export const slugify = (str: string) => {
  return slugifyOrigin(str, { lower: true, trim: true, strict: true });
};

const H2 = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const hash = `#h-${slugify(children as string)}`;
  return (
    <h2 className="group text-2xl pt-16 mb-4 font-600" id={hash}>
      <a
        href={`${hash}`}
        className="opacity-0 pr-2 -ml-5 text-gray-600 hover:text-gray-800 group-hover:opacity-100 transition-all"
      >
        §
      </a>
      {children}
    </h2>
  );
};

const H3 = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const hash = `#h-${slugify(children as string)}`;

  return (
    <h3 className="group text-xl pt-8 mb-4 font-600" id={hash}>
      <a
        href={`${hash}`}
        className="opacity-0 pr-2 -ml-5 text-gray-600 hover:text-gray-800 group-hover:opacity-100 transition-all"
      >
        §
      </a>
      {children}
    </h3>
  );
};

const H4 = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  const hash = `#h-${slugify(children as string)}`;

  return (
    <h4 className="group text-m pt-8 mb-4 font-600" id={hash}>
      <a
        href={`${hash}`}
        className="opacity-0 pr-2 -ml-5 text-gray-600 hover:text-gray-800 group-hover:opacity-100 transition-all"
      >
        §
      </a>
      {children}
    </h4>
  );
};

const P = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  return <p className="mb-4 leading-7 ">{children}</p>;
};

const Li = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  return <li className="ml-4">{children}</li>;
};

const Ol = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  return <ol className="list-decimal ml-4 mb-4">{children}</ol>;
};

const Ul = ({ children }: { children?: React.ReactNode }): JSX.Element => {
  return <ol className="list-disc ml-4 mb-4">{children}</ol>;
};

const codeLanguage = /language-(\w+)/;
const Code = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}): JSX.Element => {
  const hasLanguage = codeLanguage.exec(className || '');

  if (hasLanguage) {
    return (
      <div className="codeHighlight mb-8 h-full">
        <PrismLight
          style={oneLight}
          wrapLines={true}
          showLineNumbers={false}
          language={hasLanguage[1]}
        >
          {children as string}
        </PrismLight>
      </div>
    );
  }
  return (
    <code className="px-3 py-0.5 text-xs font-mono bg-gray-100 border rounded-md ">
      {children}
    </code>
  );
};

const Link = ({
  children,
  href,
}: {
  children?: React.ReactNode;
  href?: string;
}): JSX.Element => {
  return (
    <a href={href} className="text-indigo-600">
      {children}
    </a>
  );
};

const Blockquote = ({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element => {
  return (
    <blockquote className="px-4 pt-1 pb-1 text-gray-600 border text-sm rounded-md border-[#f9f8f9] italic">
      {children}
    </blockquote>
  );
};

const Chart = ({
  children,
  ...rest
}: React.ComponentProps<typeof Bar> & {
  children?: React.ReactNode;
}): JSX.Element => {
  return (
    <div className="">
      <Bar
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          datasets: { bar: { barThickness: 20 } },
          elements: { bar: { borderWidth: 2, borderColor: 'transparent' } },
          scales: {
            x: {
              grid: {
                color: 'transparent',
              },
              ticks: {
                color: 'hsl(255 3.7% 78.8%)',
              },
            },
            y: {
              grid: {
                color: 'hsl(255 3.7% 93.8%)',
              },
              ticks: {
                color: 'hsl(255 3.7% 85.8%)',
              },
            },
          },
        }}
        {...rest}
      ></Bar>
    </div>
  );
};

const Stats = ({
  from,
  to,
  label,
  pct,
  good,
}: {
  from: string;
  label: string;
  to?: string;
  pct?: string;
  good?: true;
}): JSX.Element => {
  return (
    <div className="py-4 px-5 border rounded min-w-[200px]">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="flex justify-between gap-2">
        <div className="inline-flex text-indigo-600 items-center gap-2">
          {!to && <div>{from}</div>}
          {to && (
            <>
              {to}
              <div className="text-sm text-gray-300">from {from}</div>
            </>
          )}
        </div>
        {pct && (
          <div
            className={classNames(
              'text-xs inline-flex rounded-md px-2 grow-0 items-center h-[25px]',
              good && 'bg-emerald-100 text-emerald-700'
            )}
          >
            <IconArrowDown className="w-3" />
            {pct}%
          </div>
        )}
      </div>
    </div>
  );
};

export const mdxComponents: React.ComponentProps<
  typeof MDXProvider
>['components'] = {
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
  Banner: Banner as MDXContent,
  ChartBar: Chart,
  Stats,
};
