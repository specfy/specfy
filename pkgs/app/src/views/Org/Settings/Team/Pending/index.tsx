import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ApiInvitation } from '@specfy/api/src/types/api';
import { IconDotsVertical } from '@tabler/icons-react';
import { Button, Checkbox, Skeleton, Table } from 'antd';
import { useState } from 'react';

import {
  roleReadable,
  deleteInvitations,
  useListInvitations,
} from '../../../../../api';
import { isError } from '../../../../../api/helpers';
import { i18n } from '../../../../../common/i18n';
import { AvatarAuto } from '../../../../../components/AvatarAuto';
import { Card } from '../../../../../components/Card';
import { Empty } from '../../../../../components/Empty';
import { Flex } from '../../../../../components/Flex';
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
        {list.isLoading && <Skeleton title={false} paragraph={{ rows: 3 }} />}
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
                    <Button size="small" danger onClick={onRemoveSelected}>
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
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="rx_dropdownButton">
                          <IconDotsVertical />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="rx_dropdownMenuContent"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item className="rx_dropdownMenuItem">
                            <Button
                              danger
                              type="link"
                              block
                              size="small"
                              onClick={() => onRemoveOne(item)}
                            >
                              Remove
                            </Button>
                          </DropdownMenu.Item>

                          <DropdownMenu.Arrow className="rx_dropdownMenuArrow" />
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
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
