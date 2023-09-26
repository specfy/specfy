import * as Form from '@radix-ui/react-form';
import { useState } from 'react';

import type { FieldsErrors } from '@specfy/core';
import type { ApiOrg, ApiPerm } from '@specfy/models';

import { createInvitation } from '@/api';
import { handleErrors, isError } from '@/api/helpers';
import { selectPerms } from '@/common/perms';
import { Card } from '@/components/Card';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { Input } from '@/components/Form/Input';
import { SelectFull } from '@/components/Form/Select';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

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
        <h4>Add team members</h4>
        <Form.Root className={cls.form} onSubmit={onSubmit}>
          <Field name="email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="m"
            />
          </Field>

          <SelectFull
            value={role}
            defaultValue="viewer"
            placeholder="Select a role"
            options={selectPerms}
            onValueChange={(val) => setRole(val as any)}
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
