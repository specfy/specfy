import type { ApiProject } from '@specfy/api/src/types/api';
import { IconPlus, IconSearch, IconUsers } from '@tabler/icons-react';
import { Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useProjectStore } from '../../common/store';
import { AvatarAuto } from '../AvatarAuto';
import { Empty } from '../Empty';
import { Flex } from '../Flex';
import { Loading } from '../Loading';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC<{ orgId: string }> = ({ orgId }) => {
  const storeProjects = useProjectStore();
  const [list, setList] = useState<ApiProject[]>();
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setList(storeProjects.projects);
  }, [storeProjects.projects]);

  useEffect(() => {
    if (!search) {
      setList(storeProjects.projects);
      return;
    }

    const reg = new RegExp(search, 'i');
    setList(storeProjects.projects.filter((proj) => proj.name.match(reg)));
  }, [search]);

  const empty = !list || list.length <= 0;
  const brandNew = !search && empty;

  return (
    <div>
      <div className={cls.header}>
        <h3>Projects</h3>
        {!brandNew && (
          <div className={cls.actions}>
            <Link to={`/${orgId}/_/project/new`}>
              <Button type="default" icon={<IconPlus />}>
                New
              </Button>
            </Link>
            <Input
              prefix={<IconSearch />}
              style={{ width: '200px' }}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
        )}
      </div>

      {!list && <Loading />}
      {list && (
        <>
          {brandNew && (
            <Empty
              title="No projects, yet!"
              desc="Create a project manually or from Github."
              action={
                <Link to={`/${orgId}/_/project/new`}>
                  <Button type="default" icon={<IconPlus />}>
                    Create a New Project
                  </Button>
                </Link>
              }
            />
          )}

          {search != '' && empty && <Empty search={search} />}

          {!empty &&
            list.map((item) => {
              return (
                <Flex gap="xl" key={item.id} className={cls.item}>
                  <Link to={`/${item.orgId}/${item.slug}`} relative="path">
                    <AvatarAuto name={item.name} size="medium" shape="square" />
                  </Link>
                  <div>
                    <Link
                      to={`/${item.orgId}/${item.slug}`}
                      relative="path"
                      className={cls.title}
                    >
                      {item.name}
                    </Link>

                    <div className={cls.info}>
                      <div>
                        <IconUsers /> 12
                      </div>
                      <div>
                        · <Time time={item.updatedAt} />
                      </div>
                    </div>
                  </div>
                </Flex>
              );
            })}
        </>
      )}
    </div>
  );
};
