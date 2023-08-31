import { IconColorSwatch, IconSquareRoundedPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { createDemo } from '../../api';
import { isError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { titleSuffix } from '../../common/string';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { Flex } from '../../components/Flex';
import { Button } from '../../components/Form/Button';
import { Header } from '../../components/Sidebar/Header';
import { useToast } from '../../hooks/useToast';

import cls from './index.module.scss';

export const TryDemo: React.FC = () => {
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

export const Onboarding: React.FC = () => {
  return (
    <div>
      <Helmet title={`Onboarding ${titleSuffix}`} />
      <div style={{ width: '250px', position: 'absolute' }}>
        <Header />
      </div>

      <Container.Center>
        <div style={{ width: '320px' }}>
          <header>
            <h1>Welcome to Specfy</h1>
          </header>
          <br />
          <Card padded large>
            <Flex gap="xl" align="flex-start" column>
              <div>
                <h4>Get started right now</h4>
                <Link to="/organizations/create">
                  <Button className={cls.action} size="l" display="primary">
                    <IconSquareRoundedPlus /> Create your organization
                  </Button>
                </Link>
              </div>
              <TryDemo />
            </Flex>
          </Card>
        </div>
      </Container.Center>
    </div>
  );
};
