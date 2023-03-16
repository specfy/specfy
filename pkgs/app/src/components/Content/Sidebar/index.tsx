import { LoadingOutlined } from '@ant-design/icons';
import {
  IconFileText,
  IconCircleX,
  IconSearch,
  IconFileCode,
  IconLayoutSidebarLeftCollapse,
  IconPlus,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { Button, Input, Tree } from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import type { ApiProject, DocumentSimple } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../api/documents';
import { typeToText } from '../../../common/document';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const ContentSidebar: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

        const before = doc.name.substring(0, match.index!);
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

  const tree = useMemo(() => {
    if (!res.data?.data) {
      return;
    }

    const rfc = [];
    const playbook = [];
    for (const doc of res.data.data) {
      if (doc.type === 'pb') {
        playbook.push({
          key: doc.slug,
          title: doc.name,
          isLeaf: true,
          icon: <IconFileCode />,
        });
      } else {
        rfc.push({
          key: doc.slug,
          title: `RFC-${doc.typeId} - ${doc.name}`,
          isLeaf: true,
          icon: <IconFileText />,
        });
      }
    }

    return [
      {
        title: 'RFC',
        key: 'rfc',
        children: rfc,
      },
      {
        title: 'Playbook',
        key: 'pb',
        children: playbook,
      },
    ];
  }, [res.isLoading]);

  const selected = useMemo(() => {
    const split = location.pathname.split('/');
    if (split.length <= 3) {
      return;
    }

    return [split[4]];
  }, [location]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys) => {
    if (keys[0] === 'rfc') {
      return;
    }
    for (const item of res.data!.data) {
      if (item.slug === keys[0]) {
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
        <LoadingOutlined />
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
      <div className={cls.treeHeader}>
        <div className={cls.search}>
          <Input
            prefix={<IconSearch />}
            onChange={handleInput}
            value={search}
            suffix={
              loading ? (
                <LoadingOutlined size={32} />
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
        <Link to={'new'}>
          <Button icon={<IconPlus />} />
        </Link>
        <Button
          icon={<IconLayoutSidebarLeftCollapse />}
          onClick={handleCollapse}
        />
      </div>
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
                  {typeToText[item.doc.type]}-{item.doc.typeId}
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
          switcherIcon={false}
          onSelect={onSelect}
          selectedKeys={selected}
          // expandedKeys={expandedKeys}
          // autoExpandParent={autoExpandParent}
          treeData={tree}
        />
      )}
    </div>
  );
};
