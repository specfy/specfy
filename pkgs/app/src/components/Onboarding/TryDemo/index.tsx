import { IconColorSwatch } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createDemo } from '@/api';
import { isError } from '@/api/helpers';
import { i18n } from '@/common/i18n';
import { socket } from '@/common/socket';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

export const TryDemo: React.FC = () => {
  const { tryLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState<boolean>(false);

  const onClickDemo = async () => {
    setLoading(true);
    const res = await createDemo();
    setLoading(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Your demo is ready', status: 'success' });
    setTimeout(() => {
      // Refresh permissions
      tryLogin();

      socket.emit('join', { orgId: res.data.id });
    }, 1);
    navigate(`/${res.data.id}`);
  };

  return (
    <Flex column gap="s">
      <p>Want to try without setup?</p>
      <Button
        className={cls.action}
        size="m"
        onClick={onClickDemo}
        loading={loading}
      >
        <IconColorSwatch />
        Try the demo
      </Button>
    </Flex>
  );
};
