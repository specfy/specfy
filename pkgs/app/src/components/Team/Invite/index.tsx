import * as Form from '@radix-ui/react-form';
import type { FieldsErrors } from '@specfy/core';
import type { ApiOrg, ApiPerm } from '@specfy/models';
import { useState } from 'react';

import { createInvitation } from '../../../api';
import { handleErrors, isError } from '../../../api/helpers';
import { Card } from '../../../components/Card';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../Form/Button';
import { Field } from '../../Form/Field';
import { Input } from '../../Form/Input';
import { SelectFull } from '../../Form/Select';

import cls from './index.module.scss';

import { selectPerms } from '@/common/perms';

export const TeamInvite: React.FC<{
  org: ApiOrg;
  onInvite?: () => void;
}> = ({ org, onInvite }) => {
  const toast = useToast();

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<ApiPerm['role']>('viewer');
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);

    const res = await createInvitation({
      email,
      role,
      orgId: org.id,
    });
    setLoading(false);
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    toast.add({ title: 'User invited', status: 'success' });
    setErrors({});
    setEmail('');

    if (onInvite) {
      onInvite();
    }
  };
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSubmit();
  };
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Card>
      <Card.Content>
        <h3>Add team members</h3>
        <Form.Root className={cls.form} onSubmit={onSubmit}>
          <Field name="email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="l"
            />
          </Field>

          <SelectFull
            value={role}
            defaultValue="viewer"
            placeholder="Select a role"
            options={selectPerms}
            onValueChange={(val) => setRole(val as any)}
            size="l"
          />
        </Form.Root>
      </Card.Content>
      <Card.Actions>
        <Button onClick={onClick} display="primary" loading={loading}>
          Invite
        </Button>
      </Card.Actions>
    </Card>
  );
};
