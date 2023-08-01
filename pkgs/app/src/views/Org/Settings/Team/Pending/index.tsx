import type { ApiInvitation } from '@specfy/api/src/types/api';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { Table } from 'antd';
import { useState } from 'react';
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
import { Checkbox } from '../../../../../components/Form/Checkbox';
import { useToast } from '../../../../../hooks/useToast';
import type { RouteOrg } from '../../../../../types/routes';

import cls from './index.module.scss';

export const SettingsTeamPending: React.FC<{ params: RouteOrg }> = ({
  params,
}) => {
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const list = useListInvitations({ org_id: params.org_id });

  const checked =
    selected.length > 0 && list.data?.data.length === selected.length;
  const indeterminate =
    selected.length > 0 && list.data?.data.length !== selected.length;

  const onSelectAll = () => {
    if (checked) {
      setSelected([]);
      return;
    }
    setSelected(list.data!.data.map((inv) => inv.id));
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelected(newSelectedRowKeys as string[]);
  };

  const onRemoveSelected = async () => {
    for (const sel of selected) {
      const res = await deleteInvitations({ invitation_id: sel });
      if (isError(res)) {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
        void list.refetch();
        return;
      }
    }

    toast.add({ title: 'Invitations removed', status: 'success' });
    void list.refetch();
  };
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
        {!list.isLoading && (!list.data || list.data.data.length <= 0) ? (
          <Empty title="No pending invitations found" />
        ) : (
          <Table
            dataSource={list.data?.data}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: onSelectChange,
            }}
            showHeader={false}
            rowKey="id"
            title={() => {
              return (
                <Flex justify="space-between" grow>
                  <Checkbox
                    onClick={onSelectAll}
                    indeterminate={indeterminate}
                    checked={checked}
                  />
                  {selected.length > 0 && (
                    <Button size="s" danger onClick={onRemoveSelected}>
                      Remove {selected.length} invitations
                    </Button>
                  )}
                </Flex>
              );
            }}
          >
            <Table.Column
              dataIndex="email"
              key="email"
              render={(_, item: ApiInvitation) => {
                return (
                  <Flex gap="l">
                    <AvatarAuto name={item.email} />
                    {item.email}
                  </Flex>
                );
              }}
            />
            <Table.Column
              dataIndex="role"
              key="role"
              width={100}
              render={(_, item: ApiInvitation) => {
                return <>{roleReadable[item.role]}</>;
              }}
            />
            <Table.Column
              dataIndex="expiresAt"
              key="expiresAt"
              width={40}
              render={(_, item: ApiInvitation) => {
                return (
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
                                onClick={() => onRemoveOne(item)}
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
                );
              }}
            />
          </Table>
        )}
      </Card>
    </div>
  );
};
