import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import type { ApiOrg } from '@specfy/models';

import { titleSuffix } from '@/common/string';
import { Banner } from '@/components/Banner';
import { Container } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { TeamInvite } from '@/components/Team/Invite';
import { Subdued } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import type { RouteOrg } from '@/types/routes';

import { SettingsTeamList } from './List';
import { SettingsTeamPending } from './Pending';
import cls from './index.module.scss';

export const SettingsTeam: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const { currentPerm } = useAuth();
  const [tab, setTab] = useState('tab1');
  const onInvite = () => {
    setTab('tab2');
  };
  const isOwner = currentPerm?.role === 'owner';

  return (
    <Container noPadding>
      <Helmet title={`Team - ${org.name} ${titleSuffix}`} />

      <Flex className={cls.team} gap="xl" column>
        <div className={cls.header}>
          <div>
            <h2>Team members</h2>
            <Subdued>Invite or manage your project&apos;s members.</Subdued>
          </div>
        </div>

        {isOwner ? (
          <TeamInvite org={org} onInvite={onInvite} />
        ) : (
          <Banner>Only the owner can invite new people to the team</Banner>
        )}

        <Tabs.Root
          className="rx_tabsRoot"
          defaultValue="tab1"
          value={tab}
          onValueChange={setTab}
        >
          <Tabs.List className="rx_tabsList" aria-label="Manage your account">
            <Tabs.Trigger className="rx_tabsTrigger" value="tab1">
              Members
            </Tabs.Trigger>
            {isOwner && (
              <Tabs.Trigger className="rx_tabsTrigger" value="tab2">
                Invitations
              </Tabs.Trigger>
            )}
          </Tabs.List>
          <Tabs.Content className="rx_tabsContent" value="tab1">
            <SettingsTeamList params={params} />
          </Tabs.Content>
          <Tabs.Content className="rx_tabsContent" value="tab2">
            <SettingsTeamPending params={params} />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Container>
  );
};
