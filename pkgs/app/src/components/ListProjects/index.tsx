import type { ApiProjectList } from '@specfy/models';
import { IconPlus, IconSearch, IconUsers } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useListProjects } from '../../api';
import { useProjectStore } from '../../common/store';
import { AvatarAuto } from '../AvatarAuto';
import { Empty } from '../Empty';
import { Button } from '../Form/Button';
import { Input } from '../Form/Input';
import { Loading } from '../Loading';
import { Time } from '../Time';

import cls from './index.module.scss';

export const ListProjects: React.FC<{ orgId: string }> = ({ orgId }) => {
  const getProjects = useListProjects({ org_id: orgId });
  const storeProjects = useProjectStore();
  const [list, setList] = useState<ApiProjectList[]>();
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    storeProjects.fill(getProjects.data?.data || []);
  }, [getProjects.data]);

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
    <div className={cls.main}>
      <div className={cls.header}>
        <h2>Projects</h2>
        {!brandNew && (
          <div className={cls.actions}>
            <Link to={`/${orgId}/_/project/new`}>
              <Button display="primary">
                <IconPlus /> New
              </Button>
            </Link>
            <Input
              before={<IconSearch />}
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
                  <Button display="primary">
                    <IconPlus /> Create a new Project
                  </Button>
                </Link>
              }
            />
          )}

          {search != '' && empty && <Empty search={search} />}

          <div className={cls.list}>
            {!empty &&
              list.map((item) => {
                const link = `/${item.orgId}/${item.slug}`;
                return (
                  <div
                    key={item.id}
                    className={cls.item}
                    onClick={() => navigate(link)}
                    role="button"
                    tabIndex={0}
                  >
                    <Link to={link} relative="path">
                      <AvatarAuto name={item.name} size="m" shape="square" />
                    </Link>
                    <div className={cls.content}>
                      <Link to={link} relative="path" className={cls.title}>
                        {item.name}
                      </Link>

                      <div className={cls.info}>
                        <div>
                          <IconUsers /> {item.users}
                        </div>
                        ·
                        <div>
                          <Time time={item.updatedAt} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};
