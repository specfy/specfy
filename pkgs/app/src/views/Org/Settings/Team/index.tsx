import * as Tabs from '@radix-ui/react-tabs';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { Typography } from 'antd';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { titleSuffix } from '../../../../common/string';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { TeamInvite } from '../../../../components/Team/Invite';
import type { RouteOrg } from '../../../../types/routes';

import { SettingsTeamList } from './List';
import { SettingsTeamPending } from './Pending';
import cls from './index.module.scss';

export const SettingsTeam: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const [tab, setTab] = useState('tab1');
  const onInvite = () => {
    setTab('tab2');
  };

  return (
    <Container noPadding>
      <Helmet title={`Team - ${org.name} ${titleSuffix}`} />

      <Flex className={cls.team} gap="xl" column>
        <div className={cls.header}>
          <div>
            <Typography.Title level={2}>Team members</Typography.Title>
            <Typography.Text type="secondary">
              Invite or manage your project&apos;s members.
            </Typography.Text>
          </div>
        </div>

        <TeamInvite org={org} onInvite={onInvite} />

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
            <Tabs.Trigger className="rx_tabsTrigger" value="tab2">
              Invitations
            </Tabs.Trigger>
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
