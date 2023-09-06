import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import classNames from 'classnames';

import { Feedback } from '../Feedback';
import { Flex } from '../Flex';
import { Button } from '../Form/Button';
import { Help } from '../Help';

import { Header } from './Header';
import cls from './index.module.scss';

import { useGlobal } from '@/common/store/global';

export * from './Block';
export * from './Group';

export const Sidebar: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { sidebarCollapsed, update } = useGlobal();

  const onCollapse = () => {
    update('sidebarCollapsed', !sidebarCollapsed);
  };

  return (
    <div className={cls.wrapper}>
      <div
        className={classNames(cls.collapser, sidebarCollapsed && cls.collapsed)}
      >
        <Button size="s" display="ghost" onClick={onCollapse}>
          {sidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </Button>
      </div>
      <div
        className={classNames(cls.sidebar, sidebarCollapsed && cls.collapsed)}
      >
        <div className={cls.inner}>
          <Header />
          <div className={cls.content}>{children}</div>
          <Flex className={cls.bottom} gap="m">
            <Feedback />
            <Help />
          </Flex>
        </div>
      </div>
    </div>
  );
};
