import type { BlockLevelZero, Blocks, MarkDiff } from '@specfy/models';
import { IconArrowBack } from '@tabler/icons-react';
import classnames from 'classnames';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Payload } from '../../common/content';
import { map } from '../../common/content';
import { slugify } from '../../common/string';
import { Banner } from '../Banner';
import { Checkbox } from '../Form/Checkbox';
import clsDiff from '../Revision/DiffCard/index.module.scss';

import { BlockCode } from './BlockCode';
import { ContentBlockDocument } from './BlockDocument';
import { ContentBlockStep } from './BlockStep';
import { ContentBlockVoteItem } from './BlockVoteItem';
import cls from './index.module.scss';

import { useAuth } from '@/hooks/useAuth';

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
        continue;
      }

      if (mark.type === 'code') {
        return <code className={cls.inlineCode}>{text}</code>;
      }

      if (mark.type === 'bold') {
        text = <strong>{text}</strong>;
      } else if (mark.type === 'italic') {
        text = <em>{text}</em>;
      } else if (mark.type === 'link') {
        if (
          new URL(mark.attrs.href, window.location.href).host ===
          window.location.host
        ) {
          // react-router-dom does not compute ./ correctly it tries to add "./link" to the current path instead of removing the last filename
          text = (
            <Link
              to={
                mark.attrs.href.startsWith('./')
                  ? `.${mark.attrs.href}`
                  : mark.attrs.href
              }
              onClick={(e) => {
                if (mark.attrs.href.startsWith('#')) {
                  e.preventDefault();
                  const id = mark.attrs.href.substring(1);
                  const target = document.getElementById(id);
                  if (!target) {
                    return;
                  }

                  target.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => {
                    // Should probably update state instead
                    window.location.hash = id;
                  }, 500);
                }
              }}
            >
              {text}
            </Link>
          );
        } else {
          text = (
            <a href={mark.attrs.href} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
        }
      } else {
        console.warn('Unknown mark', JSON.stringify(mark));
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
    if (block.content.length > 0 && block.content[0].type === 'tableHeader') {
      return (
        <thead>
          <tr className={stl}>{map(block, pl)}</tr>
        </thead>
      );
    }
    return <tr className={stl}>{map(block, pl)}</tr>;
  } else if (block.type === 'tableCell') {
    const { rowspan, colspan, ...others } = block.attrs;
    return (
      <td className={stl} colSpan={colspan} rowSpan={rowspan} {...others}>
        {map(block, pl)}
      </td>
    );
  } else if (block.type === 'tableHeader') {
    const { colwidth, rowspan, colspan, ...others } = block.attrs;
    return (
      <th
        className={stl}
        colSpan={colspan}
        rowSpan={rowspan}
        {...others}
        style={colwidth ? { width: `${colwidth}px` } : undefined}
      >
        {map(block, pl)}
      </th>
    );
  }

  // CodeBlock
  else if (block.type === 'codeBlock') {
    return (
      <div className={classnames(stl, cls.mb)}>
        <BlockCode block={block} />
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

export const Presentation: React.FC<{
  children: React.ReactNode;
  size?: 'm' | 'l';
}> = ({ children, size = 'm' }) => {
  return <div className={classnames(cls.content, cls[size])}>{children}</div>;
};

export const Placeholder: React.FC<{ text?: string }> = ({ text }) => {
  const { currentPerm } = useAuth();

  return (
    <div className={cls.placeholder}>
      {currentPerm?.role === 'viewer' ? '' : text ?? 'Write something...'}
    </div>
  );
};

export const ContentDoc: React.FC<{
  doc: BlockLevelZero;
  id?: string;
  pl?: Payload;
  placeholder?: React.ReactNode;
}> = ({ doc, id, pl, placeholder }) => {
  const [payload] = useState<Payload>(() => {
    return pl || { displayed: [id!] };
  });

  if (doc.content.length <= 0) {
    return placeholder;
  }

  return (
    <>
      {doc.content.map((blk, i) => {
        return <ContentBlock block={blk} key={i} pl={payload} />;
      })}
    </>
  );
};
