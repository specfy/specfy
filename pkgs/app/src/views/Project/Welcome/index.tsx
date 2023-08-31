import type { ApiJob } from '@specfy/models';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';

import { Row } from '../Deploy/List';

import cls from './index.module.scss';

import { refreshProject } from '@/common/query';
import { useProjectStore } from '@/common/store';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { OnboardingRow } from '@/components/Onboarding/Row';
import { useEventBus } from '@/hooks/useEventBus';

export const ProjectWelcome: React.FC = () => {
  const { project } = useProjectStore();
  const [job, setJob] = useState<ApiJob>();
  const navigate = useNavigate();

  useEventBus(
    'job.start',
    (data) => {
      if (data.project.id !== project?.id) {
        return;
      }
      setJob(data.job);
    },
    [project]
  );
  useEventBus(
    'job.finish',
    (data) => {
      console.log(data.job.id, job?.id);
      if (data.job.id !== job?.id) {
        return;
      }
      setJob(data.job);
    },
    [project, job]
  );

  const onGo = async () => {
    if (job) {
      await refreshProject(job.orgId, job.projectId!, true);
    }
    navigate(`/${project!.orgId}/${project!.slug}`);
  };
  if (!project) {
    return null;
  }

  return (
    <div className={cls.welcome}>
      <div>
        <Flex justify="space-between">
          <h1>Setup in progress</h1>
          <div>
            <Button display="ghost" onClick={onGo}>
              skip
            </Button>
          </div>
        </Flex>
        <div className={cls.intro}>
          <p>Welcome to your new project.</p>
          <p>
            We are fetching your repository from{' '}
            <a href={`https://github.com/${project.githubRepository}`}>
              Github
            </a>
            , please wait a few seconds while everything is being setup.
          </p>
        </div>

        <div className={cls.job}>
          {job ? (
            <Row
              deploy={job}
              params={{ org_id: project.orgId, project_slug: project.slug }}
            />
          ) : (
            <Skeleton />
          )}
        </div>

        <h3>What to do next?</h3>
        <OnboardingRow
          title="Organize your Flow"
          desc="Make it clean and nice, ready to be presented to other employees or in your RFCs"
          done={false}
        />
        <OnboardingRow
          title="Write small introductions"
          desc="On your services explain why they exist and how they work, this will help with onboarding"
          done={false}
        />
        <OnboardingRow
          title="Link other Projects"
          desc="Add your dependency to other Projects, the organization flow will be automatically updated"
          done={false}
        />

        {job && job.status === 'success' && (
          <div className={cls.go}>
            <Button display="primary" onClick={onGo}>
              Go to your project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
