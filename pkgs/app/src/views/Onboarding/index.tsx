import { IconSquareRoundedPlus } from '@tabler/icons-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { TryDemo } from '@/components/Onboarding/TryDemo';
import { Header } from '@/components/Sidebar/Header';

import cls from './index.module.scss';

const Onboarding: React.FC = () => {
  return (
    <div>
      <Helmet title={`Onboarding ${titleSuffix}`} />
      <div style={{ width: '250px', position: 'absolute' }}>
        <Header />
      </div>

      <ContainerChild fullCenter>
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
      </ContainerChild>
    </div>
  );
};

export default Onboarding;
