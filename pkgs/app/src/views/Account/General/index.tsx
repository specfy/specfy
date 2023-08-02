import * as Form from '@radix-ui/react-form';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { deleteMe, updateMe } from '../../../api';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import * as Dialog from '../../../components/Dialog';
import { Button } from '../../../components/Form/Button';
import { Field } from '../../../components/Form/Field';
import { Input } from '../../../components/Form/Input';
import { Subdued } from '../../../components/Text';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, tryLogin } = useAuth();

  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const me = user!;
  const [name, setName] = useState(() => me.name);
  const [email] = useState(() => me.email);
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };

  const handleRename: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await updateMe({ name });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    tryLogin();
    toast.add({ title: 'Account renamed', status: 'success' });
  };
  const handleReset = () => {
    setName(me.name);
  };

  const changed = useMemo(() => {
    return name !== me.name || email !== me.email;
  }, [name, email]);

  // Delete modal
  const onOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(() => setWaitToRead(false), 2000);
    } else {
      setWaitToRead(true);
    }
  };

  const confirmDelete = async () => {
    const res = await deleteMe();
    if (res !== 204) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Account deleted', status: 'success' });
    navigate(`/login`);
  };

  return (
    <>
      <Helmet title={`Account ${titleSuffix}`} />
      <div>
        <div>
          <h2>General Settings</h2>
          <Subdued>Manage your account general&apos;s settings</Subdued>
        </div>
      </div>

      <Card>
        <Form.Root onSubmit={handleRename}>
          <Card.Content>
            <Field name="name" label="Display Name">
              <Input value={name} onChange={onName} />
            </Field>
            <Field name="email" label="Email">
              <Input value={email} onChange={onName} disabled />
            </Field>
          </Card.Content>

          <Card.Actions>
            {changed && (
              <Button display="ghost" onClick={handleReset}>
                reset
              </Button>
            )}
            <Button display="primary" type="submit" disabled={!changed}>
              Update
            </Button>
          </Card.Actions>
        </Form.Root>
      </Card>

      <Card padded>
        <div className={cls.actions}>
          <div>
            <h4>Delete your account</h4>
            <Subdued>This operation can&apos;t be undone.</Subdued>
          </div>
          <Dialog.Dialog onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>
              <Button danger>Delete Account</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete your Account?</Dialog.Title>
                <Dialog.Description>
                  Are you sure to delete your account? <br></br>This operation
                  can&apos;t be undone.
                </Dialog.Description>
              </Dialog.Header>
              <div></div>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button key="back" display="ghost">
                    cancel
                  </Button>
                </Dialog.Close>
                <Button
                  danger
                  key="submit"
                  display="primary"
                  disabled={waitToRead}
                  onClick={confirmDelete}
                  loading={waitToRead}
                >
                  Delete Account
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Dialog>
        </div>
      </Card>
    </>
  );
};
