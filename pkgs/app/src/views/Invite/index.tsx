import { IconArrowRight } from '@tabler/icons-react';
import { Button } from 'antd';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import {
  acceptInvitations,
  declineInvitations,
  useGetInvitation,
} from '../../api';
import { isError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { titleSuffix } from '../../common/string';
import { AvatarAuto } from '../../components/AvatarAuto';
import { Card } from '../../components/Card';
import { Flex } from '../../components/Flex';
import { NotFound } from '../../components/NotFound';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

import cls from './index.module.scss';

export const Invite: React.FC = () => {
  const toast = useToast();
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
      <Flex align="center" justify="center" className={cls.container} column>
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

  const inv = res.data.data;

  const onAccept = async () => {
    const del = await acceptInvitations({
      invitation_id: invitationId,
      token,
    });
    if (isError(del)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    navigate(`/${inv.orgId}`);
  };

  const onDecline = async () => {
    const del = await declineInvitations({
      invitation_id: invitationId,
      token,
    });
    if (isError(del)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Invitation declined', status: 'success' });
    navigate(`/`);
  };

  return (
    <Flex align="center" justify="center" className={cls.container} column>
      <Helmet title={`Join ${inv.org.name} ${titleSuffix}`} />

      <div>
        <Card>
          <Card.Content large>
            <h2>Join an organization</h2>
            <p>
              <strong>{inv.by.name}</strong> ({inv.by.email}) invited you to
              join the organization <strong>{inv.org.name}</strong>.
            </p>

            <Flex
              align="center"
              justify="center"
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
