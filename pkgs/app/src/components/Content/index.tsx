import type { BlockLevelZero, Blocks, MarkDiff } from '@specfy/models';
import { IconArrowBack } from '@tabler/icons-react';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import { Diff, Hunk, tokenize, markEdits } from 'react-diff-view';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'react-diff-view/style/index.css';
import { refractor } from 'refractor';

import type { Payload } from '../../common/content';
import { map } from '../../common/content';
import { slugify } from '../../common/string';
import { Banner } from '../Banner';
import { Checkbox } from '../Form/Checkbox';
import clsDiff from '../Revision/DiffCard/index.module.scss';

import { ContentBlockDocument } from './BlockDocument';
import { ContentBlockStep } from './BlockStep';
import { ContentBlockVoteItem } from './BlockVoteItem';
import cls from './index.module.scss';

function styleDiff(block: Blocks): string {
  if (!block.marks || block.marks.length <= 0) {
    return '';
  }

  const diffMark = block.marks.find((mark) => mark.type === 'diffMark') as
    | MarkDiff
    | undefined;
  if (!diffMark) {
    return '';
  }

  if (diffMark.attrs.type === 'added') {
    return clsDiff.added;
  }
  if (diffMark.attrs.type === 'removed') {
    return clsDiff.removed;
  }

  return '';
}

