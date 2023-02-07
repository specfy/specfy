import { Alert, Checkbox } from 'antd';
import type { Blocks } from 'api/src/types/api';
import { Link } from 'react-router-dom';

import { slugify } from '../../common/string';

import cls from './index.module.scss';

export const ContentBlock: React.FC<{ block: Blocks }> = ({ block }) => {
  if (block.type === 'heading') {
    const id = `h-${slugify(block.content)}`;
    if (block.level === 1) return <h1 id={id}>{block.content}</h1>;
    else if (block.level === 2) return <h2 id={id}>{block.content}</h2>;
    else if (block.level === 3) return <h3 id={id}>{block.content}</h3>;
    else if (block.level === 4) return <h4 id={id}>{block.content}</h4>;
    else if (block.level === 5) return <h5 id={id}>{block.content}</h5>;
    else return <h6 id={id}>{block.content}</h6>;
  } else if (block.type === 'content') {
    return (
      <p>
        {block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      </p>
    );
  } else if (block.type === 'bulletList') {
    return (
      <ul>
        {block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      </ul>
    );
  } else if (block.type === 'item') {
    return (
      <li>
        {block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      </li>
    );
  } else if (block.type === 'text') {
    let text = <>{block.content} </>;
    if (block.style) {
      if (block.style.bold) text = <strong>{text}</strong>;
      if (block.style.italic) text = <em>{text}</em>;
      if (block.style.code) text = <code>{text}</code>;
    }
    if (block.link) text = <Link to={block.link}>{text}</Link>;
    return text;
  } else if (block.type === 'quote') {
    return (
      <blockquote>
        {block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      </blockquote>
    );
  } else if (block.type === 'panel') {
    return (
      <Alert
        type={block.panelType}
        banner
        description={block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      ></Alert>
    );
  } else if (block.type === 'taskList') {
    return (
      <ul className={cls.taskList}>
        {block.content.map((blk, i) => {
          return <ContentBlock block={blk} key={i} />;
        })}
      </ul>
    );
  } else if (block.type === 'task') {
    return (
      <li>
        <Checkbox checked={block.state === 'done'}>
          {block.content.map((blk, i) => {
            return <ContentBlock block={blk} key={i} />;
          })}
        </Checkbox>
      </li>
    );
  }

  return <>unsupported block &quot;{JSON.stringify(block)}&quot;</>;
};
