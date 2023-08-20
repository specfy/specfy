/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ApiProject, DocumentSimple } from '@specfy/models';
import { IconChevronRight } from '@tabler/icons-react';
import type { TreeProps } from 'rc-tree';
import Tree from 'rc-tree';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useListDocuments } from '../../../api';
import { useDocumentsStore } from '../../../common/store';
import type { RouteProject } from '../../../types/routes';
import { Loading } from '../../Loading';
import { Subdued } from '../../Text';

import cls from './index.module.scss';

interface Item {
  key: string;
  title: string;
  href: string;
  children: Item[];
}

function buildDocHierarchy(
  docs: DocumentSimple[],
  parentId: string | null,
  proj: ApiProject
): Item[] {
  const node: Item[] = [];

  for (const doc of docs) {
    if (doc.parentId !== parentId) {
      continue;
    }

    node.push({
      key: doc.id,
      title: doc.name,
      href: `/${proj.orgId}/${proj.slug}/content/${doc.id}-${doc.slug}`,
      children: buildDocHierarchy(docs, doc.id, proj),
    });
  }

  return node;
}

export const ContentSidebar: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleted } = useDocumentsStore();

  // Data fetch
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
  });

  const [selected, setSelected] = useState<string[]>([]);

  const tree: Item[] = useMemo(() => {
    if (!res.data?.data) {
      return [];
    }

    const tmp = res.data.data.filter((d) => d.type === 'doc');
    const docs: Item[] = buildDocHierarchy(tmp, null, proj);

    return docs;
  }, [res.data, deleted]);

  useEffect(() => {
    const split = location.pathname.split('/');
    if (split.length <= 4) {
      setSelected([]);
      return;
    }

    setSelected([split[4].split('-')[0]]);
  }, [location]);

  const onSelect: TreeProps['onSelect'] = (keys) => {
    if (keys[0] === 'rfc') {
      return;
    }
    for (const item of res.data!.data) {
      if (item.id === keys[0]) {
        navigate(`/${proj.orgId}/${proj.slug}/content/${item.id}-${item.slug}`);
      }
    }
  };

  if (res.isLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }
  if (tree.length <= 0) {
    return <Subdued className={cls.empty}>Nothing uploaded</Subdued>;
  }

  return (
    <div>
      <Tree
        treeData={tree}
        showIcon={false}
        defaultExpandAll={false}
        autoExpandParent={true}
        defaultExpandParent={true}
        switcherIcon={<IconChevronRight />}
        selectedKeys={selected}
        onSelect={onSelect}
      />
    </div>
  );
};