export const ContentBlock: React.FC<{
  block: Blocks;
  pl: Payload;
}> = ({ block, pl }) => {
  const stl = styleDiff(block);

  // --- Ordered by ~ probability

  // Paragraph
  if (block.type === 'paragraph') {
    return <p className={stl}>{map(block, pl)}</p>;
  }

  // Text
  else if (block.type === 'text') {
    let text = <>{block.text}</>;
    if (!block.marks) {
      return text;
    }

    for (const mark of block.marks) {
      if (mark.type === 'diffMark') {
        if (mark.attrs.type === 'added') {
          text = (
            <span className={classnames(clsDiff.added, clsDiff.inline)}>
              {text}
            </span>
          );
        } else if (mark.attrs.type === 'formatting') {
          text = (
            <span className={classnames(clsDiff.formatting, clsDiff.inline)}>
              {text}
            </span>
          );
        } else {
          text = (
            <span className={classnames(clsDiff.removed, clsDiff.inline)}>
              {text}
            </span>
          );
        }
      }

      if (mark.type === 'code') {
        return <code className={cls.inlineCode}>{text}</code>;
      }

      if (mark.type === 'bold') {
        text = <strong>{text}</strong>;
      } else if (mark.type === 'italic') {
        text = <em>{text}</em>;
      } else if (mark.type === 'link') {
        text = (
          <a href={mark.attrs.href} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      } else {
        console.warn('Unknown mark', mark.type);
      }
    }
    return text;
  } else if (block.type === 'hardBreak') {
    return (
      <>
        {stl && (
          <span className={classnames(stl, clsDiff.inline)}>
            <IconArrowBack />
          </span>
        )}
        <br className={stl} />
      </>
    );
  }

  // Headings
  else if (block.type === 'heading') {
    if (!block.content || block.content.length === 0) {
      return null;
    }
    const id = `h-${slugify(block.content.map((e) => e.text).join(''))}`;
    const els = map(block, pl);
    if (block.attrs.level === 1)
      return (
        <h1 id={id} className={stl}>
          {els}
        </h1>
      );
    else if (block.attrs.level === 2)
      return (
        <h2 id={id} className={stl}>
          {els}
        </h2>
      );
    else if (block.attrs.level === 3)
      return (
        <h3 id={id} className={stl}>
          {els}
        </h3>
      );
    else if (block.attrs.level === 4)
      return (
        <h4 id={id} className={stl}>
          {els}
        </h4>
      );
    else if (block.attrs.level === 5)
      return (
        <h5 id={id} className={stl}>
          {els}
        </h5>
      );
    else
      return (
        <h6 id={id} className={stl}>
          {els}
        </h6>
      );
  }

  // List Items
  else if (block.type === 'listItem') {
    return <li className={stl}>{map(block, pl)}</li>;
  }
  // Bullet List
  else if (block.type === 'bulletList') {
    return <ul className={stl}>{map(block, pl)}</ul>;
  }
  // Ordered list
  else if (block.type === 'orderedList') {
    return <ol className={stl}>{map(block, pl)}</ol>;
  }

  // Blockquote
  else if (block.type === 'blockquote') {
    return (
      <div className={stl}>
        <blockquote>{map(block, pl)}</blockquote>
      </div>
    );
  }

  // Task List
  else if (block.type === 'taskList') {
    return <ul className={classnames(cls.taskList, stl)}>{map(block, pl)}</ul>;
  }
  // Task Item
  else if (block.type === 'taskItem') {
    return (
      <li className={stl}>
        <Checkbox checked={block.attrs.checked} />
        {map(block, pl)}
      </li>
    );
  }

  // Image
  else if (block.type === 'image') {
    return (
      <div className={classnames(cls.image, stl)}>
        <img
          src={block.attrs.src}
          alt={block.attrs.alt || ''}
          title={block.attrs.title || ''}
        />
      </div>
    );
  }

  // Table
  else if (block.type === 'table') {
    return <table className={stl}>{map(block, pl)}</table>;
  } else if (block.type === 'tableRow') {
    return <tr className={stl}>{map(block, pl)}</tr>;
  } else if (block.type === 'tableCell') {
    return (
      <td className={stl} {...block.attrs}>
        {map(block, pl)}
      </td>
    );
  } else if (block.type === 'tableHeader') {
    const { colwidth, ...others } = block.attrs;
    return (
      <th
        className={stl}
        {...others}
        style={colwidth ? { width: `${colwidth}px` } : undefined}
      >
        {map(block, pl)}
      </th>
    );
  }

  // CodeBlock
  else if (block.type === 'codeBlock') {
    if (block.codeDiff) {
      const tokens = useMemo(() => {
        return tokenize(block.codeDiff.hunks, {
          highlight: true,
          refractor,
          // language: block.attrs.language,
          language: 'js',
          enhancers: [markEdits(block.codeDiff.hunks, { type: 'block' })],
        });
      }, [block.attrs.uid]);

      return (
        <div className={cls.codeDiff}>
          <Diff
            diffType="modify"
            hunks={block.codeDiff.hunks}
            viewType="unified"
            tokens={tokens}
          >
            {(hunks) =>
              hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
            }
          </Diff>
        </div>
      );
    }

    return (
      <div className={stl}>
        <PrismAsyncLight
          language={block.attrs.language}
          style={prism}
          wrapLines={true}
          showLineNumbers={false}
          className={cls.code}
        >
          {block.content?.[0].text}
        </PrismAsyncLight>
      </div>
    );
  }

  // Banner
  else if (block.type === 'banner') {
    return (
      <div className={classnames(stl, cls.mb)}>
        <Banner type={block.attrs.type}>{map(block, pl)}</Banner>
      </div>
    );
  }

  // Horizontal
  else if (block.type === 'horizontalRule') {
    return <hr />;
  }

  // Vote
  else if (block.type === 'vote') {
    return <div className={classnames(cls.vote, stl)}>{map(block, pl)}</div>;
  } else if (block.type === 'voteItem') {
    return (
      <div className={stl}>
        <ContentBlockVoteItem block={block} pl={pl} />
      </div>
    );
  }

  // Step
  else if (block.type === 'step') {
    return (
      <div className={stl}>
        <ContentBlockStep block={block} pl={pl} />
      </div>
    );
  }

  // Document
  else if (block.type === 'blockDocument') {
    return (
      <div className={stl}>
        <ContentBlockDocument block={block} pl={pl} />
      </div>
    );
  }

  return <div>unsupported block &quot;{JSON.stringify(block)}&quot;</div>;
};

export const Presentation: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className={cls.content}>{children}</div>;
};

export const ContentDoc: React.FC<{
  doc: BlockLevelZero;
  id?: string;
  pl?: Payload;
  noPlaceholder?: true;
}> = ({ doc, id, pl, noPlaceholder }) => {
  const [payload] = useState<Payload>(() => {
    return pl || { displayed: [id!] };
  });

  if (doc.content.length <= 0) {
    if (noPlaceholder) {
      return null;
    }
    return <div className={cls.placeholder}>Write something ...</div>;
  }

  return (
    <Presentation>
      {doc.content.map((blk, i) => {
        return <ContentBlock block={blk} key={i} pl={payload} />;
      })}
    </Presentation>
  );
};
