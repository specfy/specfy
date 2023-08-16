import type { ApiDocument, ApiProject } from '@specfy/models';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { titleSuffix } from '../../../../common/string';
import { ContentDoc } from '../../../../components/Content';
import { HeadingTree } from '../../../../components/HeadingTree';
import { UpdatedAt } from '../../../../components/UpdatedAt';

import cls from './index.module.scss';

export const Doc: React.FC<{
  proj: ApiProject;
  doc: ApiDocument;
}> = ({ doc, proj }) => {
  // Edition
  const [title, setTitle] = useState('');

  useEffect(() => {
    setTitle(doc.name);
  }, [doc]);

  return (
    <>
      <Helmet title={`${title} - ${proj.name} ${titleSuffix}`} />

      <div className={cls.col1}>
        <HeadingTree blocks={doc.content.content}></HeadingTree>
      </div>
      <div className={cls.col2}>
        <div className={cls.header}>
          <h1 id={doc.slug}>{title}</h1>
        </div>
        <UpdatedAt time={doc.updatedAt} />

        <div className={cls.content}>
          <ContentDoc doc={doc.content} />
        </div>
      </div>

      <div className={cls.col3}></div>
    </>
  );
};
