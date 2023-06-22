import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import classNames from 'classnames';
import { useState } from 'react';

import cls from './index.module.scss';

export const Group: React.FC<{
  children: React.ReactElement | React.ReactElement[];
  name: string;
  actions?: React.ReactElement;
}> = ({ children, name, actions }) => {
  const [open, setOpen] = useState(true);
  const onClick = () => {
    setOpen(!open);
  };

  return (
    <div className={classNames(cls.group, !open && cls.hide)}>
      <div className={cls.head} role="button" tabIndex={0} onClick={onClick}>
        {name}
        <div className={cls.chevron}>
          {open ? <IconChevronDown /> : <IconChevronRight />}
        </div>
        {actions && <div className={cls.actions}>{actions}</div>}
      </div>
      <div className={cls.sub}>{children}</div>
    </div>
  );
};
