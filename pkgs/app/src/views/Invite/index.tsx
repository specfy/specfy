import { IconArrowRight } from '@tabler/icons-react';
import { App, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import { isError } from '../../api/helpers';
import {
  acceptInvitations,
  deleteInvitations,
  useGetInvitation,
} from '../../api/invitations';
import { i18n } from '../../common/i18n';
import { AvatarAuto } from '../../components/AvatarAuto';
import { Card } from '../../components/Card';
import { Flex } from '../../components/Flex';
import { NotFound } from '../../components/NotFound';
import { useAuth } from '../../hooks/useAuth';

import cls from './index.module.scss';

export const Invite: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();
  const invitationId = useSearchParam('invitation_id')!;
  const token = useSearchParam('token')!;
  const res = useGetInvitation({
    invitation_id: invitationId,
    token,
  });

  if (!invitationId || !token || res.error) {
    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        className={cls.container}
        direction="column"
      >
        <NotFound
          title="Invitation not found"
          message="The invitation does not exists or is expired"
        />
      </Flex>
    );
  }

  if (res.isFetching || !res.data?.data) {
    return null;
  }

  const inv = res.data!.data;

  const onAccept = async () => {
    const del = await acceptInvitations({
      invitation_id: invitationId,
      token,
    });
    if (isError(del)) {
      message.error(i18n.errorOccurred);
      return;
    }

    navigate(`/${inv.orgId}`);
  };

  const onDecline = async () => {
    const del = await deleteInvitations({
      invitation_id: invitationId,
      token,
    });
    if (isError(del)) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.error('Invitation declined');
    navigate(`/`);
  };

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      className={cls.container}
      direction="column"
    >
      <div>
        <Card>
          <Card.Content large>
            <Typography.Title level={2}>Join an organization</Typography.Title>
            <p>
              <strong>{inv.by.name}</strong> ({inv.by.email}) invited you to
              join the organization <strong>Company</strong>.
            </p>

            <Flex
              alignItems="center"
              justifyContent="center"
              gap="l"
              className={cls.content}
            >
              <AvatarAuto name={user!.name} src={user?.avatarUrl} size="xl" />
              <IconArrowRight />
              <AvatarAuto org={inv.org} size="xl" />
            </Flex>
          </Card.Content>
          <Card.Actions>
            <Button type="ghost" onClick={onDecline}>
              Decline
            </Button>
            <Button type="primary" onClick={onAccept}>
              Join
            </Button>
          </Card.Actions>
        </Card>
      </div>
    </Flex>
  );
};
