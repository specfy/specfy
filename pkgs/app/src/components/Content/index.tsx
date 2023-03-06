import {
  IconHeartFilled,
  IconThumbDown,
  IconThumbUp,
} from '@tabler/icons-react';
import { Alert, Avatar, Checkbox, Typography } from 'antd';
import type {
  BlockLevelZero,
  Blocks,
  BlocksWithContent,
} from 'api/src/types/api';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import { slugify } from '../../common/string';
import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const ContentBlock: React.FC<{ block: Blocks }> = ({ block }) => {
  // Ordered by probability
  // Paragraph
  if (block.type === 'paragraph') {
    return <p>{map(block)}</p>;
  }

  // Text
  else if (block.type === 'text') {
    let text = <>{block.text}</>;
    if (block.marks) {
      for (const mark of block.marks) {
        if (mark.type === 'code') return <code>{text}</code>;

        if (mark.type === 'bold') text = <strong>{text}</strong>;
        if (mark.type === 'italic') text = <em>{text}</em>;
        if (mark.type === 'link')
          text = (
            <a href={mark.attrs.href} target="_blank" rel="noreferrer">
              {text}
            </a>
          );
      }
      // if (block.style.code) text = <code>{text}</code>;
    }
    if (block.link) text = <Link to={block.link}>{text}</Link>;
    return text;
  } else if (block.type === 'hardBreak') {
    return <br />;
  }

  // Headings
  else if (block.type === 'heading') {
    const id = `h-${slugify(block.content.map((e) => e.text).join(''))}`;
    const els = map(block);
    if (block.attrs.level === 1) return <h1 id={id}>{els}</h1>;
    else if (block.attrs.level === 2) return <h2 id={id}>{els}</h2>;
    else if (block.attrs.level === 3) return <h3 id={id}>{els}</h3>;
    else if (block.attrs.level === 4) return <h4 id={id}>{els}</h4>;
    else if (block.attrs.level === 5) return <h5 id={id}>{els}</h5>;
    else return <h6 id={id}>{els}</h6>;
  }

  // List Items
  else if (block.type === 'listItem') {
    return <li>{map(block)}</li>;
  }
  // Bullet List
  else if (block.type === 'bulletList') {
    return <ul>{map(block)}</ul>;
  }

  // Blockquote
  else if (block.type === 'blockquote') {
    return <blockquote>{map(block)}</blockquote>;
  }

  // Horizontal
  else if (block.type === 'horizontalRule') {
    return <hr />;
  }

  // Task List
  else if (block.type === 'taskList') {
    return <ul className={cls.taskList}>{map(block)}</ul>;
  }
  // Task Item
  else if (block.type === 'taskItem') {
    return (
      <li>
        <Checkbox checked={block.attrs.checked}>{map(block)}</Checkbox>
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
    return <table>{map(block)}</table>;
  } else if (block.type === 'tableRow') {
    return <tr>{map(block)}</tr>;
  } else if (block.type === 'tableCell') {
    return <td {...block.attrs}>{map(block)}</td>;
  } else if (block.type === 'tableHeader') {
    const { colwidth, ...others } = block.attrs;
    return (
      <th {...others} style={colwidth ? { width: `${colwidth}px` } : undefined}>
        {map(block)}
      </th>
    );
  }

  // Panel
  else if (block.type === 'panel') {
    return (
      <Alert
        type={block.panelType}
        banner
        description={block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      ></Alert>
    );
  }

  // Vote
  else if (block.type === 'vote') {
    return <div className={cls.vote}>{map(block)}</div>;
  } else if (block.type === 'voteItem') {
    const accepted = block.voteChoice === '1';
    return (
      <div
        className={classnames(
          cls.voteItem,
          accepted ? cls.voteAccepted : cls.voteRejected
        )}
      >
        <div className={cls.voteHeader}>
          <div className={cls.voteLabel}>
            {accepted && (
              <div className={cls.voteResult}>
                <IconHeartFilled />
                Accepted
              </div>
            )}
            {!accepted && (
              <div className={cls.voteResult}>
                <IconThumbDown />
                Rejected
              </div>
            )}
            Solution
            {block.voteChoice}
          </div>
          <div>
            <Avatar.Group>
              {['Samuel Bodin', 'Raphael Da', 'Nico Tore'].map((name) => {
                return <AvatarAuto key={name} name={name} />;
              })}
            </Avatar.Group>
          </div>
        </div>
        <div className={cls.voteInner}>{map(block)}</div>
      </div>
    );
  }

  return <div>unsupported block &quot;{JSON.stringify(block)}&quot;</div>;
};

export const ContentDoc: React.FC<{ doc: BlockLevelZero }> = ({ doc }) => {
  return (
    <>
      {doc.content.map((blk, i) => {
        return <ContentBlock block={blk} key={i} />;
      })}
    </>
  );
};

function map(block: BlocksWithContent): JSX.Element | JSX.Element[] {
  if (!block.content) return <></>;

  return block.content.map((blk, i) => {
    return <ContentBlock block={blk} key={i} />;
  });
}
