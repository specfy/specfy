import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Select from '@radix-ui/react-select';
import { IconChevronDown, IconDotsVertical } from '@tabler/icons-react';
import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  Skeleton,
  Table,
  Typography,
} from 'antd';
import type { ApiInvitation, ApiPerm, FieldsErrors } from 'api/src/types/api';
import { useState } from 'react';

import { roleReadable } from '../../../../../api';
import { isError, isValidationError } from '../../../../../api/helpers';
import {
  createInvitation,
  deleteInvitations,
  useListInvitations,
} from '../../../../../api/invitations';
import { i18n } from '../../../../../common/i18n';
import { AvatarAuto } from '../../../../../components/AvatarAuto';
import { Card } from '../../../../../components/Card';
import { Empty } from '../../../../../components/Empty';
import { Flex } from '../../../../../components/Flex';
import type { RouteOrg } from '../../../../../types/routes';

import cls from './index.module.scss';

export const SettingsTeamPending: React.FC<{ params: RouteOrg }> = ({
  params,
}) => {
  const { message } = App.useApp();

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<ApiPerm['role']>('viewer');
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [selected, setSelected] = useState<string[]>([]);

  const list = useListInvitations({ org_id: params.org_id });

  const onInvite = async () => {
    const res = await createInvitation({
      email,
      role,
      orgId: params.org_id,
    });
    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        message.error(i18n.errorOccurred);
      }
      return;
    }

    message.success('User invited');
    setErrors({});
    setEmail('');
  };

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
      console.log(sel);
      const res = await deleteInvitations({ invitation_id: sel });
      if (isError(res)) {
        message.error(i18n.errorOccurred);
        list.refetch();
        return;
      }
    }

    message.success('Invitations removed');
    list.refetch();
  };
  const onRemoveOne = async (item: ApiInvitation) => {
    const res = await deleteInvitations({ invitation_id: item.id });
    if (isError(res)) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.success('Invitation removed');
    list.refetch();
  };

  return (
    <div className={cls.invite}>
      <Card>
        <Card.Content>
          <Typography.Title level={3}>Invite new people</Typography.Title>
          <div className={cls.form}>
            <Form.Item
              help={errors.email?.message}
              validateStatus={errors.email && 'error'}
            >
              <Input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Select.Root
              value={role}
              defaultValue="viewer"
              onValueChange={(val) => setRole(val as any)}
            >
              <Select.Trigger className="rx_selectTrigger" aria-label="Food">
                <Select.Value placeholder="Select a role" />
                <Select.Icon className="rx_selectIcon">
                  <IconChevronDown />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="rx_selectContent">
                  <Select.Viewport>
                    <Select.Item className="rx_selectItem" value="owner">
                      <Select.ItemText>Owner</Select.ItemText>
                    </Select.Item>
                    <Select.Item className="rx_selectItem" value="contributor">
                      <Select.ItemText>Contributor</Select.ItemText>
                    </Select.Item>
                    <Select.Item className="rx_selectItem" value="viewer">
                      <Select.ItemText>Viewer</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </Card.Content>
        <Card.Actions transparent>
          <Button onClick={onInvite} type="primary">
            Invite
          </Button>
        </Card.Actions>
      </Card>

      <Card>
        {list.isFetching && <Skeleton title={false} paragraph={{ rows: 3 }} />}
        {!list.isFetching && (!list.data || list.data.data.length <= 0) ? (
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
                <Flex justifyContent="space-between" grow={1}>
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
