import type { ApiOrg, ApiPerm, FieldsErrors } from '@specfy/api/src/types/api';
import { Button, Form, Typography } from 'antd';
import { useState } from 'react';

import { createInvitation } from '../../../api';
import { isError, isValidationError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { selectPerms } from '../../../common/perms';
import { Card } from '../../../components/Card';
import { useToast } from '../../../hooks/useToast';
import { Input } from '../../Form/Input';
import { SelectFull } from '../../Form/Select';

import cls from './index.module.scss';

export const TeamInvite: React.FC<{
  org: ApiOrg;
  onInvite?: () => void;
}> = ({ org, onInvite }) => {
  const toast = useToast();

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
        toast.add({ title: i18n.errorOccurred, status: 'error' });
      }
      return;
    }

    toast.add({ title: 'User invited', status: 'success' });
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

          <SelectFull
            value={role}
            defaultValue="viewer"
            placeholder="Select a role"
            options={selectPerms}
            onValueChange={(val) => setRole(val as any)}
          />
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
