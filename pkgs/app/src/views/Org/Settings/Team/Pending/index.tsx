import type { ApiInvitation } from '@specfy/api/src/types/api';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import Skeleton from 'react-loading-skeleton';

import {
  roleReadable,
  deleteInvitations,
  useListInvitations,
} from '../../../../../api';
import { isError } from '../../../../../api/helpers';
import { i18n } from '../../../../../common/i18n';
import { AvatarAuto } from '../../../../../components/AvatarAuto';
import { Card } from '../../../../../components/Card';
import * as Dropdown from '../../../../../components/Dropdown';
import { Empty } from '../../../../../components/Empty';
import { Flex } from '../../../../../components/Flex';
import { Button } from '../../../../../components/Form/Button';
import { useToast } from '../../../../../hooks/useToast';
import type { RouteOrg } from '../../../../../types/routes';

import cls from './index.module.scss';

const Row: React.FC<{
  item: ApiInvitation;
  onRemove: (item: ApiInvitation) => void;
}> = ({ item, onRemove }) => {
  return (
    <Flex className={cls.row} justify="space-between" align="center">
      <div>
        <Flex gap="l">
          <AvatarAuto name={item.email} />
          {item.email}
        </Flex>
      </div>
      <Flex gap="l">
        <span>{roleReadable[item.role]}</span>

        <div>
          <Dropdown.Menu>
            <Dropdown.Trigger asChild>
              <Button display="ghost">
                <IconDotsVertical />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content>
                <Dropdown.Group>
                  <Dropdown.Item asChild>
                    <Button
                      danger
                      display="item"
                      block
                      onClick={() => onRemove(item)}
                      size="s"
                    >
                      <IconTrash /> Remove
                    </Button>
                  </Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Menu>
        </div>
      </Flex>
    </Flex>
  );
};

export const SettingsTeamPending: React.FC<{ params: RouteOrg }> = ({
  params,
}) => {
  const toast = useToast();
  const list = useListInvitations({ org_id: params.org_id });

  const onRemoveOne = async (item: ApiInvitation) => {
    const res = await deleteInvitations({ invitation_id: item.id });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Invitation removed', status: 'success' });
    void list.refetch();
  };

  return (
    <div className={cls.invite}>
      <Card>
        {list.isLoading && (
          <div style={{ margin: '20px' }}>
            <Skeleton count={3} />
          </div>
        )}
        {!list.isLoading && (!list.data || list.data.data.length <= 0) && (
          <Empty title="No pending invitations found" />
        )}

        {list && (
          <div className={cls.list}>
            {list.data?.data.map((item) => {
              return <Row item={item} key={item.id} onRemove={onRemoveOne} />;
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
