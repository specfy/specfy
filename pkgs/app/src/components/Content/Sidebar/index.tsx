/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ApiProject, DocumentSimple } from '@specfy/api/src/types/api';
import {
  IconCircleX,
  IconSearch,
  IconLayoutSidebarLeftExpand,
  IconChevronRight,
} from '@tabler/icons-react';
import classnames from 'classnames';
import type { TreeProps } from 'rc-tree';
import Tree from 'rc-tree';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../api';
import { TYPE_TO_TEXT } from '../../../common/document';
import { useDocumentsStore } from '../../../common/store';
import type { RouteProject } from '../../../types/routes';
import { Button } from '../../Form/Button';
import { Input } from '../../Form/Input';
import { Loading } from '../../Loading';

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
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Data fetch
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
  });

  // Search
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<
    Array<{
      doc: DocumentSimple;
      before: string;
      center: string;
      after: string;
    }>
  >();
  const [search, setSearch] = useState<string>('');
  const [focus, setFocus] = useState<number>(0);
  // const [expanded, setExpanded] = useState(['doc', 'rfc']);
  const [selected, setSelected] = useState<string[]>([]);
  const refList = useRef<HTMLDivElement>(null);

  useDebounce(
    () => {
      setLoading(false);
      if (search === '') {
        setList(undefined);
        return;
      }

      const reg = new RegExp(search, 'i');
      const matched = [];
      for (const doc of res.data!.data) {
        const match = doc.name.match(reg);
        if (!match) {
          continue;
        }

        const before = doc.name.substring(0, match.index);
        const center = doc.name.substring(
          match.index!,
          match.index! + search.length
        );
        const after = doc.name.substring(match.index! + search.length);

        matched.push({
          doc: doc,
          before,
          center,
          after,
        });
      }

      setList(matched);
      setFocus(0);
    },
    250,
    [search]
  );

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

  // Handler
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
    setLoading(true);
  };
  const handleReset = () => {
    setSearch('');
    setList(undefined);
  };
  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      setFocus(focus + 1 === list!.length ? 0 : focus + 1);
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setFocus(Math.max(0, focus - 1));
    } else if (e.code === 'Enter') {
      if (list![focus]) {
        (refList.current?.childNodes[focus] as HTMLAnchorElement).click();
      }
    }
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };
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

  if (collapsed) {
    return (
      <div className={classnames(cls.tree, cls.collapsed)}>
        <Button onClick={handleCollapse}>
          <IconLayoutSidebarLeftExpand />
        </Button>
      </div>
    );
  }

  return (
    <div className={classnames(cls.content, collapsed && cls.collapsed)}>
      <div className={cls.header}>
        <div className={cls.search}>
          <Input
            seamless
            before={<IconSearch />}
            onChange={handleInput}
            value={search}
            after={
              loading ? (
                <Loading />
              ) : (
                <button
                  onClick={handleReset}
                  title="Reset search filters..."
                  style={{ opacity: !search ? 0 : 100 }}
                >
                  <IconCircleX />
                </button>
              )
            }
            placeholder="Search..."
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>
      {tree.length <= 0 && (
        <div className={cls.empty}>Content will appear here...</div>
      )}
      {list && (
        <div className={cls.results} ref={refList}>
          {list.map((item, i) => {
            return (
              <Link
                key={item.doc.id}
                className={classnames(cls.result, focus === i && cls.selected)}
                to={`/${proj.orgId}/${proj.slug}/content/${item.doc.id}-${item.doc.slug}`}
                onClick={handleReset}
                tabIndex={0}
              >
                <div>
                  {item.before}
                  <mark>{item.center}</mark>
                  {item.after}
                  <br />
                  {item.doc.type !== 'doc' && `${TYPE_TO_TEXT[item.doc.type]}-`}
                  {item.doc.typeId}
                </div>
              </Link>
            );
          })}
        </div>
      )}

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
