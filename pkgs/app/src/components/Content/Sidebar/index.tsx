import type { ApiProject, DocumentSimple } from '@specfy/api/src/types/api';
import {
  IconFileText,
  IconCircleX,
  IconSearch,
  IconLayoutSidebarLeftExpand,
  IconChevronDown,
} from '@tabler/icons-react';
import { Button, Input, Tree } from 'antd';
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../api';
import { TYPE_TO_TEXT } from '../../../common/document';
import { useDocumentsStore } from '../../../common/store';
import type { RouteProject } from '../../../types/routes';
import { Loading } from '../../Loading';

import cls from './index.module.scss';

function buildDocHierarchy(
  docs: DocumentSimple[],
  parentId: string | null
): DataNode[] {
  const node: DataNode[] = [];

  for (const doc of docs) {
    if (doc.parentId !== parentId) {
      continue;
    }

    node.push({
      key: doc.id,
      title: doc.name,
      icon: <IconFileText />,
      children: buildDocHierarchy(docs, doc.id),
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

  const tree: DataNode[] = useMemo(() => {
    if (!res.data?.data) {
      return [];
    }

    // const rfc: DataNode[] = [];
    // const playbook: DataNode[] = [];

    const tmp = res.data.data.filter((d) => d.type === 'doc');
    const docs: DataNode[] = buildDocHierarchy(tmp, null);

    // for (const doc of res.data.data) {
    //   if (deleted.includes(doc.id)) {
    //     continue;
    //   }
    //   if (doc.type === 'docs') {
    //     continue;
    //   }

    //   if (doc.type === 'pb') {
    //     playbook.push({
    //       key: doc.id,
    //       title: doc.name,
    //       isLeaf: true,
    //       icon: <IconFileCode />,
    //     });
    //   } else {
    //     rfc.push({
    //       key: doc.id,
    //       title: `RFC-${doc.typeId} - ${doc.name}`,
    //       isLeaf: true,
    //       icon: <IconFileText />,
    //     });
    //   }
    // }

    // return [
    //   {
    //     title: 'Docs',
    //     key: 'docs',
    //     children: docs,
    //   },
    //   {
    //     title: 'RFC',
    //     key: 'rfc',
    //     children: rfc,
    //   },
    //   {
    //     title: 'Playbook',
    //     key: 'pb',
    //     children: playbook,
    //   },
    // ];

    return docs;
  }, [res.isLoading, deleted]);

  useEffect(() => {
    const split = location.pathname.split('/');
    if (split.length <= 4) {
      setSelected([]);
      return;
    }

    setSelected([split[4].split('-')[0]]);
    // setExpanded(['docs', 'rfc', 'pb']);
  }, [location]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys) => {
    if (keys[0] === 'rfc') {
      return;
    }
    for (const item of res.data!.data) {
      if (item.id === keys[0]) {
        navigate(`/${proj.orgId}/${proj.slug}/content/${item.id}-${item.slug}`);
      }
    }
  };

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
        <Button
          icon={<IconLayoutSidebarLeftExpand />}
          onClick={handleCollapse}
        />
      </div>
    );
  }

  return (
    <div className={classnames(cls.tree, collapsed && cls.collapsed)}>
      <div className={cls.treeHeader} style={{ display: 'none' }}>
        <div className={cls.search}>
          <Input
            prefix={<IconSearch />}
            onChange={handleInput}
            value={search}
            suffix={
              loading ? (
                <Loading />
              ) : (
                search && (
                  <Button
                    onClick={handleReset}
                    title="Reset search filters..."
                    type="text"
                    size="small"
                    icon={<IconCircleX />}
                  />
                )
              )
            }
            placeholder="Search..."
            onKeyDown={handleKeyPress}
          />
        </div>
        {/* <Link to={`/${proj.orgId}/${proj.slug}/content/new`}>
          <Button icon={<IconPlus />} />
        </Link> */}
        {/* <Button
          icon={<IconLayoutSidebarLeftCollapse />}
          onClick={handleCollapse}
        /> */}
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
                  {TYPE_TO_TEXT[item.doc.type]}-{item.doc.typeId}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {!list && (
        <Tree.DirectoryTree
          showIcon
          defaultExpandAll
          // expandedKeys={expanded}
          switcherIcon={<IconChevronDown />}
          onSelect={onSelect}
          selectedKeys={selected}
          // autoExpandParent={true}
          treeData={tree}
        />
      )}
    </div>
  );
};
