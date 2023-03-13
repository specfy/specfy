import { Alert, Checkbox, Typography } from 'antd';
import type { BlockLevelZero, Blocks } from 'api/src/types/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { slugify } from '../../common/string';

import { ContentBlockDocument } from './BlockDocument';
import { ContentBlockStep } from './BlockStep';
import { ContentBlockVoteItem } from './BlockVoteItem';
import type { Payload } from './helpers';
import { map } from './helpers';
import cls from './index.module.scss';

export const ContentBlock: React.FC<{ block: Blocks; pl: Payload }> = ({
  block,
  pl,
}) => {
  // Ordered by probability
  // Paragraph
  if (block.type === 'paragraph') {
    return <p>{map(block, pl)}</p>;
  }

  // Text
  else if (block.type === 'text') {
    let text = <>{block.text}</>;
    if (block.marks) {
      for (const mark of block.marks) {
        if (mark.type === 'code')
          return <code className="inlineCode">{text}</code>;

        if (mark.type === 'bold') text = <strong>{text}</strong>;
        if (mark.type === 'italic') text = <em>{text}</em>;
        if (mark.type === 'link')
          text = (
            <a href={mark.attrs.href} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
      }
    }
    if (block.link) text = <Link to={block.link}>{text}</Link>;
    return text;
  } else if (block.type === 'hardBreak') {
    return <br />;
  }

  // Headings
  else if (block.type === 'heading') {
    const id = `h-${slugify(block.content.map((e) => e.text).join(''))}`;
    const els = map(block, pl);
    if (block.attrs.level === 1) return <h1 id={id}>{els}</h1>;
    else if (block.attrs.level === 2) return <h2 id={id}>{els}</h2>;
    else if (block.attrs.level === 3) return <h3 id={id}>{els}</h3>;
    else if (block.attrs.level === 4) return <h4 id={id}>{els}</h4>;
    else if (block.attrs.level === 5) return <h5 id={id}>{els}</h5>;
    else return <h6 id={id}>{els}</h6>;
  }

  // List Items
  else if (block.type === 'listItem') {
    return <li>{map(block, pl)}</li>;
  }
  // Bullet List
  else if (block.type === 'bulletList') {
    return <ul>{map(block, pl)}</ul>;
  }

  // Blockquote
  else if (block.type === 'blockquote') {
    return <blockquote>{map(block, pl)}</blockquote>;
  }

  // Horizontal
  else if (block.type === 'horizontalRule') {
    return <hr />;
  }

  // Task List
  else if (block.type === 'taskList') {
    return <ul className={cls.taskList}>{map(block, pl)}</ul>;
  }
  // Task Item
  else if (block.type === 'taskItem') {
    return (
      <li>
        <Checkbox checked={block.attrs.checked}>{map(block, pl)}</Checkbox>
      </li>
    );
  }

  // Image
  else if (block.type === 'image') {
    return (
      <div className={cls.image}>
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
    return <table>{map(block, pl)}</table>;
  } else if (block.type === 'tableRow') {
    return <tr>{map(block, pl)}</tr>;
  } else if (block.type === 'tableCell') {
    return <td {...block.attrs}>{map(block, pl)}</td>;
  } else if (block.type === 'tableHeader') {
    const { colwidth, ...others } = block.attrs;
    return (
      <th {...others} style={colwidth ? { width: `${colwidth}px` } : undefined}>
        {map(block, pl)}
      </th>
    );
  }

  // CodeBlock
  else if (block.type === 'codeBlock') {
    return (
      <SyntaxHighlighter
        language={block.attrs.language}
        style={a11yLight}
        wrapLines={true}
        showLineNumbers={true}
        className={cls.code}
      >
        {block.content[0].text}
      </SyntaxHighlighter>
    );
  }

  // Panel
  else if (block.type === 'panel') {
    return (
      <Alert type={block.panelType} banner description={map(block, pl)}></Alert>
    );
  }

  // Vote
  else if (block.type === 'vote') {
    return <div className={cls.vote}>{map(block, pl)}</div>;
  } else if (block.type === 'voteItem') {
    return <ContentBlockVoteItem block={block} />;
  }

  // Step
  else if (block.type === 'step') {
    return <ContentBlockStep block={block} pl={pl} />;
  }

  // Document
  else if (block.type === 'document') {
    return <ContentBlockDocument block={block} pl={pl} />;
  }

  return <div>unsupported block &quot;{JSON.stringify(block)}&quot;</div>;
};

export const ContentDoc: React.FC<{
  doc: BlockLevelZero;
  id?: string;
  pl?: Payload;
  noPlaceholder?: true;
}> = ({ doc, id, pl, noPlaceholder }) => {
  const [payload] = useState<Payload>(() => {
    return pl || { displayed: [id as string] };
  });

  console.log(doc.content);
  if (doc.content.length <= 0) {
    if (noPlaceholder) {
      return null;
    }
    return (
      <Typography.Text type="secondary">Write something...</Typography.Text>
    );
  }

  return (
    <>
      {doc.content.map((blk, i) => {
        return <ContentBlock block={blk} key={i} pl={payload} />;
      })}
    </>
  );
};
