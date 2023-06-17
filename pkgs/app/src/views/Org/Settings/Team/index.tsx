import * as Tabs from '@radix-ui/react-tabs';
import { Typography } from 'antd';

import { Container } from '../../../../components/Container';
import type { RouteOrg } from '../../../../types/routes';

import { SettingsTeamList } from './List';
import { SettingsTeamPending } from './Pending';
import cls from './index.module.scss';

export const SettingsTeam: React.FC<{ params: RouteOrg }> = ({ params }) => {
  return (
    <Container noPadding>
      <div className={cls.team}>
        <div className={cls.header}>
          <div>
            <Typography.Title level={2}>Team members</Typography.Title>
            <Typography.Text type="secondary">
              Invite or manage your project&apos;s members.
            </Typography.Text>
          </div>
        </div>

        <Tabs.Root className="rx_tabsRoot" defaultValue="tab1">
          <Tabs.List className="rx_tabsList" aria-label="Manage your account">
            <Tabs.Trigger className="rx_tabsTrigger" value="tab1">
              Members
            </Tabs.Trigger>
            <Tabs.Trigger className="rx_tabsTrigger" value="tab2">
              Invitation
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="rx_tabsContent" value="tab1">
            <SettingsTeamList params={params} />
          </Tabs.Content>
          <Tabs.Content className="rx_tabsContent" value="tab2">
            <SettingsTeamPending params={params} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Container>
  );
};
