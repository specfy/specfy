import type { ApiOrg } from '@specfy/models';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListPerms, useListProjects } from '../../../api';
import { Flex } from '../../Flex';
import { Button } from '../../Form/Button';

import cls from './index.module.scss';

import { OnboardingRow } from '@/components/Onboarding/Row';
import { Subdued } from '@/components/Text';

export const OrgOnboarding: React.FC<{ org: ApiOrg }> = ({ org }) => {
  const projects = useListProjects({ org_id: org.id });
  const perms = useListPerms({ org_id: org.id });
  const [done, setDone] = useLocalStorage(`org.onboarding[${org.id}]`, false);

  const [link] = useState(org.githubInstallationId);
  const [project, setProject] = useState(false);
  const [team, setTeam] = useState(false);

  useEffect(() => {
    if (!projects.data) {
      return;
    }

    setProject(projects.data.data.length > 0);
  }, [projects.isFetching]);
  useEffect(() => {
    if (!perms.data) {
      return;
    }

    setTeam(perms.data.data.length > 1);
  }, [perms.isFetching]);

  useEffect(() => {
    if (link && project && team) {
      setDone(true);
    }
  }, [link, project, team]);

  if ((link && project && team) || done) {
    return null;
  }

  return (
    <div className={cls.onboarding}>
      <Flex className={cls.header} justify="space-between">
        <div>
          <h2>Welcome</h2>
          <Subdued>Follow the steps to get ready to use Specfy</Subdued>
        </div>
        <div>
          <Button onClick={() => setDone(true)} size="s" display="ghost">
            skip
          </Button>
        </div>
      </Flex>

      <OnboardingRow
        title="Link your Github organization"
        desc="Sync your projects, avatar, team members"
        done={link !== null}
        action={
          <Link to={`/${org.id}/_/settings`}>
            <Button>
              Settings <IconArrowNarrowRight />
            </Button>
          </Link>
        }
      />

      <OnboardingRow
        title="Create your first project"
        desc="Deploy documentation and track the stack of a Github repository"
        done={project}
        action={
          <Link to={`/${org.id}/_/project/new`}>
            <Button>
              Create <IconArrowNarrowRight />
            </Button>
          </Link>
        }
      />

      <OnboardingRow
        title="Invite team members"
        desc="Let them know you are using Specfy"
        done={team}
        action={
          <Link to={`/${org.id}/_/settings/team`}>
            <Button>
              Invite <IconArrowNarrowRight />
            </Button>
          </Link>
        }
      />
    </div>
  );
};
