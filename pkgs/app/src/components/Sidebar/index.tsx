import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import classNames from 'classnames';
import { useState } from 'react';

import { Feedback } from '../Feedback';
import { Flex } from '../Flex';
import { Button } from '../Form/Button';
import { Help } from '../Help';

import { Header } from './Header';
import cls from './index.module.scss';

export * from './Block';
export * from './Group';

export const Sidebar: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [collapse, setCollapse] = useState<boolean>(false);

  const onCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <div className={cls.wrapper}>
      <div className={classNames(cls.collapser, collapse && cls.collapsed)}>
        <Button size="s" display="ghost" onClick={onCollapse}>
          {collapse ? <IconChevronRight /> : <IconChevronLeft />}
        </Button>
      </div>
      <div className={classNames(cls.sidebar, collapse && cls.collapsed)}>
        <div className={cls.inner}>
          <Header />
          <div className={cls.content}>{children}</div>
        </div>
        <Flex className={cls.bottom} gap="m">
          <Feedback />
          <Help />
        </Flex>
      </div>
    </div>
  );
};
