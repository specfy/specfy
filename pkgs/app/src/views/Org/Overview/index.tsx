import { SiGithub } from '@icons-pack/react-simple-icons';
import { type ApiGitHubRepo, type ApiOrg } from '@specfy/models';
import { IconCheck, IconExternalLink, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import {
  useListProjects,
  useGetFlow,
  useCatalogSummary,
  useGetGitHubRepos,
  isError,
  createSource,
  createProject,
  getDefaultSettings,
} from '@/api';
import { i18n } from '@/common/i18n';
import { qcli } from '@/common/query';
import { socket } from '@/common/socket';
import { useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Toolbar } from '@/components/Flow/Toolbar';
import { FlowWrapper } from '@/components/Flow/Wrapper';
import { Button } from '@/components/Form/Button';
import { ListActivity } from '@/components/ListActivity';
import { Metric } from '@/components/Metric';
import { OrgOnboarding } from '@/components/Org/Onboarding';
import { ProjectList } from '@/components/Project/List';
import { useToast } from '@/hooks/useToast';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

const Suggestion: React.FC<{ orgId: string; repo: ApiGitHubRepo }> = ({
  orgId,
  repo,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  const create = async () => {
    setLoading(true);

    const res = await createProject({
      name: repo.name,
      orgId,
    });
    if (isError(res)) {
      setLoading(false);
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    socket.emit('join', { orgId: orgId, projectId: res.data.id });

    toast.add({ title: 'Project created', status: 'success' });

    const settings = getDefaultSettings();
    settings.branch = repo.defaultBranch;
    const link = await createSource({
      orgId: orgId,
      projectId: res.data.id,
      type: 'github',
      settings,
      identifier: repo.fullName,
    });
    if (isError(link)) {
      setLoading(false);

      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    setLoading(false);
    setImported(true);
  };

  return (
    <Flex className={cls.suggestion} justify="space-between">
      <Flex gap="m">
        <SiGithub size="1em" />
        <a
          href={`https://github.com/${repo.fullName}`}
          target="_blank"
          rel="noreferrer"
        >
          {repo.fullName}
          <IconExternalLink size="1em" />
        </a>
      </Flex>
      {!imported ? (
        <Button size="s" display="ghost" onClick={create} loading={loading}>
          Quick import
        </Button>
      ) : (
        <Button size="s" display="ghost">
          <IconCheck />
          imported
        </Button>
      )}
    </Flex>
  );
};
export const OrgOverview: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const store = useFlowStore();
  const res = useListProjects({ org_id: params.org_id });
  const resRepos = useGetGitHubRepos(
    {
      installation_id: org.githubInstallationId!,
    },
    org.githubInstallationId !== null
  );
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const resSummary = useCatalogSummary({ org_id: params.org_id });
  const [suggestions, setSuggestions] = useState<ApiGitHubRepo[]>([]);
  const [done] = useLocalStorage(`org.onboarding[${org.id}]`, false);

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    store.setCurrent(org.flowId, resFlow.data.data.flow);
    store.setMeta({ readOnly: true, connectable: false, deletable: false });
  }, [resFlow.data]);

  useEffect(() => {
    if (!res.data || !resRepos.data) {
      return;
    }
    if (!org.githubInstallationId) {
      return;
    }
    if (suggestions.length > 0) {
      return;
    }

    const imported = new Set<string>();
    for (const proj of res.data.data) {
      for (const source of proj.sources) {
        if (source.type !== 'github') {
          continue;
        }

        imported.add(source.identifier);
      }
    }

    setSuggestions(
      resRepos.data.filter((repo) => {
        return !imported.has(repo.fullName);
      })
    );
  }, [res.data, resRepos.data]);

  if (res.error) {
    return <div>{i18n.criticalErrorOccurred}</div>;
  }
  if (res.isLoading) {
    return (
      <div style={{ width: '300px' }}>
        <Skeleton count={3} />
      </div>
    );
  }

  return (
    <>
      <Helmet title={`${org.name} ${titleSuffix}`} />
      <ContainerChild leftLarge>
        {!done && <OrgOnboarding org={org} key={org.id} />}
        <Flex className={cls.content} gap="xl" column align="flex-start">
          <Flex justify="space-between" grow>
            <h2>{org.name} overview</h2>
            <Link to={`/${params.org_id}/_/project/new`}>
              <Button display="primary">
                <IconPlus /> new project
              </Button>
            </Link>
          </Flex>
          <Flex gap="xl" grow>
            <Metric
              number={res.data?.pagination.totalItems || 0}
              label="projects"
              labelPos="down"
              className={cls.metric}
            />
            <Link to={`/${params.org_id}/_/catalog`} className={cls.metric}>
              <Metric
                number={resSummary.data?.data.count || 0}
                label="technologies"
                labelPos="down"
              />
            </Link>
          </Flex>
        </Flex>
        <ProjectList orgId={params.org_id}></ProjectList>

        {suggestions.length > 0 && (
          <div className={cls.content}>
            <h4>Suggestions</h4>
            <p>Quickly import your GitHub repositories</p>
            <br />
            <div>
              {suggestions.map((sugg) => {
                return (
                  <Suggestion key={sugg.id} orgId={params.org_id} repo={sugg} />
                );
              })}
            </div>
          </div>
        )}
      </ContainerChild>
      <ContainerChild rightSmall>
        <div>
          <FlowWrapper columnMode>
            {!resFlow.data ? (
              <div style={{ margin: '20px' }}>
                <Skeleton count={3} />
              </div>
            ) : (
              <FlowOrg />
            )}
            <Toolbar bottom>
              <Toolbar.Fullscreen to={`${org.id}/_`} />
              <Toolbar.Zoom />
            </Toolbar>
          </FlowWrapper>
        </div>

        <Card large seamless transparent>
          <ListActivity orgId={params.org_id}></ListActivity>
        </Card>
      </ContainerChild>
    </>
  );
};
