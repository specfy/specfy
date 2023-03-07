import { LoadingOutlined } from '@ant-design/icons';
import { IconFileText, IconCircleX, IconSearch } from '@tabler/icons-react';
import { Button, Input, Tree } from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../api/documents';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const ContentSidebar: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<
    Array<{
      doc: ApiDocument;
      before: string;
      center: string;
      after: string;
    }>
  >();
  const [search, setSearch] = useState<string>('');

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
    },
    250,
    [search]
  );

  const tree = useMemo(() => {
    if (!res.data?.data) {
      return;
    }

    return [
      {
        title: 'RFC',
        key: 'rfc',
        children: res.data.data.map((doc) => {
          return {
            key: doc.slug,
            title: `RFC-${doc.typeId} - ${doc.name}`,
            isLeaf: true,
            icon: <IconFileText />,
          };
        }),
      },
    ];
  }, [res.isLoading]);

  const selected = useMemo(() => {
    const split = location.pathname.split('/');
    if (split.length <= 3) {
      return;
    }
    console.log(split);

    return [split[4]];
  }, [location]);

  const onSelect: DirectoryTreeProps['onSelect'] = (keys) => {
    if (keys[0] === 'rfc') {
      return;
    }
    for (const item of res.data!.data) {
      if (item.slug === keys[0]) {
        navigate(`/${proj.orgId}/${proj.slug}/content/${item.slug}`);
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

  if (res.isLoading) {
    return (
      <div>
        <LoadingOutlined />
      </div>
    );
  }

  return (
    <div className={cls.tree}>
      <div className={cls.treeHeader}>
        <Input.Group compact className={cls.inputs}>
          <Input
            size="large"
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
          />
        </Input.Group>
      </div>
      {list && (
        <div className={cls.search}>
          {list.map((item) => {
            return (
              <Link
                key={item.doc.id}
                className={cls.result}
                to={`/${proj.orgId}/${proj.slug}/content/${item.doc.slug}`}
                onClick={handleReset}
              >
                <div>
                  {item.before}
                  <mark>{item.center}</mark>
                  {item.after}
                  <br />
                  RFC-{item.doc.typeId}
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
