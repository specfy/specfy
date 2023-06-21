import * as Select from '@radix-ui/react-select';
import { IconChevronDown } from '@tabler/icons-react';
import { App, Button, Form, Input, Typography } from 'antd';
import type { ApiOrg, ApiPerm, FieldsErrors } from 'api/src/types/api';
import { useState } from 'react';

import { isError, isValidationError } from '../../../api/helpers';
import { createInvitation } from '../../../api/invitations';
import { i18n } from '../../../common/i18n';
import { Card } from '../../../components/Card';

import cls from './index.module.scss';

export const TeamInvite: React.FC<{
  org: ApiOrg;
  onInvite?: () => void;
}> = ({ org, onInvite }) => {
  const { message } = App.useApp();

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<ApiPerm['role']>('viewer');
  const [errors, setErrors] = useState<FieldsErrors>({});

  const handleInvite = async (e: any) => {
    e.preventDefault();

    const res = await createInvitation({
      email,
      role,
      orgId: org.id,
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

    if (onInvite) {
      onInvite();
    }
  };

  return (
    <Card>
      <Card.Content>
        <Typography.Title level={3}>Add team members</Typography.Title>
        <form className={cls.form} onSubmit={handleInvite}>
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
                  <Select.Item
                    className="rx_selectItem"
                    value="owner"
                    disabled={org.isPersonal}
                  >
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
        </form>
      </Card.Content>
      <Card.Actions>
        <Button onClick={handleInvite} type="primary">
          Invite
        </Button>
      </Card.Actions>
    </Card>
  );
};
