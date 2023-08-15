import type { ApiJob } from '@specfy/models';
import classNames from 'classnames';

import { Loading } from '../../Loading';

import cls from './index.module.scss';

export const StatusTag: React.FC<{
  status: ApiJob['status'];
}> = ({ status }) => {
  return (
    <div className={classNames(cls.status)}>
      {status !== 'running' && (
        <div className={classNames(cls.dot, cls[status])}></div>
      )}
      {status === 'running' && <Loading />}
      {status}
    </div>
  );
};
