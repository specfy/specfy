import { IconCheck } from '@tabler/icons-react';
import classNames from 'classnames';

import cls from './index.module.scss';

export const OnboardingRow: React.FC<{
  done: boolean;
  title: string;
  desc: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ done, title, desc, action, children }) => {
  return (
    <div className={cls.item}>
      <div className={cls.line}></div>
      <div className={classNames(cls.check, !done && cls.pending)}>
        {!done ? <div className={cls.donut}></div> : <IconCheck />}
      </div>
      <div className={cls.desc}>
        <div>{title}</div>
        <div className={cls.sub}>{desc}</div>
        {children}
      </div>
      <div>{action}</div>
    </div>
  );
};
