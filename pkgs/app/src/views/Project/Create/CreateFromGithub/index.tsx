import { Github } from '@icons-pack/react-simple-icons';
import { IconArrowRight, IconLock, IconPlus } from '@tabler/icons-react';
import { App, Avatar, Button, Select, Skeleton } from 'antd';
import { hDef, wDef, wMax } from 'api/src/common/validators/flow.constants';
import type { ApiGithubRepo, ResValidationError } from 'api/src/types/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { createProject } from '../../../../api';
import {
  useGetGithubInstallations,
  useGetGithubRepos,
} from '../../../../api/github';
import { isError, isValidationError } from '../../../../api/helpers';
import { GITHUB_APP } from '../../../../common/envs';
import { computeProjectPosition, computeWidth } from '../../../../common/flow';
import { i18n } from '../../../../common/i18n';
import { Popup } from '../../../../common/popup';
import { useProjectStore } from '../../../../common/store';
import { slugify } from '../../../../common/string';
import type { RouteOrg } from '../../../../types/routes';

import cls from './index.module.scss';

export const Repo: React.FC<{
  repo: ApiGithubRepo;
  onQuickCreate: (repo: ApiGithubRepo) => Promise<string | false>;
}> = ({ repo, onQuickCreate }) => {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className={cls.item}>
      <div>
        {repo.name} {repo.private && <IconLock />}
      </div>
      {!link && (
        <Button
          onClick={async () => {
            setLoading(true);
            const done = await onQuickCreate(repo);
            setLoading(false);
            if (done) {
              setLink(done);
            }
          }}
          loading={loading}
        >
          Quick create
        </Button>
      )}
      {link && (
        <div>
          <Button disabled>created</Button>
          <Link to={link} target="_blank" title="Go to project...">
            <Button type="link" icon={<IconArrowRight />} />
          </Link>
        </div>
      )}
    </div>
  );
};

export const CreateFromGithub: React.FC<{
  params: RouteOrg;
  onError: (repo: ApiGithubRepo, err: ResValidationError['error']) => void;
}> = ({ params, onError }) => {
  const storeProjects = useProjectStore();
  const { message } = App.useApp();

  const ref = useRef<Popup | null>(null);
  const [selected, setSelected] = useState<number | 'public'>('public');
  const [installReady, setInstallReady] = useState<boolean>(false);
  const [reposReady, setReposReady] = useState<boolean>(false);

  const resInstall = useGetGithubInstallations();
  const resRepos = useGetGithubRepos(
    {
      installation_id: selected === 'public' ? undefined : selected,
    },
    resInstall.data !== null
  );

  useEffect(() => {
    if (!resInstall.data || resInstall.isFetching) {
      return;
    }

    const curr = resInstall.data.length > 0 ? resInstall.data[0] : undefined;
    // If nothing selected yet (first load)
    // Or the currently selected has been removed
    if (!selected || !resInstall.data.find((inst) => inst.id === selected)) {
      setSelected(curr?.id || 'public');
    }

    setInstallReady(true);
  }, [resInstall]);

  useEffect(() => {
    setReposReady(resRepos.data && !resRepos.isFetching ? true : false);
  }, [resRepos]);

  const triggerInstall = () => {
    ref.current = new Popup({
      id: 'github-install',
      url: `https://github.com/apps/${GITHUB_APP}/installations/new`,
      callbacks: {
        onBlocked: () => {
          ref.current = null;
          message.error(
            'The popup to install the GitHub App could not be opened.'
          );
        },
        onClose: () => {
          ref.current = null;

          setSelected('public');
          setInstallReady(false);
          setReposReady(false);

          resInstall.refetch();
          resRepos.refetch();
        },
      },
    });
    ref.current.open();
  };

  const onQuickCreate = useCallback(
    async (repo: ApiGithubRepo): Promise<string | false> => {
      const tmpSlug = slugify(repo.name);
      const res = await createProject({
        name: repo.name,
        slug: tmpSlug,
        orgId: params.org_id,
        display: {
          pos: computeProjectPosition(storeProjects.projects),
          zIndex: 1,
          size: { width: computeWidth(repo.name, wDef, wMax), height: hDef },
        },
      });
      if (isError(res)) {
        if (isValidationError(res)) {
          onError(repo, res.error);

          window.scrollTo(0, 0);
        } else {
          message.error(i18n.errorOccurred);
        }
        return false;
      }

      message.success('Project created');

      return `/${params.org_id}/${tmpSlug}`;
    },
    [storeProjects.projects]
  );

  return (
    <div className={cls.github}>
      <header>
        <h3 className={cls.header}>
          <Github /> Create from Github
        </h3>
      </header>

      <div className={cls.main}>
        {!installReady ? (
          <div className={cls.select}>
            <Skeleton.Input active />
          </div>
        ) : (
          <div>
            <Select
              className={cls.select}
              value={selected}
              size="large"
              onChange={setSelected}
              dropdownRender={(menu) => {
                return (
                  <>
                    {menu}

                    <div className={cls.install}>
                      <Button
                        icon={<IconPlus />}
                        type="ghost"
                        onClick={triggerInstall}
                      >
                        Add Github Organization
                      </Button>
                    </div>
                  </>
                );
              }}
            >
              <Select.Option value="public">
                <div> </div>
                <div className={cls.label}>Public Repositories</div>
              </Select.Option>
              {resInstall.data!.map((install) => {
                return (
                  <Select.Option key={install.id} value={install.id}>
                    <div className={cls.option}>
                      <Avatar
                        src={install.avatarUrl}
                        shape="square"
                        size="small"
                      />
                      <div className={cls.label}>{install.name}</div>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        )}

        {!reposReady ? (
          <Skeleton title={false} paragraph={{ rows: 3 }} active />
        ) : (
          <div>
            {resRepos.data?.map((repo) => {
              return (
                <Repo key={repo.id} repo={repo} onQuickCreate={onQuickCreate} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
