import { Github } from '@icons-pack/react-simple-icons';
import { IconArrowRight, IconLock } from '@tabler/icons-react';
import { App, Button, Skeleton } from 'antd';
import { hDef, wDef, wMax } from 'api/src/common/validators/flow.constants';
import type {
  ApiGithubRepo,
  ApiOrg,
  ResValidationError,
} from 'api/src/types/api';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { createProject } from '../../../../api';
import {
  useGetGithubInstallations,
  useGetGithubRepos,
} from '../../../../api/github';
import { isError, isValidationError } from '../../../../api/helpers';
import { computeProjectPosition, computeWidth } from '../../../../common/flow';
import { i18n } from '../../../../common/i18n';
import { useProjectStore } from '../../../../common/store';
import { slugify } from '../../../../common/string';
import { Flex } from '../../../../components/Flex';
import { GithubOrgSelect } from '../../../../components/Github/OrgSelect';

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
          Import
        </Button>
      )}
      {link && (
        <div>
          <Button disabled>imported</Button>
          <Link to={link} target="_blank" title="Go to project...">
            <Button type="link" icon={<IconArrowRight />} />
          </Link>
        </div>
      )}
    </div>
  );
};

export const CreateFromGithub: React.FC<{
  org: ApiOrg;
  onError: (repo: ApiGithubRepo, err: ResValidationError['error']) => void;
}> = ({ org, onError }) => {
  const storeProjects = useProjectStore();
  const { message } = App.useApp();

  const [selected, setSelected] = useState<number | 'public'>('public');
  const [reposReady, setReposReady] = useState<boolean>(false);

  const resInstall = useGetGithubInstallations();
  const resRepos = useGetGithubRepos(
    {
      installation_id: selected === 'public' ? undefined : selected,
    },
    resInstall.data !== null
  );

  useEffect(() => {
    setReposReady(resRepos.data && !resRepos.isFetching ? true : false);
  }, [resRepos]);

  const onClose = () => {
    setReposReady(false);
    resRepos.refetch();
  };

  const onQuickCreate = useCallback(
    async (repo: ApiGithubRepo): Promise<string | false> => {
      const tmpSlug = slugify(repo.name);
      const res = await createProject({
        name: repo.name,
        slug: tmpSlug,
        orgId: org.id,
        display: {
          pos: computeProjectPosition(storeProjects.projects),
          zIndex: 1,
          size: { width: computeWidth(repo.name, wDef, wMax), height: hDef },
        },
        githubRepositoryId: repo.id,
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

      return `/${org.id}/${tmpSlug}`;
    },
    [storeProjects.projects]
  );

  return (
    <div className={cls.github}>
      <header>
        <h3 className={cls.header}>
          <Github /> Import from Github
        </h3>
      </header>

      <div className={cls.main}>
        <Flex gap="m" alignItems="initial">
          <GithubOrgSelect
            publicRepos={true}
            defaultSelected={org.githubInstallationId}
            onClose={onClose}
            onChange={(sel) => {
              if (sel) setSelected(sel);
            }}
          />
        </Flex>

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
